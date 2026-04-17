'use client'

import { usePathname } from 'next/navigation'
import { Stack, Monitor, Database, FileText, Flask, SquaresFour, Code, Wrench } from '@phosphor-icons/react/dist/ssr'
import { SidebarNavGroup, SidebarNavItem } from '@/components/shared/sidebar-nav'
import { ROUTES } from '@/lib/routes'

const navSections = [
  {
    label: 'Portal',
    items: [
      { href: ROUTES.developer.root, label: 'Overview', icon: <SquaresFour className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Documentation',
    items: [
      { href: ROUTES.developer.apiReference, label: 'API Reference', icon: <Code className="w-4 h-4" /> },
      { href: ROUTES.developer.architecture, label: 'Architecture', icon: <Stack className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: ROUTES.developer.tools, label: 'Dev Tools', icon: <Wrench className="w-4 h-4" /> },
      { href: ROUTES.developer.console, label: 'Console', icon: <Monitor className="w-4 h-4" /> },
      { href: ROUTES.developer.db, label: 'Database Browser', icon: <Database className="w-4 h-4" /> },
      { href: ROUTES.developer.logs, label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
      { href: ROUTES.developer.testData, label: 'Test Data', icon: <Flask className="w-4 h-4" /> },
    ],
  },
]

export const DevPortalSidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 bg-muted/40 sticky top-12 h-[calc(100vh-48px)] overflow-y-auto py-3 px-2 hidden lg:block">
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
                item.href === ROUTES.developer.root
                  ? pathname === ROUTES.developer.root
                  : pathname === item.href || (item.href !== ROUTES.developer.tools && pathname.startsWith(item.href + '/'))
              }
            />
          ))}
        </SidebarNavGroup>
      ))}
    </aside>
  )
}
