import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import React from 'react'

const AnalyticsPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <SharedPageLayout>{children}</SharedPageLayout>
}

export default AnalyticsPageLayout
