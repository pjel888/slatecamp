import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import React from 'react'

const WikiPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <SharedPageLayout>{children}</SharedPageLayout>
}

export default WikiPageLayout
