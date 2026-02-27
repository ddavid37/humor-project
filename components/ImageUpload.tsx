'use client'

import { useState, useRef } from 'react'

const API_BASE = 'https://api.almostcrackd.ai'

const STEP_LABELS = ['Get upload URL', 'Upload image', 'Register image', 'Generate captions']

interface CaptionRecord {
    caption?: string
    content?: string
    text?: string
    body?: string
    [key: string]: unknown
}

interface Props {
    accessToken: string
}

export function ImageUpload({ accessToken }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
    const [step, setStep] = useState(0)
    const [captions, setCaptions] = useState<CaptionRecord[]>([])
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setFile(f)
        setPreviewUrl(f ? URL.createObjectURL(f) : null)
        setCaptions([])
        setError(null)
        setStatus('idle')
        setStep(0)
    }

    const handleUpload = async () => {
        if (!file) return
        setStatus('uploading')
        setError(null)
        setCaptions([])

        try {
            // Step 1: Get a presigned S3 upload URL + the future public CDN URL
            setStep(1)
            const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentType: file.type }),
            })
            if (!presignRes.ok) throw new Error(`Step 1 failed: ${await presignRes.text()}`)
            const { presignedUrl, cdnUrl } = await presignRes.json()

            // Step 2: Upload raw image bytes directly to S3 via the presigned URL
            setStep(2)
            const uploadRes = await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            })
            if (!uploadRes.ok) throw new Error(`Step 2 failed: ${uploadRes.statusText}`)

            // Step 3: Tell the pipeline about the uploaded image so it gets an imageId
            setStep(3)
            const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
            })
            if (!registerRes.ok) throw new Error(`Step 3 failed: ${await registerRes.text()}`)
            const { imageId } = await registerRes.json()

            // Step 4: Ask the pipeline to generate captions for the registered image
            setStep(4)
            const captionsRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageId }),
            })
            if (!captionsRes.ok) throw new Error(`Step 4 failed: ${await captionsRes.text()}`)
            const data = await captionsRes.json()
            setCaptions(Array.isArray(data) ? data : [data])
            setStatus('done')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            setStatus('error')
        }
    }

    const getCaptionText = (c: CaptionRecord) =>
        String(
            c.caption ?? c.content ?? c.text ?? c.body ??
            Object.values(c).find(v => typeof v === 'string') ?? ''
        )

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-1">Upload & Generate Captions</h2>
            <p className="text-sm text-gray-500 mb-5">
                Pick an image — we&apos;ll send it through the caption pipeline and show you the results.
            </p>

            {/* File picker */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Choose an image to upload"
            />
            <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 rounded-lg border-2 border-dashed border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium"
            >
                {file ? `📎 ${file.name}` : '+ Choose an image'}
            </button>

            {/* Preview */}
            {previewUrl && (
                <div className="mt-4">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 rounded-lg object-contain border border-gray-200"
                    />
                </div>
            )}

            {/* Upload button */}
            {file && status !== 'uploading' && (
                <button
                    onClick={handleUpload}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                    ✨ Generate Captions
                </button>
            )}

            {/* Step progress */}
            {status === 'uploading' && (
                <div className="mt-5">
                    <p className="text-sm text-gray-500 mb-3">Working through the pipeline…</p>
                    <div className="flex items-center gap-1 flex-wrap">
                        {STEP_LABELS.map((label, i) => {
                            const s = i + 1
                            const done = step > s
                            const active = step === s
                            return (
                                <div key={s} className="flex items-center gap-1">
                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                                        ${done ? 'bg-green-100 text-green-700' : active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px]
                                            ${done ? 'bg-green-500 text-white' : active ? 'bg-white text-indigo-600 animate-pulse' : 'bg-gray-300 text-gray-500'}`}>
                                            {done ? '✓' : s}
                                        </span>
                                        {label}
                                    </div>
                                    {s < 4 && <span className="text-gray-300 text-xs">›</span>}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                        onClick={handleUpload}
                        className="mt-2 text-xs text-red-500 underline hover:text-red-700"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Results */}
            {status === 'done' && captions.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-3">
                        🎉 {captions.length} caption{captions.length !== 1 ? 's' : ''} generated:
                    </h3>
                    <ul className="space-y-2">
                        {captions.map((c, i) => (
                            <li
                                key={i}
                                className="p-3 bg-indigo-50 rounded-lg text-gray-800 border border-indigo-100 text-sm"
                            >
                                {getCaptionText(c)}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => {
                            setFile(null)
                            setPreviewUrl(null)
                            setCaptions([])
                            setStatus('idle')
                            setStep(0)
                            if (inputRef.current) inputRef.current.value = ''
                        }}
                        className="mt-4 text-sm text-indigo-500 underline hover:text-indigo-700"
                    >
                        Upload another image
                    </button>
                </div>
            )}
        </div>
    )
}
