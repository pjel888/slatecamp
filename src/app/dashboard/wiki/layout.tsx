import { WikiLayoutContent } from '@/components/wiki/navigation/WikiLayoutContent'
import React, { Suspense } from 'react'
import WikiLoading from './loading'
import { LearnLayout } from '@/components/layouts/category/LearnLayout'

export default function WikiPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <LearnLayout
      hero={{
        subtitle: 'Knowledge Wiki',
        description: 'The authoritative guide for the Licensure Examination for Architects (LEA). Select a topic from the taxonomy tree to begin your study.',
      }}
      fullHeight
    >
      <Suspense fallback={<WikiLoading />}>
        <WikiLayoutContent>{children}</WikiLayoutContent>
      </Suspense>
    </LearnLayout>
  )
}
