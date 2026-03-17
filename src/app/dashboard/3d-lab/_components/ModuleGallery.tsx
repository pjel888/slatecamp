'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Search, Box, Layers, Map, Scissors, Play } from 'lucide-react'
import { MODULE_REGISTRY, SUBJECT_AREAS } from '../_config/moduleRegistry'
import type { ModuleRegistryEntry, TemplateType } from '../_types/templates'

// ─── Template Badges ────────────────────────────────────────────────────────

const TEMPLATE_META: Record<TemplateType, { label: string; icon: typeof Box; className: string }> = {
  parametric: { label: 'Parametric', icon: Box, className: 'bg-blue-500/10 text-blue-600' },
  exploded:   { label: 'Exploded', icon: Layers, className: 'bg-purple-500/10 text-purple-600' },
  floorplan:  { label: 'Floor Plan', icon: Map, className: 'bg-emerald-500/10 text-emerald-600' },
  cutaway:    { label: 'Cutaway', icon: Scissors, className: 'bg-amber-500/10 text-amber-600' },
  animated:   { label: 'Animated', icon: Play, className: 'bg-rose-500/10 text-rose-600' },
}

// ─── Module Card ────────────────────────────────────────────────────────────

function ModuleCard({ module, basePath }: { module: ModuleRegistryEntry; basePath: string }) {
  const isBuilt = module.status === 'built' || module.status === 'ready'
  const isPriority = (module.priority ?? Infinity) <= 10
  const tmpl = TEMPLATE_META[module.templateType]
  const Icon = tmpl.icon

  const card = (
    <div
      className={[
        'group relative rounded-lg border p-4 transition-all',
        isBuilt
          ? 'cursor-pointer border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
          : 'cursor-default border-zinc-100 bg-zinc-50/50 opacity-60 dark:border-zinc-800/50 dark:bg-zinc-900/50',
        isPriority && isBuilt ? 'ring-1 ring-blue-600/30' : '',
      ].join(' ')}
    >
      {/* Template badge */}
      <div className="mb-2 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${tmpl.className}`}>
          <Icon className="h-3 w-3" />
          {tmpl.label}
        </span>
        {isBuilt ? (
          <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-600">
            Available
          </span>
        ) : (
          <span className="rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
            Coming Soon
          </span>
        )}
        {isPriority && (
          <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
            P{module.priority}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">
        {module.title}
      </h3>

      {/* Description */}
      {module.description && (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
          {module.description}
        </p>
      )}

      {/* Code reference */}
      {module.codeRef && (
        <p className="mt-2 text-[10px] font-mono text-muted-foreground/70">
          {module.codeRef}
        </p>
      )}
    </div>
  )

  if (isBuilt) {
    return (
      <Link href={`${basePath}?model=${module.id}`} className="block">
        {card}
      </Link>
    )
  }

  return card
}

// ─── Subject Section ────────────────────────────────────────────────────────

function SubjectSection({
  label,
  modules,
  basePath,
  defaultOpen,
}: {
  label: string
  modules: ModuleRegistryEntry[]
  basePath: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const builtCount = modules.filter((m) => m.status === 'built' || m.status === 'ready').length

  return (
    <div className="border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">
          {builtCount}/{modules.length} available
        </span>
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((m) => (
            <ModuleCard key={m.id} module={m} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Gallery Component ──────────────────────────────────────────────────────

interface ModuleGalleryProps {
  basePath: string
}

export function ModuleGallery({ basePath }: ModuleGalleryProps) {
  const [search, setSearch] = useState('')

  const filteredBySubject = useMemo(() => {
    const query = search.toLowerCase().trim()
    const filtered = query
      ? MODULE_REGISTRY.filter(
          (m) =>
            m.title.toLowerCase().includes(query) ||
            m.description?.toLowerCase().includes(query) ||
            m.codeRef?.toLowerCase().includes(query) ||
            m.templateType.includes(query)
        )
      : MODULE_REGISTRY

    // Group by subject
    const groups: Record<string, ModuleRegistryEntry[]> = {}
    for (const m of filtered) {
      const subjectLabel =
        SUBJECT_AREAS.find((s) => s.id === m.subject)?.label ?? m.subject
      if (!groups[subjectLabel]) groups[subjectLabel] = []
      groups[subjectLabel].push(m)
    }

    // Sort: subjects with priority modules first
    return Object.entries(groups).sort(([, a], [, b]) => {
      const aMin = Math.min(...a.map((m) => m.priority ?? Infinity))
      const bMin = Math.min(...b.map((m) => m.priority ?? Infinity))
      return aMin - bMin
    })
  }, [search])

  const totalBuilt = MODULE_REGISTRY.filter(
    (m) => m.status === 'built' || m.status === 'ready'
  ).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">3D Interactive Lab</h1>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {totalBuilt} modules available &middot; {MODULE_REGISTRY.length} total
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search modules by name, code reference, or template type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900"
        />
      </div>

      {/* Subject Sections */}
      <div className="space-y-4">
        {filteredBySubject.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No modules match your search.
          </p>
        ) : (
          filteredBySubject.map(([label, modules], i) => (
            <SubjectSection
              key={label}
              label={label}
              modules={modules}
              basePath={basePath}
              defaultOpen={i < 3}
            />
          ))
        )}
      </div>
    </div>
  )
}
