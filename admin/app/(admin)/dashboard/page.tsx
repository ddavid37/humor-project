import { createSupabaseServerClient } from '@/lib/supabaseServer'
import Link from 'next/link'

function captionText(row: Record<string, unknown>): string {
    return String(
        row.caption ?? row.content ?? row.body ?? row.text ?? row.description ?? row.title ??
        (Object.values(row).find(v => typeof v === 'string' && v !== row.image_url) ?? '')
    )
}

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient()

    const [
        { count: profilesCount },
        { count: imagesCount },
        { count: captionsCount },
        { count: votesCount },
    ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('images').select('*', { count: 'exact', head: true }),
        supabase.from('captions').select('*', { count: 'exact', head: true }),
        supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    ])

    const { data: allVotes } = await supabase
        .from('caption_votes')
        .select('caption_id, vote_value, profile_id')

    const votes = allVotes ?? []
    const totalUpvotes = votes.filter(v => (v.vote_value ?? 0) > 0).length
    const totalDownvotes = votes.filter(v => (v.vote_value ?? 0) < 0).length
    const uniqueVoters = new Set(votes.map(v => v.profile_id)).size

    const byCaption: Record<string, { sum: number; up: number; down: number; total: number }> = {}
    for (const v of votes) {
        const id = v.caption_id
        if (!byCaption[id]) byCaption[id] = { sum: 0, up: 0, down: 0, total: 0 }
        const val = v.vote_value ?? 0
        byCaption[id].sum += val
        byCaption[id].total += 1
        if (val > 0) byCaption[id].up += 1
        else if (val < 0) byCaption[id].down += 1
    }

    const captionEntries = Object.entries(byCaption)
    const avgScore = captionEntries.length
        ? captionEntries.reduce((s, [, v]) => s + v.sum, 0) / captionEntries.length
        : 0
    const captionsWithVotes = captionEntries.length
    const captionsNoVotes = (captionsCount ?? 0) - captionsWithVotes

    const topCaptionIds = captionEntries
        .sort(([, a], [, b]) => b.sum - a.sum)
        .slice(0, 5)
        .map(([id]) => id)

    const bottomCaptionIds = captionEntries
        .filter(([, v]) => v.total >= 2)
        .sort(([, a], [, b]) => a.sum - b.sum)
        .slice(0, 5)
        .map(([id]) => id)

    const controversialIds = captionEntries
        .filter(([, v]) => v.up >= 1 && v.down >= 1)
        .sort(([, a], [, b]) => Math.min(b.up, b.down) - Math.min(a.up, a.down))
        .slice(0, 5)
        .map(([id]) => id)

    const allCaptionIdsToFetch = [...new Set([...topCaptionIds, ...bottomCaptionIds, ...controversialIds])]
    const { data: captionsData } = allCaptionIdsToFetch.length
        ? await supabase.from('captions').select('*').in('id', allCaptionIdsToFetch)
        : { data: [] }
    const captionsMap = new Map((captionsData ?? []).map((c) => [c.id, c]))

    const { data: recentImages } = await supabase
        .from('images')
        .select('id, url')
        .order('id', { ascending: false })
        .limit(5)

    const maxUp = Math.max(totalUpvotes, 1)
    const maxDown = Math.max(totalDownvotes, 1)
    const upPct = Math.round((totalUpvotes / (totalUpvotes + totalDownvotes || 1)) * 100)

    const stats = [
        { label: 'Users', value: profilesCount ?? 0, href: '/users', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
        { label: 'Images', value: imagesCount ?? 0, href: '/images', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { label: 'Captions', value: captionsCount ?? 0, href: '/captions', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
        { label: 'Total votes', value: votesCount ?? 0, href: '/captions', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
    ]

    const ratingStats = [
        { label: 'Upvotes', value: totalUpvotes, color: 'text-green-400' },
        { label: 'Downvotes', value: totalDownvotes, color: 'text-red-400' },
        { label: 'Unique voters', value: uniqueVoters, color: 'text-sky-400' },
        { label: 'Avg score', value: avgScore.toFixed(1), color: 'text-amber-400' },
        { label: 'Rated captions', value: captionsWithVotes, color: 'text-slate-300' },
        { label: 'Unrated captions', value: captionsNoVotes, color: 'text-slate-500' },
    ]

    function renderCaptionList(ids: string[], mode: 'top' | 'bottom' | 'controversial') {
        if (ids.length === 0) return <li className="text-slate-500 text-sm">No data yet</li>
        return ids.map((id, i) => {
            const c = captionsMap.get(id)
            const info = byCaption[id]
            return (
                <li key={id} className="text-sm flex gap-2 items-start">
                    <span className="text-amber-400 font-mono w-6 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                        <span className="text-slate-300 line-clamp-1">
                            {c ? captionText(c as Record<string, unknown>) : '(no text)'}
                        </span>
                        <div className="flex gap-2 mt-0.5 text-xs">
                            {mode === 'controversial' ? (
                                <>
                                    <span className="text-green-400">{info?.up ?? 0} up</span>
                                    <span className="text-red-400">{info?.down ?? 0} down</span>
                                </>
                            ) : (
                                <>
                                    <span className={info?.sum !== undefined && info.sum >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {info?.sum !== undefined && info.sum >= 0 ? '+' : ''}{info?.sum ?? 0}
                                    </span>
                                    <span className="text-slate-500">{info?.total ?? 0} votes</span>
                                </>
                            )}
                        </div>
                    </div>
                </li>
            )
        })
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Dashboard</h1>

            {/* Top-level counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map(({ label, value, href, color }) => (
                    <Link
                        key={label}
                        href={href}
                        className={`rounded-xl border p-5 ${color} hover:opacity-90 transition`}
                    >
                        <div className="text-3xl font-bold">{value}</div>
                        <div className="text-sm opacity-90">{label}</div>
                    </Link>
                ))}
            </div>

            {/* Rating statistics */}
            <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 mb-8">
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Caption Rating Statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-5">
                    {ratingStats.map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                            <div className={`text-2xl font-bold ${color}`}>{value}</div>
                            <div className="text-xs text-slate-400">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Vote ratio bar */}
                <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Upvotes ({upPct}%)</span>
                        <span>Downvotes ({100 - upPct}%)</span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-700">
                        <div
                            className="bg-green-500 transition-all"
                            style={{ width: `${upPct}%` }}
                        />
                        <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${100 - upPct}%` }}
                        />
                    </div>
                </div>
            </section>

            {/* Three-column caption breakdowns */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
                    <h2 className="text-base font-semibold text-slate-200 mb-3">Top Rated</h2>
                    <ul className="space-y-3">{renderCaptionList(topCaptionIds, 'top')}</ul>
                </section>

                <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
                    <h2 className="text-base font-semibold text-slate-200 mb-3">Lowest Rated</h2>
                    <ul className="space-y-3">{renderCaptionList(bottomCaptionIds, 'bottom')}</ul>
                </section>

                <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
                    <h2 className="text-base font-semibold text-slate-200 mb-3">Most Controversial</h2>
                    <p className="text-xs text-slate-500 mb-2">Captions with both upvotes and downvotes</p>
                    <ul className="space-y-3">{renderCaptionList(controversialIds, 'controversial')}</ul>
                </section>
            </div>

            {/* Recent images */}
            <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-slate-200 mb-3">Recent images</h2>
                <ul className="space-y-2">
                    {(recentImages ?? []).length === 0 ? (
                        <li className="text-slate-500 text-sm">No images</li>
                    ) : (
                        (recentImages ?? []).map((img) => (
                            <li key={img.id} className="flex items-center gap-3 text-sm">
                                {img.url ? (
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="w-12 h-12 rounded object-cover bg-slate-700"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded bg-slate-700" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-slate-300 truncate">{img.url ?? '—'}</p>
                                </div>
                                <Link
                                    href={`/images?highlight=${img.id}`}
                                    className="text-amber-400 hover:underline"
                                >
                                    View
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </section>
        </div>
    )
}
