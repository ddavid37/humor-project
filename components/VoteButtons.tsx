'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type VoteButtonsProps = {
    captionId: string
    isLoggedIn: boolean
    currentPage: number
    totalPages: number
}

export function VoteButtons({ captionId, isLoggedIn, currentPage, totalPages }: VoteButtonsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const nextPage = currentPage < totalPages ? currentPage + 1 : 1

    // Reset state whenever the caption changes (client-side nav reuses this component)
    useEffect(() => {
        setLoading(false)
        setError(null)
    }, [captionId])

    // Prefetch the next page as soon as this component mounts
    useEffect(() => {
        router.prefetch(`/protected?page=${nextPage}`)
    }, [router, nextPage])

    async function handleVote(vote: number) {
        if (!isLoggedIn) {
            setError('You must be logged in to vote.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/captions/${captionId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote }),
            })

            if (!res.ok) {
                const text = await res.text()
                let data: { error?: string; details?: string } = {}
                try {
                    data = text ? JSON.parse(text) : {}
                } catch {
                    data = {}
                }
                const msg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to vote')
                throw new Error(msg)
            }

            router.push(`/protected?page=${nextPage}`)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to vote')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <button
                    onClick={() => handleVote(1)}
                    disabled={loading || !isLoggedIn}
                    className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-600 active:scale-95 transition-all"
                >
                    👍 Upvote
                </button>
                <button
                    onClick={() => handleVote(-1)}
                    disabled={loading || !isLoggedIn}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-600 active:scale-95 transition-all"
                >
                    👎 Downvote
                </button>
            </div>
            {error && <span className="text-xs text-red-500 text-center">{error}</span>}
            {!isLoggedIn && <span className="text-xs text-gray-400 text-center">Sign in to vote</span>}
        </div>
    )
}
