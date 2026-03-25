'use client'

import { useState, useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteFinancialEntry } from '@/lib/actions/ceo/financial-actions'
import { FinancialEntryForm } from '@/components/ceo/FinancialEntryForm'
import type { FinancialEntry, FinancialEntryType } from '@/types/ceo'
import { CATEGORY_LABELS, formatPeso } from '@/types/ceo'
import { ConfirmDialog } from '@/components/ui/dialog'
import { DataTable, type Column } from '@/components/shared/data-table'

type FilterTab = 'all' | FinancialEntryType

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Expenses', value: 'expense' },
  { label: 'Investments', value: 'investment' },
]

const TYPE_BADGE: Record<FinancialEntryType, string> = {
  revenue: 'bg-success/10 text-success',
  expense: 'bg-primary/10 text-primary',
  investment: 'bg-accent/10 text-accent',
}

const TYPE_LABELS: Record<FinancialEntryType, string> = {
  revenue: 'Revenue',
  expense: 'Expense',
  investment: 'Investment',
}

interface FinancialLedgerProps {
  entries: FinancialEntry[]
}

export const FinancialLedger = ({ entries }: FinancialLedgerProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<FinancialEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const filteredEntries =
    activeFilter === 'all'
      ? entries
      : entries.filter((e) => e.entryType === activeFilter)

  const handleEdit = (entry: FinancialEntry) => {
    setEditEntry(entry)
    setDrawerOpen(true)
  }

  const handleAdd = () => {
    setEditEntry(null)
    setDrawerOpen(true)
  }

  const handleDelete = useCallback((id: string) => {
    setPendingDeleteId(id)
    setShowDeleteConfirm(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteId) return
    setDeletingId(pendingDeleteId)
    setPendingDeleteId(null)
    await deleteFinancialEntry(pendingDeleteId)
    setDeletingId(null)
  }, [pendingDeleteId])

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setEditEntry(null)
  }

  const columns: Column<FinancialEntry>[] = [
    {
      key: 'entryDate',
      header: 'Date',
      sortable: true,
      render: (entry) => (
        <span className="font-mono text-sm tabular-nums text-foreground whitespace-nowrap">
          {entry.entryDate}
        </span>
      ),
    },
    {
      key: 'entryType',
      header: 'Type',
      sortable: true,
      render: (entry) => (
        <span
          className={cn(
            'inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium',
            TYPE_BADGE[entry.entryType],
          )}
        >
          {TYPE_LABELS[entry.entryType]}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (entry) => (
        <span className="text-sm text-muted-foreground">
          {CATEGORY_LABELS[entry.category] ?? entry.category}
          {entry.description && (
            <span className="block text-[11px] text-muted-foreground/70 truncate max-w-[200px]">
              {entry.description}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'amountPhp',
      header: 'Amount',
      sortable: true,
      type: 'number',
      render: (entry) => (
        <span className="font-mono text-sm tabular-nums text-foreground whitespace-nowrap">
          {formatPeso(entry.amountPhp)}
        </span>
      ),
    },
    {
      key: 'isRecurring',
      header: 'Recurring',
      className: 'text-center',
      render: (entry) => (
        <span className="text-sm text-muted-foreground">
          {entry.isRecurring ? '✓' : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      type: 'action',
      render: (entry) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(entry)}
            className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150"
            aria-label={`Edit entry from ${entry.entryDate}`}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={() => handleDelete(entry.id)}
            disabled={deletingId === entry.id}
            className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive hover:border-destructive/30 disabled:opacity-50 transition-colors duration-150"
            aria-label={`Delete entry from ${entry.entryDate}`}
          >
            <Trash2 className="h-3 w-3" />
            {deletingId === entry.id ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Filter tabs + Add button */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-[11px] font-medium transition-colors duration-150',
                activeFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleAdd}
          className="rounded-sm bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
        >
          + Add Entry
        </button>
      </div>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={filteredEntries as unknown as Record<string, unknown>[]}
        keyField="id"
        defaultSort={{ key: 'entryDate', direction: 'desc' }}
        pageSize={20}
        emptyMessage="No entries yet. Add your first financial record."
      />

      {/* Entry form drawer */}
      <FinancialEntryForm
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        editEntry={editEntry}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete entry?"
        description="Delete this entry? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
