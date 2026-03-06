import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const auth = await requireSuperAdmin()
    if (!auth.allowed) {
        if (auth.reason === 'not_logged_in') redirect('/')
        if (auth.reason === 'not_superadmin') redirect('/forbidden')
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <header className="border-b border-slate-700 bg-slate-800/50 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <nav className="flex items-center gap-6">
                        <Link href="/dashboard" className="font-semibold text-amber-400 hover:text-amber-300">
                            Dashboard
                        </Link>
                        <Link href="/users" className="text-slate-300 hover:text-white">Users</Link>
                        <Link href="/images" className="text-slate-300 hover:text-white">Images</Link>
                        <Link href="/captions" className="text-slate-300 hover:text-white">Captions</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <a
                            href={process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://humor-project-wine.vercel.app'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-400 hover:text-white"
                        >
                            View main site
                        </a>
                        <span className="text-sm text-slate-500">Admin</span>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </div>
    )
}
