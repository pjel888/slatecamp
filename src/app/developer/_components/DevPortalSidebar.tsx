'use client'

import { usePathname } from 'next/navigation'
import { Stack, GridFour, Monitor, Database, FileText, Flask, SquaresFour, Palette, Code, Wrench } from '@phosphor-icons/react/dist/ssr'
import { SidebarNavGroup, SidebarNavItem } from '@/components/shared/sidebar-nav'

const navSections = [
  {
    label: 'Portal',
    items: [
      { href: '/developer', label: 'Overview', icon: <SquaresFour className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Documentation',
    items: [
      { href: '/developer/design-system', label: 'Design System', icon: <Palette className="w-4 h-4" /> },
      { href: '/developer/api-reference', label: 'API Reference', icon: <Code className="w-4 h-4" /> },
      { href: '/developer/architecture', label: 'Architecture', icon: <Stack className="w-4 h-4" /> },
      { href: '/developer/components', label: 'Component Library', icon: <GridFour className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/developer/tools', label: 'Dev Tools', icon: <Wrench className="w-4 h-4" /> },
      { href: '/developer/tools/console', label: 'Console', icon: <Monitor className="w-4 h-4" /> },
      { href: '/developer/tools/db', label: 'Database Browser', icon: <Database className="w-4 h-4" /> },
      { href: '/developer/tools/logs', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
      { href: '/developer/tools/test-data', label: 'Test Data', icon: <Flask className="w-4 h-4" /> },
    ],
  },
]

export const DevPortalSidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 bg-background border-r border-border sticky top-12 h-[calc(100vh-48px)] overflow-y-auto py-3 px-2 hidden lg:block">
      {navSections.map((section) => (
        <SidebarNavGroup key={section.label} label={section.label}>
          {section.items.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              className="text-xs py-1.5"
              active={
                item.href === '/developer'
                  ? pathname === '/developer'
                  : pathname === item.href || (item.href !== '/developer/tools' && pathname.startsWith(item.href + '/'))
              }
            />
          ))}
        </SidebarNavGroup>
      ))}
    </aside>
  )
}
