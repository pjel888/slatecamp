'use client'

import { useState, useMemo } from 'react'
import { CaretRight, Cube, Eye } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import type { RegistryTree, ModelNode } from '../_lib/model-registry-data'
import { DASHBOARD_VISIBLE_IDS } from '@/features/3d-lab/config/dashboard-visibility'

/* ------------------------------------------------------------------ */
/*  Template type badge colors                                         */
/* ------------------------------------------------------------------ */

const TEMPLATE_BADGE_STYLES: Record<string, string> = {
  parametric: 'bg-primary/10 text-primary',
  exploded: 'bg-purple-500/10 text-purple-600',
  floorplan: 'bg-emerald-500/10 text-emerald-600',
  cutaway: 'bg-amber-500/10 text-amber-600',
  animated: 'bg-rose-500/10 text-rose-600',
}

/* ------------------------------------------------------------------ */
/*  Search / Filter helpers                                            */
/* ------------------------------------------------------------------ */

function filterTree(tree: RegistryTree, query: string) {
  if (!query.trim()) return { matchingModuleIds: null as Set<string> | null, matchCount: 0, totalCount: tree.totalModules }

  const q = query.toLowerCase()
  const matchingModuleIds = new Set<string>()

  for (const subject of tree.subjects) {
    for (const cat of subject.categories) {
      for (const mod of cat.modules) {
        if (mod.title.toLowerCase().includes(q)) {
          matchingModuleIds.add(mod.id)
        }
      }
    }
  }

  return { matchingModuleIds, matchCount: matchingModuleIds.size, totalCount: tree.totalModules }
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ModelRegistryTreeProps {
  tree: RegistryTree
  selectedId: string | null
  onSelect: (modelId: string) => void
  searchQuery: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ModelRegistryTree({ tree, selectedId, onSelect, searchQuery }: ModelRegistryTreeProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    () => new Set(tree.subjects.length > 0 ? [tree.subjects[0].label] : [])
  )
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const { matchingModuleIds, matchCount, totalCount } = useMemo(
    () => filterTree(tree, searchQuery),
    [tree, searchQuery]
  )

  const isFiltering = matchingModuleIds !== null

  function toggleSubject(label: string) {
    setExpandedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  function toggleCategory(key: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  /** When filtering, check if a category has any matching modules */
  function categoryHasMatch(catModules: ModelNode[]) {
    if (!matchingModuleIds) return true
    return catModules.some((m) => matchingModuleIds.has(m.id))
  }

  /** When filtering, check if a subject has any matching modules */
  function subjectHasMatch(subjectLabel: string) {
    if (!matchingModuleIds) return true
    const subject = tree.subjects.find((s) => s.label === subjectLabel)
    if (!subject) return false
    return subject.categories.some((cat) => categoryHasMatch(cat.modules))
  }

  return (
    <div className="py-1">
      {/* Match count indicator */}
      {isFiltering && (
        <div className="px-4 py-2 text-xs text-muted-foreground">
          {matchCount} of {totalCount} modules
        </div>
      )}

      {tree.subjects.map((subject) => {
        if (isFiltering && !subjectHasMatch(subject.label)) return null

        const isSubjectExpanded = isFiltering || expandedSubjects.has(subject.label)

        return (
          <div key={subject.label}>
            {/* Subject heading */}
            <button
              onClick={() => toggleSubject(subject.label)}
              className="group flex w-full items-center gap-1.5 px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-muted"
            >
              <CaretRight
                size={12}
                weight="bold"
                className={cn(
                  'shrink-0 text-muted-foreground transition-transform duration-150',
                  isSubjectExpanded && 'rotate-90'
                )}
              />
              <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {subject.label}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {subject.totalModules}
              </span>
            </button>

            {/* Categories */}
            {isSubjectExpanded && (
              <div>
                {subject.categories.map((cat) => {
                  if (isFiltering && !categoryHasMatch(cat.modules)) return null

                  const isCatExpanded = isFiltering || expandedCategories.has(cat.key)

                  return (
                    <div key={cat.key}>
                      {/* Category row */}
                      <button
                        onClick={() => toggleCategory(cat.key)}
                        className="group flex w-full items-center gap-1.5 py-1.5 pl-7 pr-3 text-left transition-colors duration-150 ease-out hover:bg-muted"
                      >
                        <CaretRight
                          size={11}
                          weight="bold"
                          className={cn(
                            'shrink-0 text-muted-foreground transition-transform duration-150',
                            isCatExpanded && 'rotate-90'
                          )}
                        />
                        <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                          {cat.label}
                        </span>
                        <span className="rounded-full bg-background px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                          {cat.moduleCount}
                        </span>
                      </button>

                      {/* Module rows */}
                      {isCatExpanded && (
                        <div>
                          {cat.modules.map((mod) => {
                            if (isFiltering && !matchingModuleIds.has(mod.id)) return null

                            const isSelected = mod.id === selectedId

                            return (
                              <button
                                key={mod.id}
                                onClick={() => onSelect(mod.id)}
                                className={cn(
                                  'group flex w-full items-center gap-2 py-1.5 pl-12 pr-3 text-left transition-colors duration-150 ease-out',
                                  isSelected
                                    ? 'border-l-2 border-primary bg-primary-50 text-primary'
                                    : 'border-l-2 border-transparent hover:bg-muted'
                                )}
                              >
                                <Cube
                                  size={14}
                                  weight={isSelected ? 'duotone' : 'regular'}
                                  className={cn(
                                    'shrink-0',
                                    isSelected ? 'text-primary' : 'text-muted-foreground'
                                  )}
                                />
                                <span
                                  className={cn(
                                    'flex-1 truncate text-[13px]',
                                    isSelected ? 'font-medium text-primary' : 'text-muted-foreground'
                                  )}
                                >
                                  {mod.title}
                                </span>
                                {DASHBOARD_VISIBLE_IDS.has(mod.id) && (
                                  <span title="Visible on dashboard">
                                    <Eye
                                      size={12}
                                      weight="duotone"
                                      className="shrink-0 text-success"
                                    />
                                  </span>
                                )}
                                <span
                                  className={cn(
                                    'shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium',
                                    TEMPLATE_BADGE_STYLES[mod.templateType] ?? 'bg-muted text-muted-foreground'
                                  )}
                                >
                                  {mod.templateType}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Empty filter state */}
      {isFiltering && matchCount === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No modules match your search.
        </div>
      )}
    </div>
  )
}
