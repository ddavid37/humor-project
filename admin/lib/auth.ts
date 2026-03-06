import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qihsgnfjqmkjmoowyfbn.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaHNnbmZqcW1ram1vb3d5ZmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjc0MDAsImV4cCI6MjA2NTEwMzQwMH0.c9UQS_o2bRygKOEdnuRx7x7PeSf_OUGDtf9l3fMqMSQ'

export type AdminAuthResult =
    | { allowed: true; userId: string }
    | { allowed: false; reason: 'not_logged_in' | 'not_superadmin' }

/** Use in server components / route handlers. Returns whether current user is superadmin. */
export async function requireSuperAdmin(): Promise<AdminAuthResult> {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value
            },
        },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { allowed: false, reason: 'not_logged_in' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

    const isSuperAdmin = profile?.is_superadmin === true
    if (!isSuperAdmin) return { allowed: false, reason: 'not_superadmin' }

    return { allowed: true, userId: user.id }
}
