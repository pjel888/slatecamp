'use client'

import { usePathname } from 'next/navigation'
import { useDevStore } from '@/stores/dev-store'
import { Monitor, Globe, User, Shield } from 'lucide-react'

interface SystemInfoProps {
  env: string
  nextVersion: string
  userId: string
  userEmail: string
  userRole: string
  connectionState: 'local' | 'connected'
}

export function SystemInfo({
  env,
  nextVersion,
  userId,
  userEmail,
  userRole,
  connectionState,
}: SystemInfoProps) {
  const pathname = usePathname()
  const isImpersonating = useDevStore((s) => s.isImpersonating)
  const impersonatedRole = useDevStore((s) => s.impersonatedRole)
  const impersonatedTier = useDevStore((s) => s.impersonatedTier)

  const rows = [
    { icon: Globe, label: 'Route', value: pathname },
    { icon: Monitor, label: 'Environment', value: env },
    { icon: Monitor, label: 'Next.js', value: nextVersion },
    { icon: Monitor, label: 'Connection', value: connectionState },
    { icon: User, label: 'User ID', value: userId.slice(0, 8) + '...' },
    { icon: User, label: 'Email', value: userEmail },
    { icon: Shield, label: 'Real Role', value: userRole },
  ]

  return (
    <div>
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
        System Info
      </h3>
      <div className="space-y-1.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between px-2 py-1">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Icon className="h-3 w-3" />
              {label}
            </span>
            <span className="text-[11px] font-mono text-foreground truncate max-w-[180px]">
              {value}
            </span>
          </div>
        ))}
        {isImpersonating && (
          <div className="mt-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1.5">
            <span className="text-[10px] font-semibold text-amber-500">
              IMPERSONATING: {impersonatedRole} / {impersonatedTier}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
