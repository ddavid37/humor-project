import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { GenericCrud } from '@/components/GenericCrud'

export default async function WhitelistEmailsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: rows, error } = await supabase
        .from('whitelist_email_addresses')
        .select('*')
        .order('id')

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Whitelisted E-mail Addresses</h1>
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Whitelisted E-mail Addresses</h1>
            <GenericCrud title="Emails" apiBase="whitelist-emails" initialRows={rows ?? []} />
        </div>
    )
}
