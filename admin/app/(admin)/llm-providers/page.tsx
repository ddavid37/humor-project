import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { GenericCrud } from '@/components/GenericCrud'

export default async function LLMProvidersPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase
        .from('llm_providers')
        .select('*')
        .order('id')

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">LLM Providers</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">LLM Providers</h1>
            <GenericCrud title="LLM providers" apiBase="llm-providers" initialRows={rows ?? []} />
        </div>
    )
}
