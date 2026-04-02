'use client'

import { useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ASSET_TAXONOMY, type CategoryKey } from '../../_config/taxonomy'
import { ALL_MODULES } from '../../_config/registry'
import { DASHBOARD_VISIBLE_IDS } from '../../_config/dashboard-visibility'
import { CategoryGrid } from './CategoryGrid'
import { ModuleList } from './ModuleList'
import { ModuleCard } from './ModuleCard'

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * LabBrowser orchestrates the drill-down navigation:
 *
 * When DASHBOARD_VISIBLE_IDS is populated:
 *   → Simplified flat grid showing only allowlisted modules
 *
 * When DASHBOARD_VISIBLE_IDS is empty (future restore):
 *   → Level 1: CategoryGrid (16 ALE-aligned categories)
 *   → Level 2: ModuleList (filtered by category)
 *
 * Uses URL search params (?category=STRUCTURAL) so the state is shareable/bookmarkable.
 */
export function LabBrowser({ basePath }: { basePath: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategoryKey = searchParams.get('category') as CategoryKey | null

  // ─── Simplified dashboard mode ──────────────────────────────────────────

  const dashboardModules = useMemo(() => {
    if (DASHBOARD_VISIBLE_IDS.size === 0) return null
    return ALL_MODULES.filter((m) => DASHBOARD_VISIBLE_IDS.has(m.id))
  }, [])

  // ─── Full category drill-down mode ──────────────────────────────────────

  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const key of Object.keys(ASSET_TAXONOMY)) {
      counts[key] = 0
    }
    for (const mod of ALL_MODULES) {
      if (mod.categoryId && counts[mod.categoryId] !== undefined) {
        counts[mod.categoryId]++
      }
    }
    return counts
  }, [])

  const categoryModules = useMemo(() => {
    if (!activeCategoryKey) return []
    return ALL_MODULES.filter(mod => mod.categoryId === activeCategoryKey)
  }, [activeCategoryKey])

  const handleCategorySelect = useCallback((categoryKey: string) => {
    router.push(`${basePath}?category=${categoryKey}`)
  }, [router, basePath])

  const handleBack = useCallback(() => {
    router.push(basePath)
  }, [router, basePath])

  // ─── Simplified mode: flat grid of visible modules only ─────────────────

  if (dashboardModules) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-[#1A2332]">3D Interactive Lab</h1>
          <p className="mt-1 text-[11px] text-[#8896A7]">
            {dashboardModules.length} interactive modules available
          </p>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dashboardModules.map((m) => (
            <ModuleCard key={m.id} module={m} basePath={basePath} />
          ))}
        </div>
      </div>
    )
  }

  // ─── Full mode: category drill-down ─────────────────────────────────────

  // Level 2: Module list within a category
  if (activeCategoryKey && ASSET_TAXONOMY[activeCategoryKey]) {
    return (
      <ModuleList
        categoryKey={activeCategoryKey}
        modules={categoryModules}
        basePath={basePath}
        onBack={handleBack}
      />
    )
  }

  // Level 1: Category grid
  return (
    <CategoryGrid
      onCategorySelect={handleCategorySelect}
      moduleCounts={moduleCounts}
    />
  )
}
