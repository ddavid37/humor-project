import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(
    req: NextRequest,
    { params }: { params: { captionId: string } }
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

    const captionId = params.captionId

    // Get vote value from request body (1 for upvote, -1 for downvote)
    const body = await req.json().catch(() => ({}))
    const vote = typeof body.vote === 'number' ? body.vote : 1 // default to upvote

    // 2. Insert the vote into caption_votes table
    const { error: insertError } = await supabase
        .from('caption_votes')
        .insert({
            caption_id: captionId,
            user_id: user.id,
            vote,
        })

    if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
            { error: 'Failed to insert vote', details: insertError.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}
