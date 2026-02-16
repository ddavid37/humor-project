'use client'

import { useState } from 'react'

type VoteButtonsProps = {
    captionId: string
    isLoggedIn: boolean
}

export function VoteButtons({ captionId, isLoggedIn }: VoteButtonsProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleVote(vote: number) {
        if (!isLoggedIn) {
            setError('You must be logged in to vote.')
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const res = await fetch(`/api/captions/${captionId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Failed to vote')
            }

            setSuccess(true)
            // Clear success message after 2 seconds
            setTimeout(() => setSuccess(false), 2000)
        } catch (e: any) {
            setError(e.message || 'Failed to vote')
        } finally {
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
            {success && (
                <span className="text-sm text-green-500">Vote submitted!</span>
            )}
            {!isLoggedIn && (
                <span className="text-sm text-gray-500">Sign in to vote</span>
            )}
        </div>
    )
}
