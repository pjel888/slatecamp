'use client'

import { useMemo, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ASSET_TAXONOMY, type CategoryKey } from '../config/taxonomy'
import { ALL_MODULES, getModuleById } from '../config/registry'
import { DASHBOARD_VISIBLE_IDS } from '../config/dashboard-visibility'
import { CategoryGrid } from './CategoryGrid'
import { ModuleList } from './ModuleList'
import { ModuleCard } from './ModuleCard'
import { LabBrowserLoadingState } from './shell/LabBrowserShell'

const isSourcePendingQaModule = (module: { codeRef?: string }) =>
  module.codeRef?.toLowerCase().includes('source pending qa') ?? false

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * LabBrowser orchestrates the drill-down navigation:
 *
 * When DASHBOARD_VISIBLE_IDS is populated:
 *   → Simplified flat grid showing only allowlisted modules
 *
 * When DASHBOARD_VISIBLE_IDS is empty (future restore):
 *   → Level 1: CategoryGrid (16 LEA-aligned categories)
 *   → Level 2: ModuleList (filtered by category)
 *
 * Uses URL search params (?category=STRUCTURAL) so the state is shareable/bookmarkable.
 */
export function LabBrowser({ basePath }: { basePath: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategoryKey = searchParams.get('category') as CategoryKey | null
  const [isPending, startTransition] = useTransition()

  // ─── Simplified dashboard mode ──────────────────────────────────────────

  const dashboardModules = useMemo(() => {
    if (DASHBOARD_VISIBLE_IDS.size === 0) return null
    return Array.from(DASHBOARD_VISIBLE_IDS)
      .map((moduleId) => getModuleById(moduleId))
      .filter((module) => module != null)
  }, [])

  const dashboardAvailableCount = useMemo(
    () => dashboardModules?.filter((module) => !isSourcePendingQaModule(module)).length ?? 0,
    [dashboardModules],
  )
  const dashboardQaPreviewCount = useMemo(
    () => dashboardModules?.filter(isSourcePendingQaModule).length ?? 0,
    [dashboardModules],
  )

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
    startTransition(() => {
      router.push(`${basePath}?category=${categoryKey}`)
    })
  }, [router, basePath])

  const handleBack = useCallback(() => {
    startTransition(() => {
      router.push(basePath)
    })
  }, [router, basePath])

  if (isPending) {
    return (
      <LabBrowserLoadingState
        title="Switching 3D Lab view..."
        detail={
          activeCategoryKey
            ? 'Loading the selected module category.'
            : 'Refreshing the 3D module browser.'
        }
      />
    )
  }

  // ─── Simplified mode: flat grid of visible modules only ─────────────────

  if (dashboardModules) {
    return (
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground tracking-tight">3D Interactive Lab</h1>
          <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {dashboardAvailableCount} interactive modules available
            {dashboardQaPreviewCount > 0 ? ` · ${dashboardQaPreviewCount} QA preview` : ''}
          </p>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
