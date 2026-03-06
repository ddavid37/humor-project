import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export default async function AdminLoginPage() {
    const auth = await requireSuperAdmin()
    if (auth.allowed) redirect('/dashboard')
    return <LoginForm />
}
