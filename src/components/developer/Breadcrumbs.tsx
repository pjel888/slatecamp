'use client'

import { usePathname } from 'next/navigation'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { getDeveloperBreadcrumbLabel } from '@/lib/developer/surface-registry'

const toPascalCase = (slug: string) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return null
  }

  const crumbs = segments.map((segment, index) => ({
    label: getDeveloperBreadcrumbLabel(
      `/${segments.slice(0, index + 1).join('/')}`,
      segment,
    ) ?? toPascalCase(segment),
    href:
      index === segments.length - 1
        ? undefined
        : `/${segments.slice(0, index + 1).join('/')}`,
  }))

  return (
    <Breadcrumb items={crumbs} separator="slash" className="mb-3 text-[11px]" />
  )
}
