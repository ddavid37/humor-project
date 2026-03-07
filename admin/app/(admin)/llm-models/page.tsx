import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { GenericCrud } from '@/components/GenericCrud'

export default async function LLMModelsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase
        .from('llm_models')
        .select('*')
        .order('id')

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">LLM Models</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">LLM Models</h1>
            <GenericCrud title="LLM models" apiBase="llm-models" initialRows={rows ?? []} />
        </div>
    )
}
