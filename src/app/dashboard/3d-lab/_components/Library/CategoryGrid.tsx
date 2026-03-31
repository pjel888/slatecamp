'use client'

import {
  Buildings, Wheelchair, FireSimple, Car, HardHat,
  Drop, Lightning, Fan, Elevator, Crane, Cube,
  Bank, Church, MapTrifold, Briefcase, Calculator, Lock,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import { ASSET_TAXONOMY, ALE_SUBJECTS, PHASE_LABELS, type CategoryKey } from '../../_config/taxonomy'

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, PhosphorIcon> = {
  Buildings,
  Wheelchair,
  FireSimple,
  Car,
  HardHat,
  Drop,
  Lightning,
  Fan,
  Elevator,
  Crane,
  Cube,
  Bank,
  Church,
  MapTrifold,
  Briefcase,
  Calculator,
}

// ─── Phase Badge Styles ───────────────────────────────────────────────────────

const PHASE_STYLES: Record<1 | 2 | 3, string> = {
  1: 'bg-[#EEF2FC] text-[#1B3FC4]',
  2: 'bg-amber-50 text-amber-700',
  3: 'bg-zinc-100 text-zinc-500',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryGridProps {
  onCategorySelect: (categoryKey: string) => void
  moduleCounts?: Record<string, number>
}

// ─── Category Card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  categoryKey: CategoryKey
  category: (typeof ASSET_TAXONOMY)[CategoryKey]
  moduleCount: number
  onSelect: (key: string) => void
}

function CategoryCard({ categoryKey, category, moduleCount, onSelect }: CategoryCardProps) {
  const IconComponent = ICON_MAP[category.icon] ?? Cube
  // TODO: Re-enable phase locking before production launch
  const isLocked = false
  const phaseLabel = PHASE_LABELS[category.phase]

  const handleClick = () => {
    onSelect(categoryKey)
  }

  return (
    <div
      onClick={handleClick}
      className={[
        'relative rounded-md border border-[#D4DAE3] bg-white p-4 transition-all duration-150 ease-out',
        isLocked
          ? 'cursor-default opacity-70'
          : 'cursor-pointer hover:border-zinc-300 hover:shadow-sm',
      ].join(' ')}
    >
      {/* Icon + module count row */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#EEF2FC]">
          <IconComponent size={20} weight="duotone" color="#1B3FC4" />
        </div>
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-[#4A5568]">
          {moduleCount} modules
        </span>
      </div>

      {/* Label */}
      <h3 className="text-sm font-semibold leading-snug text-[#1A2332]">
        {category.label}
      </h3>

      {/* Description */}
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#4A5568]">
        {category.description}
      </p>

      {/* Phase badge */}
      <div className="mt-3">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${PHASE_STYLES[category.phase]}`}>
          {phaseLabel}
        </span>
      </div>

      {/* Locked overlay for phase 2 & 3 */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/60">
          <div className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5">
            <Lock size={13} weight="bold" color="#8896A7" />
            <span className="text-[11px] font-medium text-[#8896A7]">Coming Soon</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Category Grid ────────────────────────────────────────────────────────────

export function CategoryGrid({ onCategorySelect, moduleCounts = {} }: CategoryGridProps) {
  const allCategories = Object.entries(ASSET_TAXONOMY) as [CategoryKey, (typeof ASSET_TAXONOMY)[CategoryKey]][]
  const phase1Count = allCategories.filter(([, c]) => c.phase === 1).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#1A2332]">3D Interactive Lab</h1>
        <p className="mt-1 text-[11px] text-[#8896A7]">
          {phase1Count} categories available now &middot; {allCategories.length} total
        </p>
      </div>

      {/* ALE Subject Groups */}
      <div className="space-y-8">
        {ALE_SUBJECTS.map((subject) => (
          <section key={subject.label}>
            {/* Subject heading */}
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#8896A7]">
              {subject.label}
            </h2>

            {/* Category cards for this subject */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subject.categories.map((key) => {
                const category = ASSET_TAXONOMY[key]
                return (
                  <CategoryCard
                    key={key}
                    categoryKey={key}
                    category={category}
                    moduleCount={moduleCounts[key] ?? 0}
                    onSelect={onCategorySelect}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
