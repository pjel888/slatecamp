import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: {
    template: '%s — SlateCamp Developer Portal',
    default: 'SlateCamp Developer Portal',
  },
  description: 'Internal documentation, API reference, architecture guides, and dev tools for SlateCamp.',
}
import { ROUTES } from '@/lib/routes'
import { DevPortalShell } from './_components/DevPortalShell'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

export default async function DeveloperPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.developerPortal,
  ])

  const canAccess =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.developerPortal]?.allowed ?? false

  if (!canAccess) {
    redirect(ROUTES.DASHBOARD)
  }

  const env: 'development' | 'staging' | 'production' = entitlements.overrides.allowDevPortalBypass
    ? 'development'
    : process.env.NEXT_PUBLIC_APP_URL?.includes('staging')
      ? 'staging'
      : 'production'

  return (
    <DevPortalShell env={env}>
      {children}
    </DevPortalShell>
  )
}
