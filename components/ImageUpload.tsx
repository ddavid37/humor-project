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
    const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
    const [step, setStep] = useState(0)
    const [captions, setCaptions] = useState<CaptionRecord[]>([])
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null
        setFile(f)
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
        setFile(null)
        setCaptions([])
        setError(null)
        setStatus('idle')
        setStep(0)
        if (inputRef.current) inputRef.current.value = ''
    }

    const getCaptionText = (c: CaptionRecord) =>
        String(c.caption ?? c.content ?? c.text ?? c.body ?? Object.values(c).find(v => typeof v === 'string') ?? '')

    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Generate Captions</p>

            {/* Picker row */}
            <div className="flex items-center gap-2">
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
                    className="flex-1 text-left px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors truncate"
                >
                    {file ? `📎 ${file.name}` : '+ Choose an image…'}
                </button>
                {file && status !== 'uploading' && (
                    <button
                        onClick={handleUpload}
                        className="shrink-0 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        ✨ Go
                    </button>
                )}
                {status === 'done' && (
                    <button onClick={reset} className="shrink-0 text-xs text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                )}
            </div>

            {/* Step progress */}
            {status === 'uploading' && (
                <div className="flex items-center gap-1">
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

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500">
                    {error}{' '}
                    <button onClick={handleUpload} className="underline hover:text-red-700">Retry</button>
                </p>
            )}

            {/* Results */}
            {status === 'done' && captions.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    <p className="text-xs font-medium text-gray-400">{captions.length} caption{captions.length !== 1 ? 's' : ''} generated</p>
                    {captions.map((c, i) => (
                        <div key={i} className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-gray-700 leading-snug">
                            {getCaptionText(c)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
