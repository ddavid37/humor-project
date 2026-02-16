'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function HomeContent() {
    const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)

    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseKey) {
            setSupabase(createBrowserClient(supabaseUrl, supabaseKey))
        }
    }, [])

    const handleLogin = async () => {
        if (!supabase) return
        
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    prompt: 'select_account',
                },
            },
        })
    }

    if (!supabase) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-6">Humor Vault</h1>
                    <p className="mb-8 text-gray-600">Loading...</p>
                </div>
            </main>
        )
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
