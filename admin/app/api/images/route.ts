import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(req: Request) {
    const auth = await requireSuperAdmin()
    if (!auth.allowed) {
        return NextResponse.json(
            { error: auth.reason === 'not_logged_in' ? 'Not authenticated' : 'Forbidden' },
            { status: auth.reason === 'not_logged_in' ? 401 : 403 }
        )
    }

    let body: { url?: string; is_common_use?: boolean }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const url = typeof body.url === 'string' ? body.url.trim() : ''
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('images')
        .insert({
            url,
            is_common_use: body.is_common_use === true,
        })
        .select('id')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ id: data?.id })
}
