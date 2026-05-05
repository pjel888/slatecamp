import { DataLayout } from '@/components/layouts/category/DataLayout'
import { AnalyticsTabNav } from '@/components/analytics/AnalyticsTabNav'
import React from 'react'

const AnalyticsPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DataLayout
      hero={{
        subtitle: 'Analytics',
        description:
          'Track your study progress, identify weak areas, and measure readiness for the LEA.',
      }}
    >
      <AnalyticsTabNav />
      {children}
    </DataLayout>
  )
}

export default AnalyticsPageLayout
