'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  SquaresFour,
  FileText,
  Cube,
  TreeStructure,
  ClipboardText,
  ShieldCheck,
  Question
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: SquaresFour, exact: true },
  { href: '/admin/questions', label: 'Questions', icon: Question },
  { href: '/admin/wiki', label: 'Wiki', icon: FileText },
  { href: '/admin/assets', label: '3D Assets', icon: Cube },
  { href: '/admin/taxonomy', label: 'Taxonomy', icon: TreeStructure },
  { href: '/admin/audit', label: 'Audit Log', icon: ShieldCheck },
  { href: '/admin/reviews', label: 'Reviews', icon: ClipboardText },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="p-2 space-y-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive 
                ? "bg-primary/10 text-primary font-medium border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <SCIcon icon={item.icon} size="sm" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
