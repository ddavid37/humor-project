'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function Home() {
    const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        // Hardcoded for class project (normally use env vars)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qihsgnfjqmkjmoowyfbn.supabase.co'
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaHNnbmZqcW1ram1vb3d5ZmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjc0MDAsImV4cCI6MjA2NTEwMzQwMH0.c9UQS_o2bRygKOEdnuRx7x7PeSf_OUGDtf9l3fMqMSQ'
        
        if (supabaseUrl && supabaseKey) {
            try {
                setSupabase(createBrowserClient(supabaseUrl, supabaseKey))
            } catch (error) {
                console.error('Failed to create Supabase client:', error)
            }
        } else {
            console.error('Missing Supabase environment variables')
        }
    }, [])

    const handleLogin = async () => {
        if (!supabase) {
            alert('Supabase client not initialized. Please check environment variables.')
            return
        }
        
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            })
        } catch (error) {
            console.error('Login error:', error)
            alert('Failed to sign in. Please try again.')
        }
    }

    if (!isClient) {
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
                    disabled={!supabase}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sign in with Google
                </button>
                {!supabase && (
                    <p className="mt-4 text-sm text-red-500">
                        Configuration error: Supabase credentials not found
                    </p>
                )}
            </div>
        </main>
    )
}
