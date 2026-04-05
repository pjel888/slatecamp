'use client'

import { useState, useMemo } from 'react'
import { CaretRight, MagnifyingGlass, ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ASSET_TAXONOMY, type CategoryKey } from '../../_config/taxonomy'
import type { ModuleRegistryEntry } from '../../_types/templates'
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
      <nav className="mb-4 flex items-center gap-1.5 text-[11px] text-[#8896A7]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 transition-colors duration-150 ease-out hover:bg-zinc-100 hover:text-[#1A2332]"
        >
          <ArrowLeft size={12} weight="bold" />
          3D Lab
        </button>
        <CaretRight size={10} />
        <span className="font-medium text-[#1A2332]">{categoryLabel}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#1A2332]">{categoryLabel}</h1>
        {category?.description && (
          <p className="mt-1 text-[11px] text-[#4A5568]">{category.description}</p>
        )}
        <p className="mt-1 text-[11px] text-[#8896A7]">
          {availableCount} available &middot; {modules.length} total
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <SCIcon
          icon={MagnifyingGlass}
          size="sm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search modules by name, code reference, or template type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-sm border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#1B3FC4] focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Module Grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-[#8896A7]">
          {search ? 'No modules match your search.' : 'No modules in this category yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => (
            <ModuleCard key={m.id} module={m} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  )
}
