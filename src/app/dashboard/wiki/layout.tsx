import { WikiLayoutContent } from '@/components/wiki/navigation/WikiLayoutContent'
import React, { Suspense } from 'react'
import WikiLoading from './loading'
import { LearnLayout } from '@/components/layouts/category/LearnLayout'

export default function WikiPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LearnLayout
      hero={{
        subtitle: 'Knowledge Wiki',
        description: 'Authoritative LEA guide mapped to the exam syllabus.',
      }}
      fullHeight
    >
      <Suspense fallback={<WikiLoading />}>
        <WikiLayoutContent>{children}</WikiLayoutContent>
      </Suspense>
    </LearnLayout>
  )
}
