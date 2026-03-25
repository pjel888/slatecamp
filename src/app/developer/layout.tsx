import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: {
    template: '%s — SlateCamp Developer Portal',
    default: 'SlateCamp Developer Portal',
  },
  description: 'Internal documentation, API reference, architecture guides, and dev tools for SlateCamp.',
}
import { getUserRole } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/constants/routes'
import { DevPortalShell } from './_components/DevPortalShell'

export default async function DeveloperPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isBypass = process.env.ALLOW_DEV_PORTAL_BYPASS === 'true'
  const role = await getUserRole()

  if (!isBypass && !role) {
    redirect(ROUTES.DASHBOARD)
  }

  const env: 'development' | 'staging' | 'production' = isBypass
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
