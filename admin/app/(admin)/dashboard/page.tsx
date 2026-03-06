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
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('images').select('*', { count: 'exact', head: true }),
        supabase.from('captions').select('*', { count: 'exact', head: true }),
        supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    ])

    const { data: voteSums } = await supabase
        .from('caption_votes')
        .select('caption_id, vote_value')
    const byCaption = (voteSums ?? []).reduce((acc, { caption_id, vote_value }) => {
        acc[caption_id] = (acc[caption_id] ?? 0) + (vote_value ?? 0)
        return acc
    }, {} as Record<string, number>)
    const topCaptionIds = Object.entries(byCaption)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id)

    const { data: recentImages } = await supabase
        .from('images')
        .select('id, url')
        .order('id', { ascending: false })
        .limit(5)

    const { data: topCaptionsData } = topCaptionIds.length
        ? await supabase.from('captions').select('*').in('id', topCaptionIds)
        : { data: [] }
    const topCaptionsMap = new Map((topCaptionsData ?? []).map((c) => [c.id, c]))

    const stats = [
        { label: 'Users', value: profilesCount ?? 0, href: '/users', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
        { label: 'Images', value: imagesCount ?? 0, href: '/images', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { label: 'Captions', value: captionsCount ?? 0, href: '/captions', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
        { label: 'Votes cast', value: votesCount ?? 0, href: '/captions', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
    ]

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

            <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
                    <h2 className="text-lg font-semibold text-slate-200 mb-3">Top captions by votes</h2>
                    <ul className="space-y-2">
                        {topCaptionIds.length === 0 ? (
                            <li className="text-slate-500 text-sm">No votes yet</li>
                        ) : (
                            topCaptionIds.map((id, i) => {
                                const c = topCaptionsMap.get(id)
                                const score = byCaption[id] ?? 0
                                return (
                                    <li key={id} className="text-sm flex gap-2">
                                        <span className="text-amber-400 font-mono w-6">#{i + 1}</span>
                                        <span className="text-slate-400">+{score}</span>
                                        <span className="text-slate-300 truncate flex-1">
                                            {c ? captionText(c as Record<string, unknown>) : '(no text)'}
                                        </span>
                                    </li>
                                )
                            })
                        )}
                    </ul>
                </section>

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
        </div>
    )
}
