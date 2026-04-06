import type { CommandPaletteProps, NavGroup } from '@/components/portal'

export const developerPortalPagesFixture: CommandPaletteProps['pages'] = [
  {
    title: 'Overview',
    href: '/developer',
    group: 'Portal',
    keywords: 'home portal dashboard',
  },
  {
    title: 'Architecture',
    href: '/developer/architecture',
    group: 'Portal',
    keywords: 'system database auth deployment',
  },
  {
    title: 'API Reference',
    href: '/developer/api-reference',
    group: 'Portal',
    keywords: 'actions endpoints webhooks',
  },
  {
    title: 'Status Overview',
    href: '/developer/status',
    group: 'Status',
    keywords: 'health uptime services operational',
  },
  {
    title: 'Database Status',
    href: '/developer/status/database',
    group: 'Status',
    keywords: 'postgres migrations rls connections',
  },
  {
    title: 'Infrastructure Status',
    href: '/developer/status/infrastructure',
    group: 'Status',
    keywords: 'latency edge deployment api',
  },
  {
    title: 'Dev Tools',
    href: '/developer/tools',
    group: 'Tools',
    keywords: 'console database logs test utilities',
  },
  {
    title: 'Console',
    href: '/developer/tools/console',
    group: 'Tools',
    keywords: 'flags impersonation diagnostics',
  },
]

export const developerPortalNavFixture: NavGroup[] = [
  {
    label: 'Portal',
    items: [
      {
        label: 'Overview',
        href: '/developer',
      },
      {
        label: 'Architecture',
        href: '/developer/architecture',
      },
      {
        label: 'API Reference',
        href: '/developer/api-reference',
      },
    ],
  },
  {
    label: 'Status',
    items: [
      {
        label: 'Status Overview',
        href: '/developer/status',
      },
      {
        label: 'Database Status',
        href: '/developer/status/database',
      },
      {
        label: 'Infrastructure Status',
        href: '/developer/status/infrastructure',
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        label: 'Dev Tools',
        href: '/developer/tools',
      },
      {
        label: 'Console',
        href: '/developer/tools/console',
      },
    ],
  },
]
