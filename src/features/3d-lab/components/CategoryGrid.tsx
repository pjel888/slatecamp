'use client'

import Link from 'next/link'
import {
  Buildings, Wheelchair, FireSimple, Car, HardHat,
  Drop, Lightning, Fan, Elevator, Crane, Cube,
  Bank, Church, MapTrifold, Briefcase, Calculator, Lock,
  ArrowRight, Star,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'
import { ASSET_TAXONOMY, LEA_SUBJECTS, PHASE_LABELS, type CategoryKey } from '../config/taxonomy'

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
  1: 'bg-primary/5 text-primary border-primary/10',
  2: 'bg-amber-500/5 text-amber-600 border-amber-500/10',
  3: 'bg-muted/10 text-muted-foreground border-border-default/20',
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
      className={cn(
        'relative rounded-lg border border-border-default/60 bg-card p-5 transition-all duration-200 ease-out',
        isLocked
          ? 'cursor-default opacity-70'
          : 'cursor-pointer hover:border-primary/30 hover:shadow-md',
      )}
    >
      {/* Icon + module count row */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
          <IconComponent size={22} weight="duotone" className="text-primary" />
        </div>
        <span className="rounded bg-muted/30 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border-default/20">
          {moduleCount} modules
        </span>
      </div>

      {/* Label */}
      <h3 className="text-[14px] font-semibold text-foreground tracking-tight">
        {category.label}
      </h3>

      {/* Description */}
      <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.5] text-text-secondary font-sans">
        {category.description}
      </p>

      {/* Phase badge */}
      <div className="mt-4">
        <span className={cn(
          "inline-flex items-center rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
          PHASE_STYLES[category.phase]
        )}>
          {phaseLabel}
        </span>
      </div>

      {/* Locked overlay for phase 2 & 3 */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-card/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5 rounded-full bg-card border border-border-default shadow-sm px-3 py-1.5">
            <Lock size={12} weight="bold" className="text-muted-foreground" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coming Soon</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Featured Module Banner ───────────────────────────────────────────────────

export function FeaturedModuleBanner({ basePath }: { basePath?: string }) {
  const href = ROUTES.THREE_D_LAB_MODULE('site-development-controls')

  return (
    <Link href={href} className="group block mb-8">
      <div className="relative overflow-hidden rounded-md border border-primary/20 bg-primary/5 px-6 py-5 transition-all duration-200 ease-out hover:border-primary/40 hover:shadow-lg">
        {/* Background accent */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/10 to-transparent" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary shadow-indigo-200/50 shadow-lg">
              <MapTrifold size={24} weight="duotone" className="text-white" />
            </div>

            <div>
              {/* Badge row */}
              <div className="mb-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                  <Star size={9} weight="fill" />
                  Featured
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/70">PD 1096 NBCP</span>
              </div>

              {/* Title */}
              <h3 className="text-[16px] font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight">
                Site Development Controls
              </h3>

              {/* Metrics row */}
              <p className="mt-1 text-[12px] text-text-secondary font-sans leading-relaxed">
                Interactive 3D lot model with live AMBF, PSO, and TOSL computation.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white">
            Launch
            <ArrowRight size={14} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Category Grid ────────────────────────────────────────────────────────────

export function CategoryGrid({ onCategorySelect, moduleCounts = {} }: CategoryGridProps) {
  const allCategories = Object.entries(ASSET_TAXONOMY) as [CategoryKey, (typeof ASSET_TAXONOMY)[CategoryKey]][]
  const phase1Count = allCategories.filter(([, c]) => c.phase === 1).length

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight">3D Interactive Lab</h1>
        <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {phase1Count} categories available now &middot; {allCategories.length} total
        </p>
      </div>

      {/* Hero: Featured module */}
      <FeaturedModuleBanner />

      {/* LEA Subject Groups */}
      <div className="space-y-12">
        {LEA_SUBJECTS.map((subject) => (
          <section key={subject.label}>
            {/* Subject heading */}
            <h2 className="mb-5 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
              {subject.label}
            </h2>

            {/* Category cards for this subject */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
