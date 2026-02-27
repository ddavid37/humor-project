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
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleVote(1)}
                    disabled={loading || !isLoggedIn}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                    👍 Upvote
                </button>
                <button
                    onClick={() => handleVote(-1)}
                    disabled={loading || !isLoggedIn}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                >
                    👎 Downvote
                </button>
            </div>
            {error && (
                <span className="text-sm text-red-500">{error}</span>
            )}
            {!isLoggedIn && (
                <span className="text-sm text-gray-500">Sign in to vote</span>
            )}
        </div>
    )
}
