import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { createClient } from '@/lib/supabase/server'
import { CeoShell } from './_components/CeoShell'

export const metadata = {
  title: 'CEO Dashboard — SlateCamp',
}

export default async function CeoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.auth.login)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['ceo', 'super_admin'].includes(profile.role ?? '')) {
    redirect(ROUTES.dashboard.root)
  }

  return (
    <CeoShell displayName={profile.display_name || 'CEO'}>
      {children}
    </CeoShell>
  )
}
