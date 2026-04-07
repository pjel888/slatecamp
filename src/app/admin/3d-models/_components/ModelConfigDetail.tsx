'use client'

import React, { useState } from 'react'
import { Cube, CaretRight, Info, Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { DASHBOARD_VISIBLE_IDS } from '@/features/3d-lab/config/dashboard-visibility'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ModelConfigDetailProps {
  modelId: string | null
  config: unknown | null
  loading: boolean
}

/* ------------------------------------------------------------------ */
/*  Template badge styles (mirrors tree)                               */
/* ------------------------------------------------------------------ */

const TEMPLATE_BADGE_STYLES: Record<string, string> = {
  parametric: 'bg-primary/10 text-primary',
  exploded: 'bg-purple-500/10 text-purple-600',
  floorplan: 'bg-emerald-500/10 text-emerald-600',
  cutaway: 'bg-amber-500/10 text-amber-600',
  animated: 'bg-rose-500/10 text-rose-600',
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  built: 'bg-emerald-500/10 text-success',
  ready: 'bg-primary/10 text-primary',
  planned: 'bg-amber-500/10 text-warning',
}

/* ------------------------------------------------------------------ */
/*  Top-level info fields (shown in the info grid)                     */
/* ------------------------------------------------------------------ */

const INFO_FIELDS = ['id', 'subject', 'categoryId', 'launchPhase', 'status'] as const

/* ------------------------------------------------------------------ */
/*  Section keys that get collapsible cards                            */
/* ------------------------------------------------------------------ */

const SECTION_KEYS = new Set(['parameters', 'violations', 'annotations', 'presets', 'camera', 'steps', 'layers', 'zones', 'sections', 'parts'])

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function isArrayOfRecords(v: unknown): v is Record<string, unknown>[] {
  return Array.isArray(v) && v.length > 0 && v.every(isRecord)
}

/** Get table columns from an array of objects */
function getTableColumns(arr: Record<string, unknown>[]): string[] {
  const colSet = new Set<string>()
  for (const row of arr) {
    for (const key of Object.keys(row)) colSet.add(key)
  }
  return Array.from(colSet)
}

/** Format a cell value for table display */
function formatCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">--</span>
  if (typeof value === 'function') return <code className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">[Function]</code>
  if (typeof value === 'boolean') return <span className={value ? 'text-success' : 'text-muted-foreground'}>{String(value)}</span>
  if (typeof value === 'number') return <span className="tabular-nums text-foreground">{value}</span>
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">[]</span>
    if (value.every((v) => typeof v === 'string' || typeof v === 'number')) {
      return <span className="text-muted-foreground">{value.join(', ')}</span>
    }
    return <code className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">[{value.length} items]</code>
  }
  if (isRecord(value)) {
    return <code className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">[Object]</code>
  }
  return String(value)
}

/* ------------------------------------------------------------------ */
/*  Collapsible Section                                                */
/* ------------------------------------------------------------------ */

function CollapsibleSection({ title, count, children, defaultOpen = false }: {
  title: string
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-md border border-border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-muted"
      >
        <CaretRight
          size={14}
          weight="bold"
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-150',
            open && 'rotate-90'
          )}
        />
        <span className="flex-1 text-sm font-semibold capitalize text-foreground">{title}</span>
        {count !== undefined && (
          <span className="rounded-full bg-background px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          {children}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data Table                                                         */
/* ------------------------------------------------------------------ */

function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = getTableColumns(rows)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-[13px] text-muted-foreground">
                  {formatCellValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Nested Object View                                                 */
/* ------------------------------------------------------------------ */

function NestedObjectView({ data, depth = 0 }: { data: Record<string, unknown>; depth?: number }) {
  return (
    <div className={cn('space-y-1', depth > 0 && 'border-l-2 border-border pl-3')}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex gap-2 text-[13px]">
          <span className="shrink-0 font-medium text-muted-foreground">{key}:</span>
          <span className="text-muted-foreground">
            {isRecord(value) ? (
              <NestedObjectView data={value} depth={depth + 1} />
            ) : (
              formatCellValue(value)
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section Renderer                                                   */
/* ------------------------------------------------------------------ */

function renderSectionContent(value: unknown): React.ReactNode {
  if (isArrayOfRecords(value)) {
    return <DataTable rows={value} />
  }
  if (Array.isArray(value)) {
    return (
      <div className="space-y-1">
        {value.map((item, i) => (
          <div key={i} className="text-[13px] text-muted-foreground">{formatCellValue(item)}</div>
        ))}
      </div>
    )
  }
  if (isRecord(value)) {
    return <NestedObjectView data={value} />
  }
  return <div className="text-[13px] text-muted-foreground">{formatCellValue(value)}</div>
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ModelConfigDetail({ modelId, config, loading }: ModelConfigDetailProps) {
  /* Empty state */
  if (!modelId) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 p-8">
        <Cube size={48} weight="duotone" className="text-border" />
        <p className="text-sm text-muted-foreground">Select a model from the tree to view its configuration</p>
      </div>
    )
  }

  /* Loading state */
  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-6 w-64 animate-pulse rounded-sm bg-border" />
          <div className="h-4 w-96 animate-pulse rounded-sm bg-border/60" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-border/40" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* Error state */
  if (!config) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 p-8">
        <Info size={48} weight="duotone" className="text-border" />
        <p className="text-sm text-muted-foreground">No configuration found for this model.</p>
      </div>
    )
  }

  const configObj = config as Record<string, unknown>
  const title = (configObj.title as string) ?? (configObj.id as string) ?? modelId
  const description = configObj.description as string | undefined
  const templateType = configObj.templateType as string | undefined
  const status = configObj.status as string | undefined

  /* Split fields into info grid vs. section cards */
  const infoEntries = Object.entries(configObj).filter(
    ([key]) => INFO_FIELDS.includes(key as (typeof INFO_FIELDS)[number])
  )
  const sectionEntries = Object.entries(configObj).filter(
    ([key]) => SECTION_KEYS.has(key)
  )
  const otherEntries = Object.entries(configObj).filter(
    ([key]) =>
      !INFO_FIELDS.includes(key as (typeof INFO_FIELDS)[number]) &&
      !SECTION_KEYS.has(key) &&
      !['title', 'description', 'templateType'].includes(key)
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            {templateType && (
              <span className={cn(
                'rounded-sm px-2 py-0.5 text-[11px] font-medium',
                TEMPLATE_BADGE_STYLES[templateType] ?? 'bg-muted text-muted-foreground'
              )}>
                {templateType}
              </span>
            )}
            {status && (
              <span className={cn(
                'rounded-sm px-2 py-0.5 text-[11px] font-medium',
                STATUS_BADGE_STYLES[status] ?? 'bg-muted text-muted-foreground'
              )}>
                {status}
              </span>
            )}
          </div>
        </div>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Dashboard visibility */}
      <div className="mb-4">
        {DASHBOARD_VISIBLE_IDS.has(modelId) ? (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1 text-[12px] font-medium text-success">
            <Eye size={14} weight="duotone" />
            Visible on dashboard
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
            <EyeSlash size={14} weight="duotone" />
            Hidden from dashboard
          </div>
        )}
      </div>

      {/* Info grid */}
      {infoEntries.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          {infoEntries.map(([key, value]) => (
            <div key={key} className="rounded-md border border-border bg-background px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{key}</div>
              <div className="mt-0.5 text-sm text-foreground">{formatCellValue(value)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Other scalar fields */}
      {otherEntries.length > 0 && (
        <div className="mb-6 rounded-md border border-border bg-card px-4 py-3">
          <div className="space-y-2">
            {otherEntries.map(([key, value]) => (
              <div key={key} className="flex items-start gap-3 text-[13px]">
                <span className="w-32 shrink-0 font-medium text-muted-foreground">{key}</span>
                <span className="text-muted-foreground">
                  {isRecord(value) ? (
                    <NestedObjectView data={value} />
                  ) : (
                    formatCellValue(value)
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section cards */}
      {sectionEntries.length > 0 && (
        <div className="space-y-3">
          {sectionEntries.map(([key, value]) => (
            <CollapsibleSection
              key={key}
              title={key}
              count={Array.isArray(value) ? value.length : undefined}
              defaultOpen={key === 'parameters'}
            >
              {renderSectionContent(value)}
            </CollapsibleSection>
          ))}
        </div>
      )}
    </div>
  )
}
