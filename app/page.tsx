'use client'

import { createClient } from '@supabase/supabase-js'

export default function LoginPage() {
  const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This MUST match your folder structure /auth/callback
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-indigo-500">Crackd.ai</h1>
          <p className="text-gray-400 text-lg">Sign in to access your gated humor gallery.</p>
          <button
              onClick={handleLogin}
              className="flex items-center justify-center w-full gap-3 px-6 py-4 text-black bg-white rounded-full font-bold hover:bg-gray-200 transition-all shadow-xl"
          >
            Sign in with Google
          </button>
        </div>
      </main>
  )
}