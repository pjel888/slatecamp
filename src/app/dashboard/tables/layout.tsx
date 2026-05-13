import React from 'react'
import { LearnLayout } from '@/components/layouts/category/LearnLayout'

export default function TablesPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <LearnLayout
      hero={{
        subtitle: 'Tables',
        description: 'Quick-reference tables for codes, standards, and exam data.',
      }}
      fullHeight
    >
      {children}
    </LearnLayout>
  )
}
