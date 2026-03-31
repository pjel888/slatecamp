'use client'

import * as React from 'react'
import { ArrowsDownUp, ArrowUp, ArrowDown, CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchInput } from '@/components/ui/input'
import { TableRowSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Column<T> {
  key: string
  header: string
  type?: 'text' | 'badge' | 'date' | 'number' | 'action'
  sortable?: boolean
  width?: string
  render?: (row: T, index: number) => React.ReactNode
  className?: string
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  keyField: string

  // Search
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: string[]

  // Selection
  selectable?: boolean
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
  bulkActions?: React.ReactNode

  // Sorting
  defaultSort?: { key: string; direction: 'asc' | 'desc' }

  // Pagination
  pageSize?: number

  // Row interaction
  onRowClick?: (row: T) => void

  // States
  loading?: boolean
  emptyMessage?: string
  emptyAction?: { label: string; onClick: () => void }

  className?: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatRelativeDate = (value: unknown): string => {
  if (!value) return '\u2014'

  const date = value instanceof Date ? value : new Date(String(value))
  if (isNaN(date.getTime())) return '\u2014'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay <= 7) return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

const compareValues = (a: unknown, b: unknown, type?: string): number => {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1

  if (type === 'number') {
    return Number(a) - Number(b)
  }

  if (type === 'date') {
    const dateA = a instanceof Date ? a : new Date(String(a))
    const dateB = b instanceof Date ? b : new Date(String(b))
    return dateA.getTime() - dateB.getTime()
  }

  return String(a).localeCompare(String(b))
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  selectable = false,
  selectedKeys,
  onSelectionChange,
  bulkActions,
  defaultSort,
  pageSize = 20,
  onRowClick,
  loading = false,
  emptyMessage = 'No results found',
  emptyAction,
  className,
}: DataTableProps<T>) {
  /* ---- Internal state ---- */
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortState, setSortState] = React.useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(defaultSort ?? null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [internalPageSize, setInternalPageSize] = React.useState(pageSize || 20)

  const isPaginated = pageSize > 0

  /* ---- Search filtering ---- */
  const filteredData = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    const fields = searchFields.length > 0 ? searchFields : columns.map((c) => c.key)

    return data.filter((row) =>
      fields.some((field) => {
        const value = getNestedValue(row, field)
        return value != null && String(value).toLowerCase().includes(query)
      }),
    )
  }, [data, searchable, searchQuery, searchFields, columns])

  /* ---- Sorting ---- */
  const sortedData = React.useMemo(() => {
    if (!sortState) return filteredData

    const col = columns.find((c) => c.key === sortState.key)
    const type = col?.type

    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sortState.key)
      const bVal = getNestedValue(b, sortState.key)
      const cmp = compareValues(aVal, bVal, type)
      return sortState.direction === 'asc' ? cmp : -cmp
    })
  }, [filteredData, sortState, columns])

  /* ---- Pagination ---- */
  const totalPages = isPaginated ? Math.max(1, Math.ceil(sortedData.length / internalPageSize)) : 1

  // Reset page when data/search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, data.length, internalPageSize])

  const paginatedData = React.useMemo(() => {
    if (!isPaginated) return sortedData
    const start = (currentPage - 1) * internalPageSize
    return sortedData.slice(start, start + internalPageSize)
  }, [sortedData, currentPage, internalPageSize, isPaginated])

  /* ---- Selection helpers ---- */
  const visibleKeys = React.useMemo(
    () => new Set(paginatedData.map((row) => String(getNestedValue(row, keyField)))),
    [paginatedData, keyField],
  )

  const allVisibleSelected =
    selectable && visibleKeys.size > 0 && selectedKeys
      ? [...visibleKeys].every((k) => selectedKeys.has(k))
      : false

  const someVisibleSelected =
    selectable && selectedKeys ? [...visibleKeys].some((k) => selectedKeys.has(k)) : false

  const handleToggleAll = () => {
    if (!onSelectionChange || !selectedKeys) return
    if (allVisibleSelected) {
      const next = new Set(selectedKeys)
      visibleKeys.forEach((k) => next.delete(k))
      onSelectionChange(next)
    } else {
      const next = new Set(selectedKeys)
      visibleKeys.forEach((k) => next.add(k))
      onSelectionChange(next)
    }
  }

  const handleToggleRow = (key: string) => {
    if (!onSelectionChange || !selectedKeys) return
    const next = new Set(selectedKeys)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    onSelectionChange(next)
  }

  /* ---- Sort handler ---- */
  const handleSort = (columnKey: string) => {
    setSortState((prev) => {
      if (!prev || prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' }
      }
      return null
    })
  }

  /* ---- Page range for display ---- */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = [1]

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)
    return pages
  }

  /* ---- Render cell ---- */
  const renderCell = (column: Column<T>, row: T, rowIndex: number) => {
    if (column.render) {
      return column.render(row, rowIndex)
    }

    const value = getNestedValue(row, column.key)

    switch (column.type) {
      case 'date':
        return (
          <span className="text-muted-foreground" title={value ? String(value) : undefined}>
            {formatRelativeDate(value)}
          </span>
        )
      case 'number':
        return (
          <span className="font-mono tabular-nums">
            {value != null ? Number(value).toLocaleString() : '\u2014'}
          </span>
        )
      case 'text':
      default:
        return (
          <span className="truncate max-w-[200px] block">
            {value != null ? String(value) : '\u2014'}
          </span>
        )
    }
  }

  /* ---- Render ---- */
  const selectedCount = selectedKeys?.size ?? 0
  const showBulkBar = selectable && selectedCount > 0

  return (
    <div className={cn('space-y-2', className)}>
      {/* Search bar */}
      {searchable && (
        <SearchInput
          placeholder={searchPlaceholder}
          onChange={setSearchQuery}
          size="md"
          aria-label={searchPlaceholder || 'Search table'}
        />
      )}

      {/* Bulk actions bar */}
      {showBulkBar && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} selected
          </span>
          {bulkActions}
        </div>
      )}

      {/* Table container */}
      <div className="rounded-lg border border-border overflow-hidden" aria-live="polite">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-muted/30">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10" scope="col">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    onCheckedChange={handleToggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide',
                    column.type === 'number' && 'text-right',
                    column.type === 'action' && 'text-right',
                    column.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors duration-150',
                    column.width,
                    column.className,
                  )}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  {column.type === 'action' ? null : (
                    <span className="inline-flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <span className="inline-flex">
                          {sortState?.key === column.key ? (
                            sortState.direction === 'asc' ? (
                              <ArrowUp size={16} className="w-4 h-4" />
                            ) : (
                              <ArrowDown size={16} className="w-4 h-4" />
                            )
                          ) : (
                            <ArrowsDownUp size={16} className="w-4 h-4 opacity-40" />
                          )}
                        </span>
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: isPaginated ? internalPageSize : 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-border">
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                    <TableRowSkeleton columns={columns.length + (selectable ? 1 : 0)} />
                  </td>
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState
                    message={emptyMessage}
                    action={
                      emptyAction
                        ? { label: emptyAction.label, onClick: emptyAction.onClick }
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowKey = String(getNestedValue(row, keyField))
                const isSelected = selectable && selectedKeys?.has(rowKey)

                return (
                  <tr
                    key={rowKey}
                    className={cn(
                      'bg-card border-b border-border transition-colors duration-150',
                      'hover:bg-muted/50',
                      isSelected && 'bg-primary/5',
                      onRowClick && 'cursor-pointer',
                    )}
                    onClick={
                      onRowClick
                        ? (e) => {
                            // Don't trigger row click when clicking checkboxes or buttons
                            const target = e.target as HTMLElement
                            if (
                              target.closest('[data-slot="checkbox"]') ||
                              target.closest('button') ||
                              target.closest('a')
                            ) {
                              return
                            }
                            onRowClick(row)
                          }
                        : undefined
                    }
                  >
                    {selectable && (
                      <td className="px-4 py-3 w-10">
                        <Checkbox
                          checked={isSelected ?? false}
                          onCheckedChange={() => handleToggleRow(rowKey)}
                          aria-label={`Select row ${rowKey}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm',
                          column.type === 'number' && 'text-right',
                          column.type === 'action' && 'text-right',
                          column.width,
                          column.className,
                        )}
                      >
                        {renderCell(column, row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {isPaginated && !loading && sortedData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * internalPageSize + 1, sortedData.length)}-
            {Math.min(currentPage * internalPageSize, sortedData.length)} of {sortedData.length}
          </span>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <select
              value={internalPageSize}
              onChange={(e) => setInternalPageSize(Number(e.target.value))}
              className="h-8 rounded-sm border border-border bg-background px-2 text-xs text-foreground"
              aria-label="Rows per page"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>

            {/* Page navigation */}
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-sm transition-colors duration-150 hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                aria-label="Previous page"
              >
                <CaretLeft size={16} />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-colors duration-150',
                      page === currentPage
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:bg-muted',
                    )}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-sm transition-colors duration-150 hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                aria-label="Next page"
              >
                <CaretRight size={16} />
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }
export type { Column, DataTableProps }
