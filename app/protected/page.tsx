import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedGallery() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value }
            }
        }
    )

    // 1. THE GATE: This checks if a user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    // 2. THE REDIRECT: If no user, send them back to the home page
    if (!user) {
        return redirect('/')
    }

    // 3. THE DATA: Fetch your images from Supabase
    const { data: images } = await supabase.from('images').select('id, url').limit(10)

    return (
        <main className="p-10 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-10 text-center text-indigo-800">🔒 Gated Image Gallery</h1>
                <p className="mb-8 text-center text-gray-600 italic">Welcome, {user.email}! This page is only for you.</p>

                {/* Your working grid layout from Week 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {images?.map((img) => (
                        <div key={img.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <img src={img.url} alt="Gated Entry" className="w-full h-64 object-cover" />
                            <div className="p-4 bg-white text-center">
                                <p className="text-xs font-mono text-gray-400 truncate">ID: {img.id}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}