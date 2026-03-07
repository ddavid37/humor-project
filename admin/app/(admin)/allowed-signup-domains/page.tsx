import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { GenericCrud } from '@/components/GenericCrud'

export default async function AllowedSignupDomainsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase
        .from('allowed_signup_domains')
        .select('*')
        .order('id')

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Allowed Signup Domains</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Allowed Signup Domains</h1>
            <GenericCrud title="Domains" apiBase="allowed-signup-domains" initialRows={rows ?? []} />
        </div>
    )
}
