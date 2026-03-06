import { createSupabaseServerClient } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function CaptionsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: captions, error } = await supabase
        .from('captions')
        .select('id, caption, image_id, created_at')
        .order('created_at', { ascending: false })
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
                            <th className="p-3 text-slate-400 font-medium">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(captions ?? []).map((c) => (
                            <tr key={c.id} className="border-b border-slate-700/50">
                                <td className="p-3 font-mono text-slate-300 text-xs">{c.id}</td>
                                <td className="p-3 text-slate-300 max-w-md truncate">
                                    {(c as { caption?: string }).caption ?? '—'}
                                </td>
                                <td className="p-3">
                                    {c.image_id ? (
                                        <Link
                                            href={`/images?highlight=${c.image_id}`}
                                            className="text-amber-400 hover:underline font-mono text-xs"
                                        >
                                            {c.image_id}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-500">—</span>
                                    )}
                                </td>
                                <td className="p-3 text-slate-400 text-xs">
                                    {c.created_at
                                        ? new Date(c.created_at).toLocaleString()
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
