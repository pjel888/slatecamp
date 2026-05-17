import { DataLayout } from '@/components/layouts/category/DataLayout'
import { AnalyticsTabNav } from '@/components/analytics/AnalyticsTabNav'
import React from 'react'

const AnalyticsPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DataLayout
      fullHeight
      hero={{
        subtitle: 'Analytics',
        description:
          'Track progress, identify weak areas, measure LEA readiness.',
      }}
      contentClassName="flex flex-1 flex-col gap-2 overflow-hidden px-2 pb-2 pt-1"
    >
      <AnalyticsTabNav />
      {children}
    </DataLayout>
  )
}

export default AnalyticsPageLayout
