import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
import { getFeatureFlags, getEffectiveTier } from '@/lib/admin/feature-flags'
import { getUserRole } from '@/lib/admin/roles'
import { canSeeDevToolbar, canUseInternalTierBypass } from '@/lib/admin/access-policy'
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
import { Toaster } from '@/components/ui/toaster'
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
    try {
      await bootstrapUser(user.id)
    } catch (err) {
      console.error('[DashboardLayoutContent] Bootstrap failed:', err)
      // We continue anyway, as the user might still have enough data to render something
    }
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
  const onboardingCompletedAt = (stats as { onboarding_completed_at?: string | null } | null)?.onboarding_completed_at ?? null
  const currentTier = (subscription?.tier ?? 'free') as UserTier
  const pathname = (await headers()).get('x-pathname') ?? ''
  const isSettingsPath = pathname === ROUTES.dashboard.settings || pathname.startsWith(ROUTES.dashboard.settings + '/')

  // ── Onboarding Guard ──────────────────────────────────────────────────────
  // If user is not in demo mode and has not completed onboarding, redirect them
  if (!isDemo && !onboardingCompletedAt && !isSettingsPath) {
    redirect(ROUTES.auth.onboarding)
  }

  const userRole = await getUserRole()
  const userCanSeeDevToolbar = canSeeDevToolbar(userRole)
  const userHasInternalTierBypass = canUseInternalTierBypass(userRole)
  const showDevTools = isDemo || userCanSeeDevToolbar

  const flags = showDevTools ? await getFeatureFlags() : null
  const effectiveTier = flags
    ? getEffectiveTier(currentTier, userHasInternalTierBypass, flags)
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
            <div className='flex flex-col h-screen overflow-hidden text-foreground font-sans selection:bg-muted bg-page-bg lg:flex-row'>
              {/* Mobile top bar */}
                <MobileSidebarShell
                  userDisplay={{
                    name: user.user_metadata?.full_name ?? user.email ?? 'User',
                    avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
                  }}
                  tier={effectiveTier}
                />
              {/* Desktop layout: sidebar + content in flex row */}
              <div className='flex flex-1 min-h-0'>
                <Sidebar
                  isAdmin={userCanSeeDevToolbar}
                  isDevMode={showDevTools}
                  userDisplay={{
                    name: user.user_metadata?.full_name ?? user.email ?? 'User',
                    avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
                  }}
                  tier={effectiveTier}
                />
                <SidebarContent>
                <BreadcrumbProvider>
                  <Navbar isAdmin={userCanSeeDevToolbar} />
                  <div>
                    <DashboardHeader userId={user.id} />
                  </div>
                  <main className='flex-1 min-h-0 min-w-0 overflow-y-auto bg-page-bg'>
                    {children}
                  </main>
                </BreadcrumbProvider>
              </SidebarContent>
              </div>
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
              <Toaster />
            </div>
          </SidebarProvider>
          </NoteContextProvider>
        </ActiveSessionProvider>
      </DisciplineProvider>
    </TierProvider>
  )
}

export { DashboardLayoutContent }
