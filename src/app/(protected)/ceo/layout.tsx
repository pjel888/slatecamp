import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UnifiedAppShell } from '@/components/layout/UnifiedAppShell'

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

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['ceo', 'super_admin'].includes(profile.role ?? '')) {
    redirect('/dashboard')
  }

  return (
    <UnifiedAppShell role="ceo" displayName={profile.display_name || 'CEO'}>
      {children}
    </UnifiedAppShell>
  )
}
