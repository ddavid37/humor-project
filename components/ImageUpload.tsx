'use client'

import { useState, useRef } from 'react'

const API_BASE = 'https://api.almostcrackd.ai'
const STEPS = ['URL', 'Upload', 'Register', 'Captions']

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
            setStep(1)
            const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType: file.type }),
            })
            if (!presignRes.ok) throw new Error(`Step 1 failed: ${await presignRes.text()}`)
            const { presignedUrl, cdnUrl } = await presignRes.json()

            setStep(2)
            const uploadRes = await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            })
            if (!uploadRes.ok) throw new Error(`Step 2 failed: ${uploadRes.statusText}`)

            setStep(3)
            const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
            })
            if (!registerRes.ok) throw new Error(`Step 3 failed: ${await registerRes.text()}`)
            const { imageId } = await registerRes.json()

            setStep(4)
            const captionsRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
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

    const reset = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setFile(null)
        setPreviewUrl(null)
        setCaptions([])
        setError(null)
        setStatus('idle')
        setStep(0)
        if (inputRef.current) inputRef.current.value = ''
    }

    const getCaptionText = (c: CaptionRecord) =>
        String(c.caption ?? c.content ?? c.text ?? c.body ?? Object.values(c).find(v => typeof v === 'string') ?? '')

    const bestCaption = captions.length > 0 ? getCaptionText(captions[0]) : null

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Choose an image to upload"
            />

            {/* Image area — mirrors the ranking panel */}
            <div
                className="flex-1 bg-gray-950 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => { if (!previewUrl) inputRef.current?.click() }}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Uploaded image"
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <div className="text-center select-none">
                        <p className="text-5xl mb-4">📤</p>
                        <p className="text-gray-400 text-sm font-medium">Click to upload an image</p>
                        <p className="text-gray-600 text-xs mt-1">JPEG · PNG · WebP · GIF · HEIC</p>
                    </div>
                )}
            </div>

            {/* Caption + controls — mirrors the ranking panel */}
            <div className="shrink-0 px-6 py-5 bg-white border-t border-gray-100 space-y-4">

                {/* Caption display */}
                <div className="min-h-[2.5rem]">
                    {status === 'uploading' && (
                        <div className="flex items-center gap-1 flex-wrap">
                            {STEPS.map((label, i) => {
                                const s = i + 1
                                const done = step > s
                                const active = step === s
                                return (
                                    <div key={s} className="flex items-center gap-1">
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors
                                            ${done ? 'bg-green-100 text-green-700' : active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px]
                                                ${done ? 'bg-green-500 text-white' : active ? 'bg-white text-indigo-600 animate-pulse' : 'bg-gray-300'}`}>
                                                {done ? '✓' : s}
                                            </span>
                                            {label}
                                        </div>
                                        {s < 4 && <span className="text-gray-300 text-[10px]">›</span>}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {status === 'done' && bestCaption && (
                        <p className="text-xl font-medium text-gray-800 leading-snug">{bestCaption}</p>
                    )}
                    {status === 'error' && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                    {(status === 'idle') && (
                        <p className="text-xl text-gray-300 leading-snug">Caption will appear here…</p>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="flex-1 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors truncate px-3"
                    >
                        {file ? `📎 ${file.name}` : '+ Choose image'}
                    </button>
                    {file && status !== 'uploading' && (
                        <button
                            onClick={handleUpload}
                            className="shrink-0 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            ✨ Generate
                        </button>
                    )}
                    {(status === 'done' || status === 'error') && (
                        <button
                            onClick={reset}
                            className="shrink-0 py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}
