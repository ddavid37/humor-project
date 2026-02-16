import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { VoteButtons } from '@/components/VoteButtons'

export default async function ProtectedGallery() {
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    // THE GATE: If no user is logged in, send them back to the home page
    if (!user) {
        return redirect('/')
    }

    // Fetch captions from the database
    const { data: captions, error: captionsError } = await supabase
        .from('captions')
        .select('id, text')
        .order('created_at', { ascending: false })
        .limit(20)

    if (captionsError) {
        console.error('Error fetching captions:', captionsError)
    }

    return (
        <main className="p-10 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-4 text-indigo-800 text-center">
                    🔒 Gated Humor Vault
                </h1>
                <p className="mb-10 text-gray-600 text-center">
                    You are logged in as <strong>{user.email}</strong>
                </p>

                <div className="space-y-4">
                    {captions && captions.length > 0 ? (
                        captions.map((caption) => (
                            <div
                                key={caption.id}
                                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                            >
                                <p className="text-lg mb-4 text-gray-800">{caption.text}</p>
                                <VoteButtons captionId={caption.id} isLoggedIn={!!user} />
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
                            <p className="text-gray-500">
                                {captionsError 
                                    ? 'Error loading captions. Please check your database connection.'
                                    : 'No captions found.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}