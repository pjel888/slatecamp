import type { UserRole } from '@/types/layout'
import { getRoleConfig } from '@/config/navigation'
import { ShellClient } from './ShellClient'

// ── Server Component ──

interface UnifiedAppShellProps {
  role: UserRole
  displayName?: string
  children: React.ReactNode
}

export const UnifiedAppShell = ({ role, displayName, children }: UnifiedAppShellProps) => {
  const config = getRoleConfig(role)

  return (
    <ShellClient
      shellTitle={config.shellTitle}
      sections={config.sections}
      footerItems={config.footerItems}
      role={role}
      displayName={displayName}
    >
      {children}
    </ShellClient>
  )
}
