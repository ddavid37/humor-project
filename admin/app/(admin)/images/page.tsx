import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { ImageList } from './ImageList'
import { CreateImageForm } from './CreateImageForm'

export default async function ImagesPage() {
    const supabase = await createSupabaseServerClient()
    const { data: images, error } = await supabase
        .from('images')
        .select('id, url, is_common_use')
        .order('id', { ascending: false })

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Images</h1>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-200 mb-3">Add image</h2>
                <CreateImageForm />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-slate-200 mb-3">
                    All images ({images?.length ?? 0})
                </h2>
                {error ? (
                    <p className="text-red-400">Error: {error.message}</p>
                ) : (
                    <ImageList images={images ?? []} />
                )}
            </section>
        </div>
    )
}
