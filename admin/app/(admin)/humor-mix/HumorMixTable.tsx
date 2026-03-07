'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cellValue } from '@/lib/tableHelpers'

type Row = Record<string, unknown>

export function HumorMixTable({ rows }: { rows: Row[] }) {
    const router = useRouter()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editRow, setEditRow] = useState<Record<string, string>>({})

    const cols = rows.length ? Object.keys(rows[0]) : []

    const startEdit = (row: Row) => {
        const id = row.id as string
        setEditingId(id)
        setEditRow(
            cols.reduce((acc, c) => {
                acc[c] = cellValue(row[c])
                return acc
            }, {} as Record<string, string>)
        )
    }

    const saveEdit = async () => {
        if (!editingId) return
        const body: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(editRow)) {
            if (v === '—' || v === '') body[k] = null
            else if (v === 'Yes' || v === 'true') body[k] = true
            else if (v === 'No' || v === 'false') body[k] = false
            else body[k] = v
        }
        delete body.id
        const res = await fetch(`/api/humor-mix/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (res.ok) {
            setEditingId(null)
            router.refresh()
        }
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-700">
                        {cols.map((c) => (
                            <th key={c} className="p-3 text-slate-400 font-medium">{c}</th>
                        ))}
                        <th className="p-3 text-slate-400 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => {
                        const id = (row.id as string) ?? String(i)
                        const isEditing = editingId === id
                        return (
                            <tr key={id} className="border-b border-slate-700/50">
                                {cols.map((col) => (
                                    <td key={col} className="p-3 text-slate-300 max-w-xs">
                                        {isEditing ? (
                                            <input
                                                value={editRow[col] ?? ''}
                                                onChange={(e) =>
                                                    setEditRow((prev) => ({ ...prev, [col]: e.target.value }))
                                                }
                                                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-200 text-xs"
                                            />
                                        ) : (
                                            <span className="truncate block">
                                                {cellValue(row[col])}
                                            </span>
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
                                                className="text-slate-400 hover:underline text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => startEdit(row)}
                                            className="text-amber-400 hover:underline text-xs"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
