import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { cellValue } from '@/lib/tableHelpers'

export default async function LLMPromptChainsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase
        .from('llm_prompt_chains')
        .select('*')
        .order('id')
        .limit(500)

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">LLM Prompt Chains</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    const cols = rows?.length ? Object.keys(rows[0] as object) : []

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">LLM Prompt Chains</h1>
            <p className="text-slate-400 text-sm mb-4">Read-only. Total: {rows?.length ?? 0}</p>
            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {cols.map((c) => (
                                <th key={c} className="p-3 text-slate-400 font-medium">{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(rows ?? []).map((row, i) => (
                            <tr key={(row as { id?: string }).id ?? i} className="border-b border-slate-700/50">
                                {cols.map((col) => (
                                    <td key={col} className="p-3 text-slate-300 max-w-xs truncate">
                                        {cellValue((row as Record<string, unknown>)[col])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}