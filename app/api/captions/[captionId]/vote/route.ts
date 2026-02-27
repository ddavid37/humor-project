import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ captionId: string }> }
) {
    const supabase = await createSupabaseServerClient()

    // 1. Ensure user is logged in
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { captionId } = await params

    // Get vote value from request body (1 for upvote, -1 for downvote)
    let body: { vote?: number } = {}
    try {
        const text = await req.text()
        body = text ? JSON.parse(text) : {}
    } catch {
        body = {}
    }
    const vote = typeof body.vote === 'number' ? body.vote : 1 // default to upvote

    // 2. Upsert the vote — if a row already exists for this user+caption, update vote_value instead of failing
    const now = new Date().toISOString()
    const { error: upsertError } = await supabase
        .from('caption_votes')
        .upsert(
            {
                caption_id: captionId,
                profile_id: user.id,
                vote_value: vote,
                created_datetime_utc: now,
                modified_datetime_utc: now,
            },
            { onConflict: 'profile_id,caption_id' }
        )

    if (upsertError) {
        console.error('Vote upsert error:', upsertError)
        return NextResponse.json(
            {
                error: 'Failed to insert vote',
                details: upsertError.message,
                code: upsertError.code,
            },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}
