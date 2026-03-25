import { Suspense } from 'react'
import { DashboardPageSkeleton } from '@/components/shared/DashboardPageSkeleton'
import { DashboardLayoutContent } from '@/components/dashboard/DashboardLayoutContent'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}
