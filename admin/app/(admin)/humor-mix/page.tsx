import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { HumorMixTable } from './HumorMixTable'

export default async function HumorMixPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase
        .from('humor_flavor_mix')
        .select('*')
        .order('id')

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Humor Mix</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Humor Mix</h1>
            <p className="text-slate-400 text-sm mb-4">Read / Update. Total: {rows?.length ?? 0}</p>
            <HumorMixTable rows={rows ?? []} />
        </div>
    )
}
