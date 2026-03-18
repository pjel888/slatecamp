import { WikiLayoutContent } from '@/components/wiki/WikiLayoutContent'
import React, { Suspense } from 'react'
import WikiLoading from './loading'

export default function WikiPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <Suspense fallback={<WikiLoading />}>
        <WikiLayoutContent>{children}</WikiLayoutContent>
      </Suspense>
    </div>
  )
}
