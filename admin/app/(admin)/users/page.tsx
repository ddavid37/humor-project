import { createSupabaseServerClient } from '@/lib/supabaseServer'

export default async function UsersPage() {
    const supabase = await createSupabaseServerClient()
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, is_superadmin, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Users / Profiles</h1>
                <p className="text-red-400">Error loading profiles: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Users / Profiles</h1>
            <p className="text-slate-400 text-sm mb-4">Read-only. Total: {profiles?.length ?? 0}</p>
            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="p-3 text-slate-400 font-medium">ID</th>
                            <th className="p-3 text-slate-400 font-medium">Superadmin</th>
                            <th className="p-3 text-slate-400 font-medium">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(profiles ?? []).map((p) => (
                            <tr key={p.id} className="border-b border-slate-700/50">
                                <td className="p-3 font-mono text-slate-300 truncate max-w-[200px]">
                                    {p.id}
                                </td>
                                <td className="p-3">
                                    {p.is_superadmin ? (
                                        <span className="text-amber-400">Yes</span>
                                    ) : (
                                        <span className="text-slate-500">No</span>
                                    )}
                                </td>
                                <td className="p-3 text-slate-400">
                                    {p.created_at
                                        ? new Date(p.created_at).toLocaleString()
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
