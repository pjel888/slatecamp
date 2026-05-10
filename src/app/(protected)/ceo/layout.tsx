import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { createClient } from '@/lib/supabase/server'
import { CeoShell } from './_components/CeoShell'
import { resolveCurrentUserRole } from '@/lib/entitlements/resolve-role'
import { canAccessCeoPortalForRole } from '@/lib/entitlements/policy'

export const metadata = {
  title: 'CEO Dashboard — SlateCamp',
}

export const dynamic = 'force-dynamic'

export default async function CeoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.auth.login)
  const roleResolution = await resolveCurrentUserRole()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (!canAccessCeoPortalForRole(roleResolution.normalizedRole)) {
    redirect(ROUTES.dashboard.root)
  }

  return (
    <CeoShell displayName={profile?.display_name || 'CEO'}>
      {children}
    </CeoShell>
  )
}
