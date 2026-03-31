'use client'

import { useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ASSET_TAXONOMY, type CategoryKey } from '../../_config/taxonomy'
import { ALL_MODULES } from '../../_config/registry'
import { CategoryGrid } from './CategoryGrid'
import { ModuleList } from './ModuleList'

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * LabBrowser orchestrates the drill-down navigation:
 *   Level 1: CategoryGrid (16 ALE-aligned categories)
 *   Level 2: ModuleList (filtered by category)
 *
 * Uses URL search params (?category=STRUCTURAL) so the state is shareable/bookmarkable.
 */
export function LabBrowser({ basePath }: { basePath: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategoryKey = searchParams.get('category') as CategoryKey | null

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
