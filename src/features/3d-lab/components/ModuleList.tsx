'use client'

import { useState, useMemo } from 'react'
import { CaretRight, MagnifyingGlass, ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ASSET_TAXONOMY, type CategoryKey } from '../config/taxonomy'
import type { ModuleRegistryEntry } from '../types/templates'
import { ModuleCard } from './ModuleCard'

// ─── Props ───────────────────────────────────────────────────────────────────

interface ModuleListProps {
  categoryKey: string
  modules: ModuleRegistryEntry[]
  basePath: string
  onBack: () => void
}

// ─── Module List ──────────────────────────────────────────────────────────────

export function ModuleList({ categoryKey, modules, basePath, onBack }: ModuleListProps) {
  const [search, setSearch] = useState('')

  const category = ASSET_TAXONOMY[categoryKey as CategoryKey]
  const categoryLabel = category?.label ?? categoryKey

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return modules
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.codeRef?.toLowerCase().includes(query) ||
        m.templateType.includes(query)
    )
  }, [modules, search])

  const availableCount = modules.filter((m) => m.status === 'built' || m.status === 'ready').length

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft size={12} weight="bold" />
          3D Lab
        </button>
        <CaretRight size={10} className="opacity-40" />
        <span className="text-foreground">{categoryLabel}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight">{categoryLabel}</h1>
        {category?.description && (
          <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed max-w-2xl">{category.description}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-emerald/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald border border-emerald/10">
            {availableCount} Available
          </span>
          <span className="rounded-full bg-muted/30 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border-default/20">
            {modules.length} Total Modules
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <SCIcon
          icon={MagnifyingGlass}
          size="sm"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search modules by name, code reference, or template type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border-default/60 bg-white py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all duration-200"
        />
      </div>

      {/* Module Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[13px] text-muted-foreground">
            {search ? 'No modules match your search.' : 'No modules in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => (
            <ModuleCard key={m.id} module={m} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  )
}
