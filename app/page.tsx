'use client'

import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-6">Humor Vault</h1>
                <p className="mb-8 text-gray-600">Sign in to access the gated content</p>
                <button
                    onClick={handleLogin}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                >
                    Sign in with Google
                </button>
            </div>
        </main>
    )
}