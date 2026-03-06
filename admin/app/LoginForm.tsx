'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export function LoginForm() {
    const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qihsgnfjqmkjmoowyfbn.supabase.co'
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaHNnbmZqcW1ram1vb3d5ZmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjc0MDAsImV4cCI6MjA2NTEwMzQwMH0.c9UQS_o2bRygKOEdnuRx7x7PeSf_OUGDtf9l3fMqMSQ'
        if (supabaseUrl && supabaseKey) {
            setSupabase(createBrowserClient(supabaseUrl, supabaseKey))
        }
    }, [])

    const handleLogin = async () => {
        if (!supabase) return
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
                queryParams: { prompt: 'select_account' },
            },
        })
    }

    if (!isClient) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-900">
                <p className="text-slate-400">Loading...</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Humor Admin</h1>
                <p className="text-slate-400 mb-6">Sign in with Google (superadmin only)</p>
                <button
                    onClick={handleLogin}
                    disabled={!supabase}
                    className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-500 disabled:opacity-50"
                >
                    Sign in with Google
                </button>
            </div>
        </main>
    )
}
