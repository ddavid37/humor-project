import { createSupabaseServerClient } from '@/lib/supabaseServer'
import Link from 'next/link'

function captionText(row: Record<string, unknown>): string {
    return String(
        row.caption ?? row.content ?? row.body ?? row.text ?? row.description ?? row.title ??
        (Object.values(row).find(v => typeof v === 'string' && v !== row.image_url) ?? '—')
    )
}

export default async function CaptionsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: captions, error } = await supabase
        .from('captions')
        .select('*')
        .order('id', { ascending: false })
        .limit(200)

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Captions</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Captions</h1>
            <p className="text-slate-400 text-sm mb-4">Read-only. Showing up to 200.</p>
            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="p-3 text-slate-400 font-medium">ID</th>
                            <th className="p-3 text-slate-400 font-medium">Caption</th>
                            <th className="p-3 text-slate-400 font-medium">Image ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(captions ?? []).map((c) => (
                            <tr key={c.id} className="border-b border-slate-700/50">
                                <td className="p-3 font-mono text-slate-300 text-xs">{c.id}</td>
                                <td className="p-3 text-slate-300 max-w-md truncate">
                                    {captionText(c as Record<string, unknown>)}
                                </td>
                                <td className="p-3">
                                    {(c as { image_id?: string }).image_id ? (
                                        <Link
                                            href={`/images?highlight=${(c as { image_id: string }).image_id}`}
                                            className="text-amber-400 hover:underline font-mono text-xs"
                                        >
                                            {(c as { image_id: string }).image_id}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-500">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
