import type { UserRole } from '@/types/layout'
import { ShellClient } from './ShellClient'

// ── Server Component ──
// Note: getRoleConfig() is called in ShellClient (client side) because
// navigation config contains React component references (Lucide icons)
// that cannot be serialized across the Server→Client boundary.

interface UnifiedAppShellProps {
  role: UserRole
  displayName?: string
  children: React.ReactNode
}

export const UnifiedAppShell = ({ role, displayName, children }: UnifiedAppShellProps) => (
  <ShellClient role={role} displayName={displayName}>
    {children}
  </ShellClient>
)
