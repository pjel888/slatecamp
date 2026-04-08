import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { AnalyticsTabNav } from '@/components/analytics/AnalyticsTabNav'
import React from 'react'

const AnalyticsPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SharedPageLayout>
      <AnalyticsTabNav />
      {children}
    </SharedPageLayout>
  )
}

export default AnalyticsPageLayout
