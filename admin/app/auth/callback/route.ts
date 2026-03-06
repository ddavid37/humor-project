import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qihsgnfjqmkjmoowyfbn.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaHNnbmZqcW1ram1vb3d5ZmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjc0MDAsImV4cCI6MjA2NTEwMzQwMH0.c9UQS_o2bRygKOEdnuRx7x7PeSf_OUGDtf9l3fMqMSQ'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = await cookies()
        const successResponse = NextResponse.redirect(`${origin}${next}`)
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                    successResponse.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options })
                    successResponse.cookies.set({ name, value: '', ...options })
                },
            },
        })

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) return successResponse
    }

    return NextResponse.redirect(`${origin}/`)
}
