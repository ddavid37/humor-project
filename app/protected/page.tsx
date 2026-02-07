import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedGallery() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // THE GATE: If no user is logged in, send them back to the home page
    if (!user) {
        return redirect('/')
    }

    const { data: images } = await supabase.from('images').select('id, url').limit(10)

    return (
        <main className="p-10 bg-gray-50 min-h-screen text-center">
            <h1 className="text-4xl font-extrabold mb-4 text-indigo-800">🔒 Gated Humor Vault</h1>
            <p className="mb-10 text-gray-600">You are logged in as <strong>{user.email}</strong></p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {images?.map((img) => (
                    <div key={img.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <img src={img.url} alt="Gated Entry" className="w-full h-64 object-cover" />
                    </div>
                ))}
            </div>
        </main>
    )
}