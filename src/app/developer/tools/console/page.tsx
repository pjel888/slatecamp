import { createClient, getUser } from '@/lib/supabase/server'
import { getConnectionState } from '@/lib/dev/dev-mode'
import { developerNextVersion } from '@/lib/developer/tech-stack'
import { ConsoleClient } from './console-client'

export default async function DeveloperConsolePage() {
  const supabase = await createClient()

  // Fetch user and feature flags in parallel — flags don't depend on user.id
  const [{ data: { user } }, { data: dbFlagRows }] = await Promise.all([
    getUser(),
    supabase
      .from('feature_flags')
      .select('key, enabled'),
  ])

  const dbFlags: Record<string, boolean> = {}
  for (const row of dbFlagRows ?? []) {
    dbFlags[row.key] = row.enabled
  }

  return (
    <ConsoleClient
      systemInfo={{
        env: process.env.NODE_ENV ?? 'development',
        nextVersion: developerNextVersion,
        userId: user?.id ?? '',
        userEmail: user?.email ?? '',
        userRole: user?.app_metadata?.role ?? 'user',
        connectionState: getConnectionState(),
      }}
      dbFlags={dbFlags}
    />
  )
}
