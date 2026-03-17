'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileQuestion, 
  FileText, 
  Box, 
  Network, 
  ClipboardList,
  Shield
} from 'lucide-react'

const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
  { href: '/admin/wiki', label: 'Wiki', icon: FileText },
  { href: '/admin/assets', label: '3D Assets', icon: Box },
  { href: '/admin/taxonomy', label: 'Taxonomy', icon: Network },
  { href: '/admin/audit', label: 'Audit Log', icon: Shield },
  { href: '/admin/reviews', label: 'Reviews', icon: ClipboardList },
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
                ? "bg-blue-600/10 text-blue-600 font-medium border border-blue-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
