import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { VoteButtons } from '@/components/VoteButtons'
import { LogoutButton } from '@/components/LogoutButton'
import { ImageUpload } from '@/components/ImageUpload'

type SearchParams = { page?: string }

export default async function ProtectedGallery({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()
    const isSuperAdmin = profile?.is_superadmin === true

    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token ?? ''

    const { data: captions, error: captionsError } = await supabase
        .from('captions')
        .select('*')
        .limit(100)

    const list = captions ?? []
    const params = await searchParams
    const page = Math.max(1, parseInt(params.page ?? '1', 10))
    const total = list.length
    const currentIndex = page - 1
    const current = total > 0 && currentIndex < total ? list[currentIndex] : null

    const row = current as Record<string, unknown> | null
    const captionText = row
        ? String(
            row.caption ?? row.content ?? row.body ?? row.text ?? row.description ?? row.title ??
            (typeof row.id === 'string' ? '' : Object.values(row).find(v => typeof v === 'string' && v !== row.image_url) ?? '')
        )
        : ''

    const r = row ?? {}
    const imageUrl = (r.image_url ?? r.url ?? (r as { images?: { url?: string } }).images?.url) as string | null | undefined
    const imageId = (r.image_id ?? r.imageId) as string | undefined

    let displayUrl: string | null = imageUrl ? String(imageUrl) : null
    if (!displayUrl && imageId) {
        const { data: img } = await supabase.from('images').select('url').eq('id', imageId).single()
        if (img?.url) displayUrl = img.url
    }
    if (!displayUrl && list.length > 0 && currentIndex >= 0) {
        const { data: images } = await supabase.from('images').select('id, url').order('id').limit(list.length)
        if (images && images[currentIndex]) displayUrl = images[currentIndex].url
    }

    return (
        <main className="h-screen flex flex-col overflow-hidden bg-white">

            {/* ── Header ── */}
            <header className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-gray-200 bg-white z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔒</span>
                    <h1 className="text-base font-bold text-gray-900 tracking-tight">Gated Humor Vault</h1>
                </div>
                <div className="flex items-center gap-4">
                    {isSuperAdmin && process.env.NEXT_PUBLIC_ADMIN_APP_URL && (
                        <a
                            href={process.env.NEXT_PUBLIC_ADMIN_APP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Admin →
                        </a>
                    )}
                    <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
                    <LogoutButton />
                </div>
            </header>

            {/* ── Two equal panels (CSS grid guarantees identical column widths) ── */}
            <div className="flex-1 grid grid-cols-2 overflow-hidden divide-x divide-gray-200">

                {/* ── Left: Ranking panel ── */}
                <div className="flex flex-col overflow-hidden">

                    {/* Centered label */}
                    <div className="shrink-0 py-2 border-b border-gray-100 bg-gray-50 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Rate this caption
                    </div>

                    {/* Image */}
                    <div className="flex-1 bg-gray-950 flex items-center justify-center overflow-hidden">
                        {displayUrl ? (
                            <img
                                src={displayUrl}
                                alt="Caption image"
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : captionsError ? (
                            <p className="text-gray-500 text-sm">Failed to load image.</p>
                        ) : (
                            <p className="text-gray-600 text-sm">No image available.</p>
                        )}
                    </div>

                    {/* Caption + controls — fixed height so both panels match */}
                    <div className="shrink-0 h-40 px-6 py-4 bg-white border-t border-gray-100 flex flex-col items-center justify-between">

                        {/* Caption centered */}
                        <p className="text-xl font-medium text-gray-800 leading-snug text-center line-clamp-2">
                            {captionsError ? (
                                <span className="text-red-400 text-sm">Error loading captions.</span>
                            ) : current ? captionText : (
                                <span className="text-gray-300">No caption found.</span>
                            )}
                        </p>

                        {/* Controls centered */}
                        {current && (
                            <div className="flex items-center gap-3">
                                <VoteButtons
                                    captionId={current.id}
                                    isLoggedIn={!!user}
                                    currentPage={page}
                                    totalPages={total}
                                />
                                <div className="flex items-center gap-1.5 pl-3 border-l border-gray-200">
                                    <span className="text-xs text-gray-400">{page}/{total}</span>
                                    {page > 1 ? (
                                        <Link href={`/protected?page=${page - 1}`} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors">
                                            ← Prev
                                        </Link>
                                    ) : (
                                        <span className="px-3 py-2 text-gray-300 text-sm">← Prev</span>
                                    )}
                                    {page < total ? (
                                        <Link href={`/protected?page=${page + 1}`} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">
                                            Next →
                                        </Link>
                                    ) : (
                                        <span className="px-3 py-2 text-gray-300 text-sm">Next →</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Generate captions panel ── */}
                <div className="flex flex-col overflow-hidden">
                    <ImageUpload accessToken={accessToken} />
                </div>

            </div>
        </main>
    )
}
