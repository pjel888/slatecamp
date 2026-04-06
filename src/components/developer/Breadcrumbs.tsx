'use client'

import { usePathname } from 'next/navigation'

import { Breadcrumb } from '@/components/shared/breadcrumb'

const SEGMENT_LABELS: Record<string, string> = {
  developer: 'Developer Portal',
  'design-system': 'Design System',
  wiki: 'Wiki',
  questions: 'Questions',
  'testing-path': 'Testing Path',
  shared: 'Shared',
  'content-blocks': 'Content Blocks',
  widgets: 'Interactive Widgets',
  status: 'Status',
  database: 'Database',
  infrastructure: 'Infrastructure',
  architecture: 'Architecture',
  'api-reference': 'API Reference',
  tools: 'Dev Tools',
  console: 'Console',
  logs: 'Audit Logs',
  'test-data': 'Test Data',
}

const toPascalCase = (slug: string) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

const labelFor = (segment: string) => SEGMENT_LABELS[segment] ?? toPascalCase(segment)

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return null
  }

  const crumbs = segments.map((segment, index) => ({
    label: labelFor(segment),
    href:
      index === segments.length - 1
        ? undefined
        : `/${segments.slice(0, index + 1).join('/')}`,
  }))

  return (
    <Breadcrumb items={crumbs} separator="slash" className="mb-3 text-[11px]" />
  )
}
