import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
import { getFeatureFlags, getEffectiveTier } from '@/lib/admin/feature-flags'
import { Sidebar } from '@/components/shared/Sidebar'
import { Navbar } from '@/components/shared/Navbar'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { QuickActionsBar } from '@/components/shared/QuickActionsBar'
import { DevToolbar } from '@/components/dev/dev-toolbar'
import { BreadcrumbProvider } from '@/lib/context/breadcrumb-context'
import { TierProvider } from '@/lib/context/tier-context'
import { ActiveSessionProvider } from '@/lib/context/active-session-context'
import type {
  UserTier,
  UserSubscription,
  UserGlobalStats,
  Discipline,
} from '@/types/app'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) redirect(ROUTES.LOGIN)

  // Ensure user has required records in the new schema
  await bootstrapUser(user.id)

  // Fetch new data structures
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: stats, error: statsError } = await supabase
    .from('user_global_stats')
    .select('*, disciplines(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (statsError) {
    console.error('[DashboardLayout] Error fetching stats:', statsError)
  }

  const userStats = stats as
    | (UserGlobalStats & { disciplines: Discipline | null })
    | null
  const currentTier = (subscription?.tier ?? 'free') as UserTier

  console.log('[DashboardLayout] User ID:', user.id)
  console.log('[DashboardLayout] Stats found:', !!userStats)
  console.log(
    '[DashboardLayout] Discipline ID:',
    userStats?.current_discipline_id,
  )

  // Apple HIG: Onboarding redirect if no discipline is selected
  if (!userStats?.current_discipline_id && !isDemo) {
    console.log(
      '[DashboardLayout] No discipline selected, redirecting to /onboarding',
    )
    redirect('/onboarding')
  }

  // Admin check (could be moved to a better place later)
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
      <ActiveSessionProvider>
        <div className='flex h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200'>
          <Sidebar
            isAdmin={isAdmin}
            isDevMode={showDevTools}
            userDisplay={{
              name: user.user_metadata?.full_name ?? user.email ?? 'User',
              avatarUrl: user.user_metadata?.avatar_url ?? null,
            }}
            tier={effectiveTier}
            currentDiscipline={
              userStats?.disciplines?.name ?? 'No Discipline Selected'
            }
          />
          <div className='flex flex-1 flex-col overflow-hidden border-l border-zinc-200'>
            <BreadcrumbProvider>
              <Navbar isAdmin={isAdmin} />
              <div>
                <DashboardHeader />
              </div>
              <main className='flex-1 overflow-y-auto '>
                {children}
              </main>
              <QuickActionsBar />
            </BreadcrumbProvider>
          </div>
          {showDevTools && flags != null && (
            <DevToolbar
              connectionState={isDemo ? 'local' : 'connected'}
              currentTier={currentTier}
              effectiveTier={effectiveTier}
              flags={flags}
            />
          )}
        </div>
      </ActiveSessionProvider>
    </TierProvider>
  )
}
