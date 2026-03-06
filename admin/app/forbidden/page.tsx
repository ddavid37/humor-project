import Link from 'next/link'

export default function ForbiddenPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-amber-400 mb-2">Access denied</h1>
                <p className="text-slate-400 mb-6">Only superadmins can use this area.</p>
                <Link
                    href="/"
                    className="inline-block bg-slate-700 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-600"
                >
                    Back to login
                </Link>
            </div>
        </main>
    )
}
