import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth'
import { AdminNav } from '@/components/AdminNav'

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
            <AdminNav />
            <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </div>
    )
}
