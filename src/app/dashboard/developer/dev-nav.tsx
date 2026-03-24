'use client'

import Link from 'next/link'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { DEV_NAV_ITEMS } from '@/lib/constants/developer'

export const DevNav = () => (
  <nav className="w-48 shrink-0 border-r border-border bg-background p-3">
    <div className="mb-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Developer
      </h2>
    </div>
    <ul className="space-y-0.5">
      {DEV_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <SCIcon icon={Icon} size="xs" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
)
