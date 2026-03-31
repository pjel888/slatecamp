'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CaretRight, MagnifyingGlass, ArrowLeft, Cube, Stack, MapTrifold, Scissors, Play } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import { ASSET_TAXONOMY, type CategoryKey } from '../../_config/taxonomy'
import type { ModuleRegistryEntry, TemplateType } from '../../_types/templates'

// ─── Template Badges ─────────────────────────────────────────────────────────

const TEMPLATE_META: Record<TemplateType, { label: string; icon: PhosphorIcon; className: string }> = {
  parametric: { label: 'Parametric', icon: Cube,        className: 'bg-primary/10 text-primary' },
  exploded:   { label: 'Exploded',   icon: Stack,       className: 'bg-purple-500/10 text-purple-600' },
  floorplan:  { label: 'Floor Plan', icon: MapTrifold,  className: 'bg-emerald-500/10 text-emerald-600' },
  cutaway:    { label: 'Cutaway',    icon: Scissors,    className: 'bg-amber-500/10 text-amber-600' },
  animated:   { label: 'Animated',  icon: Play,        className: 'bg-rose-500/10 text-rose-600' },
}

// ─── Module Card ─────────────────────────────────────────────────────────────

function ModuleCard({ module, basePath }: { module: ModuleRegistryEntry; basePath: string }) {
  const isBuilt = module.status === 'built' || module.status === 'ready'
  const tmpl = TEMPLATE_META[module.templateType]

  const card = (
    <div
      className={[
        'group relative flex h-full flex-col rounded-md border p-4 transition-all duration-150 ease-out',
        isBuilt
          ? 'cursor-pointer border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
          : 'cursor-default border-zinc-100 bg-zinc-50/50 opacity-60',
      ].join(' ')}
    >
      {/* Template + status badges */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tmpl.className}`}>
          <SCIcon icon={tmpl.icon} size="xs" />
          {tmpl.label}
        </span>
        {isBuilt ? (
          <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
            Available
          </span>
        ) : (
          <span className="rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
            Coming Soon
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-150">
        {module.title}
      </h3>

      {/* Description — fixed 2-line height */}
      <p className="mt-1 flex-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
        {module.description ?? '\u00A0'}
      </p>

      {/* Code reference — always rendered for consistent height */}
      <p className="mt-2 text-[11px] font-mono text-muted-foreground/70">
        {module.codeRef ?? '\u00A0'}
      </p>
    </div>
  )

  if (isBuilt) {
    return (
      <Link href={`${basePath}?model=${module.id}`} className="block h-full">
        {card}
      </Link>
    )
  }

  return card
}

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
          className="w-full rounded-sm border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#1B3FC4] focus:outline-none focus:ring-1 focus:ring-[#1B3FC4]"
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
