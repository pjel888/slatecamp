import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
import { getFeatureFlags, getEffectiveTier } from '@/lib/admin/feature-flags'
import { UnifiedAppShell } from '@/components/layout/UnifiedAppShell'
import { DevToolbar } from '@/components/dev/dev-toolbar'
import { DevKeyboardProvider } from '@/components/dev/dev-keyboard-provider'
import { BreadcrumbProvider } from '@/lib/context/breadcrumb-context'
import { NoteContextProvider } from '@/lib/context/note-context'
import { TierProvider } from '@/lib/context/tier-context'
import { ActiveSessionProvider } from '@/lib/context/active-session-context'
import { DisciplineProvider } from '@/lib/context/discipline-context'
import { DashboardPageSkeleton } from '@/components/shared/DashboardPageSkeleton'
import type {
  UserTier,
  UserGlobalStats,
  Discipline,
} from '@/types/app'

import { isDemoMode } from '@/lib/demo/config'

async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const isDemo = isDemoMode()
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) redirect(ROUTES.LOGIN)

  if (!isDemo) {
    await bootstrapUser(user.id)
  }

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('*, disciplines(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: allDisciplines } = await supabase
    .from('disciplines')
    .select('*')
    .order('name')

  const userStats = stats as (UserGlobalStats & { disciplines: Discipline | null }) | null
  const currentTier = (subscription?.tier ?? 'free') as UserTier

  const isAdmin =
    user.app_metadata?.role === 'admin' ||
    user.email?.endsWith('@slatecamp.com') ||
    user.email === 'philipjonlewis@gmail.com'
  const showDevTools = isDemo || isAdmin

  const flags = showDevTools ? await getFeatureFlags() : null
  const effectiveTier = flags
    ? getEffectiveTier(currentTier, true, flags)
    : currentTier

  const displayName = user.user_metadata?.full_name ?? user.email ?? 'Camper'

  return (
    <TierProvider
      tier={currentTier}
      effectiveTier={effectiveTier}
      isDevMode={showDevTools}
    >
      <DisciplineProvider
        initialDiscipline={userStats?.disciplines ?? null}
        initialDisciplines={allDisciplines as Discipline[] ?? []}
      >
        <ActiveSessionProvider>
          <NoteContextProvider>
            <BreadcrumbProvider>
              <UnifiedAppShell role="student" displayName={displayName}>
                {children}
              </UnifiedAppShell>
              {showDevTools && flags != null && (
                <>
                  <DevToolbar
                    connectionState={isDemo ? 'local' : 'connected'}
                    currentTier={currentTier}
                    effectiveTier={effectiveTier}
                    flags={flags}
                  />
                  <DevKeyboardProvider
                    systemInfo={{
                      env: process.env.NODE_ENV ?? 'development',
                      nextVersion: '15',
                      userId: user.id,
                      userEmail: user.email ?? '',
                      userRole: user.app_metadata?.role ?? 'user',
                      connectionState: isDemo ? 'local' : 'connected',
                    }}
                  />
                </>
              )}
            </BreadcrumbProvider>
          </NoteContextProvider>
        </ActiveSessionProvider>
      </DisciplineProvider>
    </TierProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}
