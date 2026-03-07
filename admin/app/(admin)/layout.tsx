import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { LogoutButton } from '@/components/LogoutButton'

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
                    <nav className="flex flex-wrap items-center gap-3">
                        <Link href="/dashboard" className="font-semibold text-amber-400 hover:text-amber-300">
                            Dashboard
                        </Link>
                        <Link href="/users" className="text-slate-300 hover:text-white text-sm">Users</Link>
                        <Link href="/images" className="text-slate-300 hover:text-white text-sm">Images</Link>
                        <Link href="/captions" className="text-slate-300 hover:text-white text-sm">Captions</Link>
                        <Link href="/caption-requests" className="text-slate-300 hover:text-white text-sm">Caption requests</Link>
                        <Link href="/caption-examples" className="text-slate-300 hover:text-white text-sm">Caption examples</Link>
                        <Link href="/humor-flavors" className="text-slate-300 hover:text-white text-sm">Flavors</Link>
                        <Link href="/humor-flavor-steps" className="text-slate-300 hover:text-white text-sm">Flavor steps</Link>
                        <Link href="/humor-mix" className="text-slate-300 hover:text-white text-sm">Humor mix</Link>
                        <Link href="/terms" className="text-slate-300 hover:text-white text-sm">Terms</Link>
                        <Link href="/llm-models" className="text-slate-300 hover:text-white text-sm">LLM models</Link>
                        <Link href="/llm-providers" className="text-slate-300 hover:text-white text-sm">LLM providers</Link>
                        <Link href="/llm-prompt-chains" className="text-slate-300 hover:text-white text-sm">Prompt chains</Link>
                        <Link href="/llm-responses" className="text-slate-300 hover:text-white text-sm">LLM responses</Link>
                        <Link href="/allowed-signup-domains" className="text-slate-300 hover:text-white text-sm">Signup domains</Link>
                        <Link href="/whitelist-emails" className="text-slate-300 hover:text-white text-sm">Whitelist emails</Link>
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
                        <LogoutButton />
                        <span className="text-sm text-slate-500">Admin</span>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </div>
    )
}
