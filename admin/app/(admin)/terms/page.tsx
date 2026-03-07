import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { GenericCrud } from '@/components/GenericCrud'

export default async function TermsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase.from('terms').select('*').order('id')

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Terms</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Terms</h1>
            <GenericCrud title="Terms" apiBase="terms" initialRows={rows ?? []} />
        </div>
    )
}
