'use client'

import * as React from 'react'
import { List, ListBullets } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface WikiLayoutClientProps {
  disciplineId: string | null
  disciplineName: string
  children: React.ReactNode
}

export function WikiLayoutClient({
  disciplineId,
  disciplineName,
  children,
}: WikiLayoutClientProps) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {children}
    </div>
  )
}

/**
 * Mobile drawer trigger for the left sidebar (navigation tree).
 * Rendered in the header on small screens.
 */
export function WikiMobileNavTrigger({
  disciplineId,
  disciplineName,
}: {
  disciplineId: string | null
  disciplineName: string
}) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
          <SCIcon icon={List} size="sm" />
          <span className="sr-only">Open navigation</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <WikiSidebar
            disciplineId={disciplineId!}
            disciplineName={disciplineName}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

/**
 * Mobile drawer trigger for the right sidebar (ToC + actions).
 * Rendered in the header on small screens. Content is passed as children.
 */
export function WikiMobileActionsTrigger({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
          <SCIcon icon={ListBullets} size="sm" />
          <span className="sr-only">On this page</span>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0 overflow-y-auto">
          {children}
        </SheetContent>
      </Sheet>
    </div>
  )
}
