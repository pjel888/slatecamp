'use client'

import { useState, useTransition } from 'react'
import { CodeUpdateCard } from './CodeUpdateCard'
import { getCodeUpdates } from '@/lib/actions/code-updates'
import type { CodeUpdate } from '@/lib/actions/code-updates'

interface MonthGroup {
  label: string
  items: CodeUpdate[]
}

const toMonthLabel = (isoStr: string) =>
  new Date(isoStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const groupByMonth = (updates: CodeUpdate[]): MonthGroup[] => {
  const map = new Map<string, CodeUpdate[]>()
  for (const u of updates) {
    const label = toMonthLabel(u.published_at)
    const existing = map.get(label)
    if (existing) {
      existing.push(u)
    } else {
      map.set(label, [u])
    }
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
}

interface CodeUpdateFeedProps {
  initialUpdates: CodeUpdate[]
  initialCursor: string | null
}

export const CodeUpdateFeed = ({ initialUpdates, initialCursor }: CodeUpdateFeedProps) => {
  const [updates, setUpdates] = useState<CodeUpdate[]>(initialUpdates)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [isPending, startTransition] = useTransition()

  const loadMore = () => {
    if (!cursor) return
    startTransition(async () => {
      const result = await getCodeUpdates(cursor, 20)
      setUpdates((prev) => [...prev, ...result.data])
      setCursor(result.nextCursor)
    })
  }

  if (updates.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No code updates yet. You&apos;ll be notified when building codes change.
        </p>
      </div>
    )
  }

  const groups = groupByMonth(updates)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {group.label}
          </h2>
          <div className="space-y-3">
            {group.items.map((update) => (
              <CodeUpdateCard key={update.update_id} update={update} />
            ))}
          </div>
        </section>
      ))}

      {cursor && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {isPending ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
