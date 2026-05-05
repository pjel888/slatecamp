import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
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
import { EntitlementProvider } from '@/lib/context/entitlement-context'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'
import { developerNextVersion } from '@/lib/developer/tech-stack'
import { buildDevSystemInfo, getConnectionState } from '@/lib/dev/dev-mode'

interface DashboardLayoutContentProps {
  children: React.ReactNode
}

const DashboardLayoutContent = async ({
  children,
}: DashboardLayoutContentProps) => {
  const isDemo = isDemoMode()
  const headerList = await headers()
  const pathname =
    headerList.get('x-pathname') ?? headerList.get('next-url') ?? ''
  const isLabPath =
    pathname === ROUTES.lab.root || pathname.startsWith(`${ROUTES.lab.root}/`)
  const isQuizSessionPath = pathname.startsWith(
    `${ROUTES.dashboard.quiz}/session/`,
  )
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) redirect(ROUTES.auth.login)

  if (!isDemo) {
    try {
      await bootstrapUser(user.id)
    } catch (err) {
      console.error('[DashboardLayoutContent] Bootstrap failed:', err)
    }
  }

  const [
    { data: subscription },
    { data: stats },
    { data: profileCompletion },
    allDisciplines,
    entitlements,
  ] = await Promise.all([
    isLabPath
      ? Promise.resolve({ data: null })
      : supabase
          .from('user_subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .maybeSingle(),
    isLabPath
      ? Promise.resolve({ data: null })
      : supabase
          .from('user_global_stats')
          .select('*, disciplines(*)')
          .eq('user_id', user.id)
          .maybeSingle(),
    isLabPath
      ? Promise.resolve({ data: null })
      : supabase
          .from('profiles')
          .select('onboarding_completed_at')
          .eq('id', user.id)
          .maybeSingle(),
    isLabPath ? Promise.resolve([]) : getCachedDisciplines(),
    getViewerEntitlements([ENTITLEMENT_FEATURE_KEYS.devToolbar]),
  ])

  const userStats = stats as
    | (UserGlobalStats & { disciplines: Discipline | null })
    | null
  const onboardingCompletedAt = isLabPath
    ? null
    : ((profileCompletion as { onboarding_completed_at?: string | null } | null)
        ?.onboarding_completed_at ??
      (userStats as { onboarding_completed_at?: string | null } | null)
        ?.onboarding_completed_at ??
      null)
  const currentTier = (subscription?.tier ??
    entitlements.rawTier ??
    'free') as UserTier
  const isSettingsPath =
    pathname === ROUTES.dashboard.settings ||
    pathname.startsWith(ROUTES.dashboard.settings + '/')
  const isDashboardRoot = pathname === ROUTES.dashboard.root

  if (!isDemo && !isLabPath && !onboardingCompletedAt && !isSettingsPath) {
    redirect(ROUTES.auth.onboarding)
  }

  const userCanSeeDevToolbar = entitlements.tooling.devToolbar
  const showDevTools = isDemo || userCanSeeDevToolbar
  const effectiveTier = entitlements.effectiveTier
  const devToolbarFlags = {
    simulatedTier: entitlements.overrides.simulatedTier,
    spoofedTier: entitlements.overrides.legacySpoofedTier,
    bypass3dGate:
      entitlements.overrides.featureOverrides[
        ENTITLEMENT_FEATURE_KEYS.threeDLabFull
      ] === true,
    bypassAiGate:
      entitlements.overrides.featureOverrides[
        ENTITLEMENT_FEATURE_KEYS.aiAssistantUnlimited
      ] === true,
    bypassSrsGate:
      entitlements.overrides.featureOverrides[
        ENTITLEMENT_FEATURE_KEYS.srsReview
      ] === true,
  }
  const devConnectionState = entitlements.overrides.localDevBypassActive
    ? 'local'
    : getConnectionState()

  if (isLabPath) {
    return (
      <div className='flex h-screen w-full flex-col overflow-hidden text-foreground font-sans selection:bg-muted bg-page-bg'>
        <main className='flex-1 min-h-0 min-w-0 overflow-hidden bg-page-bg'>
          {children}
        </main>
        {showDevTools && (
          <>
            <DevToolbar
              connectionState={devConnectionState}
              currentTier={currentTier}
              effectiveTier={effectiveTier}
              flags={devToolbarFlags}
            />
            <DevKeyboardProvider
              systemInfo={buildDevSystemInfo({
                env: process.env.NODE_ENV ?? 'development',
                nextVersion: developerNextVersion,
                userId: user.id,
                userEmail: user.email ?? '',
                userRole: entitlements.normalizedRole,
                connectionState: devConnectionState,
              })}
            />
          </>
        )}
        <Toaster />
      </div>
    )
  }

  return (
    <EntitlementProvider entitlements={entitlements}>
      <TierProvider
        tier={currentTier}
        effectiveTier={effectiveTier}
        isDevMode={showDevTools}
      >
        <DisciplineProvider
          initialDiscipline={userStats?.disciplines ?? null}
          initialDisciplines={(allDisciplines as Discipline[]) ?? []}
        >
          <ActiveSessionProvider>
            <NoteContextProvider>
              <SidebarProvider>
                <div className='flex flex-col h-screen overflow-hidden text-foreground font-sans selection:bg-muted bg-page-bg lg:flex-row'>
                  {/* Mobile top bar */}
                  <MobileSidebarShell
                    userDisplay={{
                      name:
                        user.user_metadata?.full_name ?? user.email ?? 'User',
                      avatarUrl:
                        user.user_metadata?.avatar_url ??
                        user.user_metadata?.picture ??
                        null,
                    }}
                    tierLabel={effectiveTier}
                    showTierBadge={
                      entitlements.decisions[
                        ENTITLEMENT_FEATURE_KEYS.questionsUnlimited
                      ]?.allowed ?? false
                    }
                  />
                  {/* Desktop layout: sidebar + content in flex row */}
                  <div className='flex flex-1 min-h-0'>
                    <Sidebar
                      isAdmin={userCanSeeDevToolbar}
                      isDevMode={showDevTools}
                      userDisplay={{
                        name:
                          user.user_metadata?.full_name ?? user.email ?? 'User',
                        avatarUrl:
                          user.user_metadata?.avatar_url ??
                          user.user_metadata?.picture ??
                          null,
                      }}
                      tier={effectiveTier}
                    />
                    <SidebarContent>
                      <div className='relative flex flex-1 flex-col min-h-0'>
                        {isDashboardRoot && (
                          <div className='pointer-events-none absolute inset-0 z-0 bg-[url("/images/dashboard/Dashboard-BG-Image.png")] bg-cover bg-bottom bg-no-repeat opacity-50' />
                        )}
                        <BreadcrumbProvider>
                          <div className='relative z-10 flex flex-col flex-1 min-h-0'>
                            <Navbar isAdmin={userCanSeeDevToolbar} />
                            {!isQuizSessionPath && (
                              <div>
                                <DashboardHeader userId={user.id} />
                              </div>
                            )}
                            <main
                              className={`flex-1 min-h-0 min-w-0 ${isQuizSessionPath ? 'overflow-hidden bg-surface-focused' : isDashboardRoot ? 'overflow-y-auto' : 'overflow-y-auto bg-page-bg'}`}
                            >
                              {children}
                            </main>
                          </div>
                        </BreadcrumbProvider>
                      </div>
                    </SidebarContent>
                  </div>
                  {showDevTools && (
                    <>
                      <DevToolbar
                        connectionState={devConnectionState}
                        currentTier={currentTier}
                        effectiveTier={effectiveTier}
                        flags={devToolbarFlags}
                      />
                      <DevKeyboardProvider
                        systemInfo={buildDevSystemInfo({
                          env: process.env.NODE_ENV ?? 'development',
                          nextVersion: developerNextVersion,
                          userId: user.id,
                          userEmail: user.email ?? '',
                          userRole: entitlements.normalizedRole,
                          connectionState: devConnectionState,
                        })}
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
    </EntitlementProvider>
  )
}

export { DashboardLayoutContent }
