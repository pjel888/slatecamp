'use client'

import * as React from 'react'
import { useWikiNavigation } from '@/components/wiki/WikiNavigationContext'

/** Skeleton bar — uses bg-zinc-200 for visibility against bg-background (#F5F5F5) */
const Bone = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-sm bg-zinc-200/80 ${className}`} />
)

const ArticleSkeleton = () => (
  <>
    {/* Breadcrumb header — matches WikiHeader sticky bar */}
    <div className="sticky top-0 z-30 border-b border-zinc-200 bg-background">
      <div className="px-6 py-3 flex items-center gap-2">
        <Bone className="h-3.5 w-16" />
        <span className="text-zinc-300 text-xs">/</span>
        <Bone className="h-3.5 w-24" />
        <span className="text-zinc-300 text-xs">/</span>
        <Bone className="h-3.5 w-32" />
      </div>
    </div>

    {/* Zone 3 + Zone 4 body */}
    <div className="flex flex-1 min-h-0">
      {/* Center pane */}
      <main className="flex-1 min-w-0 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Article title — matches WikiArticleHeader */}
            <div className="mb-8">
              <Bone className="h-6 w-80 mb-3" />
              <div className="flex items-center gap-2">
                <Bone className="h-3 w-16" />
                <div className="w-1 h-1 rounded-full bg-zinc-300" />
                <Bone className="h-3 w-28" />
              </div>
              <div className="h-px w-full bg-zinc-200 mt-4" />
            </div>

            {/* First paragraph block */}
            <div className="space-y-2.5 mb-6">
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-11/12" />
              <Bone className="h-3.5 w-4/5" />
            </div>

            {/* Section heading */}
            <Bone className="h-5 w-52 mb-4 mt-8" />

            {/* Second paragraph block */}
            <div className="space-y-2.5 mb-6">
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-3/4" />
            </div>

            {/* Callout / key fact block */}
            <div className="border-l-3 border-zinc-300 pl-4 py-3 rounded-r-sm bg-zinc-100/50 mb-6">
              <Bone className="h-2.5 w-16 mb-2" />
              <div className="space-y-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-5/6" />
              </div>
            </div>

            {/* Another section heading */}
            <Bone className="h-5 w-44 mb-4 mt-8" />

            {/* Third paragraph block */}
            <div className="space-y-2.5 mb-6">
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-2/3" />
            </div>

            {/* Another callout */}
            <div className="border-l-3 border-zinc-300 pl-4 py-3 rounded-r-sm bg-zinc-100/50">
              <Bone className="h-2.5 w-20 mb-2" />
              <div className="space-y-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Prev/Next footer — matches actual sticky footer */}
        <div className="shrink-0 border-t border-zinc-200 bg-background">
          <div className="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between">
            <Bone className="h-3 w-24" />
            <Bone className="h-3 w-20" />
          </div>
        </div>
      </main>

      {/* Right sidebar — matches WikiRightSidebar layout */}
      <aside className="hidden lg:flex w-56 shrink-0 border-l border-zinc-100 bg-zinc-50/30 flex-col">
        <div className="py-6 px-4 space-y-0">
          {/* Practice button */}
          <div className="mb-5">
            <Bone className="h-9 w-full rounded-sm" />
          </div>

          {/* Table of contents */}
          <div className="mb-5">
            <Bone className="h-3 w-24 mb-3" />
            <div className="space-y-2.5 pl-1">
              <Bone className="h-2.5 w-36" />
              <Bone className="h-2.5 w-28 ml-3" />
              <Bone className="h-2.5 w-32 ml-3" />
              <Bone className="h-2.5 w-24" />
              <Bone className="h-2.5 w-30 ml-3" />
              <Bone className="h-2.5 w-20" />
            </div>
          </div>

          {/* Related topics */}
          <div className="pt-4 border-t border-zinc-200/60">
            <Bone className="h-3 w-28 mb-3" />
            <div className="space-y-2">
              <Bone className="h-8 w-full rounded-sm" />
              <Bone className="h-8 w-full rounded-sm" />
              <Bone className="h-8 w-full rounded-sm" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  </>
)

export const WikiContentShell = ({ children }: { children: React.ReactNode }) => {
  const { isPending } = useWikiNavigation()

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
      {isPending ? <ArticleSkeleton /> : children}
    </div>
  )
}
