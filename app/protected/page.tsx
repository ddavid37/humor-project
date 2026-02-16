import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { VoteButtons } from '@/components/VoteButtons'
import { LogoutButton } from '@/components/LogoutButton'

type SearchParams = { page?: string }

export default async function ProtectedGallery({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    // Select all columns so we don't depend on exact column names (class DB may use content, body, etc.)
    const { data: captions, error: captionsError } = await supabase
        .from('captions')
        .select('*')
        .limit(100)

    const list = captions ?? []
    const err = captionsError

    const params = await searchParams
    const page = Math.max(1, parseInt(params.page ?? '1', 10))
    const total = list.length
    const currentIndex = page - 1
    const current = total > 0 && currentIndex < total ? list[currentIndex] : null

    const row = current as Record<string, unknown> | undefined
    const captionText = row
        ? String(
            row.caption ?? row.content ?? row.body ?? row.text ?? row.description ?? row.title ??
            (typeof row.id === 'string' ? '' : Object.values(row).find(v => typeof v === 'string' && v !== row.image_url) ?? '')
          )
        : ''
    const imageUrl =
        (current as Record<string, unknown> | undefined)?.image_url ??
        (current as { images?: { url?: string } } | undefined)?.images?.url ??
        null
    const imageId = (current as Record<string, unknown> | undefined)?.image_id as string | undefined

    let displayUrl = imageUrl
    if (!displayUrl && imageId) {
        const { data: img } = await supabase.from('images').select('url').eq('id', imageId).single()
        if (img?.url) displayUrl = img.url
    }

    return (
        <main className="p-10 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-4xl font-extrabold text-indigo-800">
                        🔒 Gated Humor Vault
                    </h1>
                    <LogoutButton />
                </div>
                <p className="mb-10 text-gray-600 text-center">
                    You are logged in as <strong>{user.email}</strong>
                </p>

                {err ? (
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
                        <p className="text-gray-500 mb-2">Error loading captions.</p>
                        <p className="text-xs text-red-500">{(err as { message?: string }).message}</p>
                    </div>
                ) : total === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
                        <p className="text-gray-500">No captions found.</p>
                    </div>
                ) : current ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        {displayUrl && (
                            <div className="w-full aspect-video bg-gray-100">
                                <img
                                    src={displayUrl}
                                    alt="Caption"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        <div className="p-6">
                            <p className="text-lg mb-6 text-gray-800">
                                {String(captionText)}
                            </p>
                            <VoteButtons captionId={current.id} isLoggedIn={!!user} />
                        </div>
                        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                            <span className="text-sm text-gray-500">
                                {page} of {total}
                            </span>
                            <div className="flex gap-2">
                                {page > 1 ? (
                                    <Link
                                        href={`/protected?page=${page - 1}`}
                                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    >
                                        ← Previous
                                    </Link>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400">← Previous</span>
                                )}
                                {page < total ? (
                                    <Link
                                        href={`/protected?page=${page + 1}`}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        Next →
                                    </Link>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400">Next →</span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
                        <p className="text-gray-500">No caption for this page.</p>
                        <Link href="/protected?page=1" className="text-indigo-600 hover:underline mt-2 inline-block">
                            Go to first
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}
