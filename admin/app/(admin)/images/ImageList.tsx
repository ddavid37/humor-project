'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ImageRow = { id: string; url: string | null; is_common_use?: boolean }

export function ImageList({ images }: { images: ImageRow[] }) {
    const router = useRouter()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editUrl, setEditUrl] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const startEdit = (img: ImageRow) => {
        setEditingId(img.id)
        setEditUrl(img.url ?? '')
    }

    const saveEdit = async () => {
        if (!editingId) return
        const res = await fetch(`/api/images/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: editUrl.trim() }),
        })
        if (res.ok) {
            setEditingId(null)
            router.refresh()
        }
    }

    const deleteImage = async (id: string) => {
        if (!confirm('Delete this image? This may affect captions.')) return
        setDeletingId(id)
        const res = await fetch(`/api/images/${id}`, { method: 'DELETE' })
        setDeletingId(null)
        if (res.ok) router.refresh()
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-700">
                        <th className="p-3 text-slate-400 font-medium">Preview</th>
                        <th className="p-3 text-slate-400 font-medium">URL</th>
                        <th className="p-3 text-slate-400 font-medium">Common use</th>
                        <th className="p-3 text-slate-400 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {images.map((img) => (
                        <tr key={img.id} className="border-b border-slate-700/50">
                            <td className="p-2">
                                {img.url ? (
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="w-16 h-16 rounded object-cover bg-slate-700"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded bg-slate-700" />
                                )}
                            </td>
                            <td className="p-3 max-w-xs">
                                {editingId === img.id ? (
                                    <input
                                        type="url"
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-200 text-xs"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-slate-300 truncate block">
                                        {img.url ?? '—'}
                                    </span>
                                )}
                            </td>
                            <td className="p-3 text-slate-400">
                                {img.is_common_use ? 'Yes' : 'No'}
                            </td>
                            <td className="p-3">
                                {editingId === img.id ? (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={saveEdit}
                                            className="text-emerald-400 hover:underline text-xs"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            className="text-slate-400 hover:underline text-xs"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(img)}
                                            className="text-amber-400 hover:underline text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteImage(img.id)}
                                            disabled={deletingId === img.id}
                                            className="text-red-400 hover:underline text-xs disabled:opacity-50"
                                        >
                                            {deletingId === img.id ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
