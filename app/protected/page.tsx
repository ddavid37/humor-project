import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-indigo-700">Gated Humor Vault</h1>
            <p className="mt-4 text-gray-600">Welcome, <strong>{user.email}</strong>!</p>
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                <p>This UI is only visible to logged-in users.</p>
            </div>
        </div>
    )
}