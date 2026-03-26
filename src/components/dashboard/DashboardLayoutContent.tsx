import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
import { getFeatureFlags, getEffectiveTier } from '@/lib/admin/feature-flags'
import { SidebarProvider } from '@/components/sidebar/SidebarProvider'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { SidebarContent } from '@/components/sidebar/SidebarContent'
import { MobileSidebarShell } from '@/components/sidebar/MobileSidebarShell'
import { Navbar } from '@/components/shared/Navbar'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { DevToolbar } from '@/components/dev/dev-toolbar'
import { DevKeyboardProvider } from '@/components/dev/dev-keyboard-provider'
import { BreadcrumbProvider } from '@/lib/context/breadcrumb-context'
import { NoteContextProvider } from '@/lib/context/note-context'
import { TierProvider } from '@/lib/context/tier-context'
import { ActiveSessionProvider } from '@/lib/context/active-session-context'
import { DisciplineProvider } from '@/lib/context/discipline-context'
import { isDemoMode } from '@/lib/demo/config'
import { getCachedDisciplines } from '@/lib/actions/cached-queries'
import type { UserTier, UserGlobalStats, Discipline } from '@/types/app'

interface DashboardLayoutContentProps {
  children: React.ReactNode
}

const DashboardLayoutContent = async ({ children }: DashboardLayoutContentProps) => {
  const isDemo = isDemoMode()
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) redirect(ROUTES.LOGIN)

  if (!isDemo) {
    await bootstrapUser(user.id)
  }

  const [{ data: subscription }, { data: stats }, allDisciplines] = await Promise.all([
    supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('user_global_stats')
      .select('*, disciplines(*)')
      .eq('user_id', user.id)
      .maybeSingle(),
    getCachedDisciplines(),
  ])

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
          <SidebarProvider>
            <div className='flex h-screen overflow-hidden text-gray-900 font-sans selection:bg-gray-200 bg-page-bg'>
              <Sidebar
                isAdmin={isAdmin}
                isDevMode={showDevTools}
                userDisplay={{
                  name: user.user_metadata?.full_name ?? user.email ?? 'User',
                  avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
                }}
                tier={effectiveTier}
              />
              <MobileSidebarShell
                userDisplay={{
                  name: user.user_metadata?.full_name ?? user.email ?? 'User',
                  avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
                }}
                tier={effectiveTier}
              />
              <SidebarContent>
                <BreadcrumbProvider>
                  <Navbar isAdmin={isAdmin} />
                  <div>
                    <DashboardHeader userId={user.id} />
                  </div>
                  <main className='flex-1 min-h-0 overflow-y-auto bg-page-bg'>
                    <Suspense fallback={
                      <div className="flex flex-col gap-3 p-2 animate-in fade-in-0 duration-100">
                        <div className="h-7 w-48 rounded bg-border-default/40 animate-pulse" />
                        <div className="h-4 w-72 rounded bg-border-default/30 animate-pulse" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="h-32 rounded-md bg-border-default/20 animate-pulse" />
                          <div className="h-32 rounded-md bg-border-default/20 animate-pulse" />
                          <div className="h-32 rounded-md bg-border-default/20 animate-pulse" />
                          <div className="h-32 rounded-md bg-border-default/20 animate-pulse" />
                        </div>
                      </div>
                    }>
                      {children}
                    </Suspense>
                  </main>
                </BreadcrumbProvider>
              </SidebarContent>
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
            </div>
          </SidebarProvider>
          </NoteContextProvider>
        </ActiveSessionProvider>
      </DisciplineProvider>
    </TierProvider>
  )
}

export { DashboardLayoutContent }
