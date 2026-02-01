import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ListPage() {
    const { data: images } = await supabase.from('images').select('id, url').limit(10)

    return (
        <main className="p-10 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-10 text-center text-indigo-800">Crackd Image Gallery</h1>

            {/* This grid layout will change how the UI looks significantly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {images?.map((img) => (
                    <div key={img.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <img
                            src={img.url}
                            alt="Database Entry"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4 bg-white">
                            <p className="text-xs font-mono text-gray-400 truncate">ID: {img.id}</p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}