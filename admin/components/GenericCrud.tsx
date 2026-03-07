'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cellValue } from '@/lib/tableHelpers'

type Row = Record<string, unknown>

type Props = {
    title: string
    apiBase: string
    initialRows: Row[]
}

export function GenericCrud({ title, apiBase, initialRows }: Props) {
    const router = useRouter()
    const [rows, setRows] = useState(initialRows)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editVals, setEditVals] = useState<Record<string, string>>({})
    const [showAdd, setShowAdd] = useState(false)
    const [addVals, setAddVals] = useState<Record<string, string>>({})
    const cols = rows.length ? Object.keys(rows[0]).filter((c) => c !== 'id') : []

    const startEdit = (row: Row) => {
        setEditingId(String(row.id))
        setEditVals(
            cols.reduce((acc, c) => {
                acc[c] = cellValue(row[c])
                return acc
            }, {} as Record<string, string>)
        )
    }

    const saveEdit = async () => {
        if (!editingId) return
        const body: Record<string, unknown> = { ...editVals }
        const res = await fetch(`/api/${apiBase}/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (res.ok) {
            setEditingId(null)
            router.refresh()
        }
    }

    const deleteRow = async (id: string) => {
        if (!confirm('Delete this row?')) return
        const res = await fetch(`/api/${apiBase}/${id}`, { method: 'DELETE' })
        if (res.ok) router.refresh()
    }

    const submitAdd = async () => {
        const body: Record<string, unknown> = { ...addVals }
        const res = await fetch(`/api/${apiBase}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (res.ok) {
            setShowAdd(false)
            setAddVals({})
            router.refresh()
        }
    }

    return (
        <div>
            <div className="mb-4 flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowAdd(true)}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm hover:bg-amber-500"
                >
                    Add {title.slice(0, -1)}
                </button>
            </div>
            {showAdd && (
                <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                    <h3 className="text-slate-200 mb-2">New row</h3>
                    <div className="flex flex-wrap gap-2">
                        {cols.map((c) => (
                            <input
                                key={c}
                                placeholder={c}
                                value={addVals[c] ?? ''}
                                onChange={(e) => setAddVals((p) => ({ ...p, [c]: e.target.value }))}
                                className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-200 text-sm"
                            />
                        ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={submitAdd}
                            className="rounded bg-emerald-600 px-3 py-1 text-white text-sm"
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAdd(false)}
                            className="rounded bg-slate-600 px-3 py-1 text-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="p-3 text-slate-400 font-medium">id</th>
                            {cols.map((c) => (
                                <th key={c} className="p-3 text-slate-400 font-medium">{c}</th>
                            ))}
                            <th className="p-3 text-slate-400 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => {
                            const id = String((row as { id?: unknown }).id ?? i)
                            const isEditing = editingId === id
                            return (
                                <tr key={id} className="border-b border-slate-700/50">
                                    <td className="p-3 font-mono text-slate-400 text-xs truncate max-w-[120px]">{id}</td>
                                    {cols.map((col) => (
                                        <td key={col} className="p-3 text-slate-300 max-w-xs">
                                            {isEditing ? (
                                                <input
                                                    value={editVals[col] ?? ''}
                                                    onChange={(e) =>
                                                        setEditVals((p) => ({ ...p, [col]: e.target.value }))
                                                    }
                                                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs"
                                                />
                                            ) : (
                                                <span className="truncate block">{cellValue(row[col])}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-3">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={saveEdit}
                                                    className="text-emerald-400 hover:underline text-xs mr-2"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                    className="text-slate-400 hover:underline text-xs mr-2"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(row)}
                                                    className="text-amber-400 hover:underline text-xs mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteRow(id)}
                                                    className="text-red-400 hover:underline text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
