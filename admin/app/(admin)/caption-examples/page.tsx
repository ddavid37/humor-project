import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { GenericCrud } from '@/components/GenericCrud'

export default async function CaptionExamplesPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase
        .from('caption_examples')
        .select('*')
        .order('id', { ascending: false })

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Caption Examples</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Caption Examples</h1>
            <GenericCrud title="Caption examples" apiBase="caption-examples" initialRows={rows ?? []} />
        </div>
    )
}
