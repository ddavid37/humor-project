'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateImageForm() {
    const [url, setUrl] = useState('')
    const [isCommonUse, setIsCommonUse] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
    const [message, setMessage] = useState('')
    const router = useRouter()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')
        try {
            const res = await fetch('/api/images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim(), is_common_use: isCommonUse }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setStatus('err')
                setMessage(data.error || res.statusText)
                return
            }
            setStatus('ok')
            setUrl('')
            setMessage('Image created.')
            router.refresh()
        } catch (err) {
            setStatus('err')
            setMessage(err instanceof Error ? err.message : 'Request failed')
        }
    }

    return (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-500"
                    required
                />
            </div>
            <label className="flex items-center gap-2 text-slate-300">
                <input
                    type="checkbox"
                    checked={isCommonUse}
                    onChange={(e) => setIsCommonUse(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                />
                <span className="text-sm">Common use</span>
            </label>
            <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-500 disabled:opacity-50"
            >
                {status === 'loading' ? 'Adding…' : 'Add image'}
            </button>
            {message && (
                <span className={status === 'err' ? 'text-red-400' : 'text-emerald-400'}>
                    {message}
                </span>
            )}
        </form>
    )
}
