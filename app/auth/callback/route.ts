import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/protected'

    if (code) {
        const cookieStore = await cookies()
        // Create the redirect response first so we can attach Set-Cookie headers to it.
        // In Next.js, cookies set via cookies().set() are NOT included when you return
        // NextResponse.redirect(), so the session was never sent to the browser and
        // /protected would redirect back to / (no user).
        const successResponse = NextResponse.redirect(`${origin}${next}`)
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
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
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return successResponse
        }
    }

    // If something went wrong, return to the landing page
    return NextResponse.redirect(`${origin}/`)
}