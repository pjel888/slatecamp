'use client'

import { useRef, useState, useEffect } from 'react'
import { X } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { addFinancialEntry, updateFinancialEntry } from '@/lib/actions/ceo/financial-actions'
import {
  type FinancialEntry,
  type FinancialEntryType,
  REVENUE_CATEGORIES,
  EXPENSE_CATEGORIES,
  INVESTMENT_CATEGORIES,
  CATEGORY_LABELS,
} from '@/types/ceo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface FinancialEntryFormProps {
  isOpen: boolean
  onClose: () => void
  editEntry?: FinancialEntry | null
}

const CATEGORY_MAP: Record<FinancialEntryType, readonly string[]> = {
  revenue: REVENUE_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
  investment: INVESTMENT_CATEGORIES,
}

const TYPE_LABELS: Record<FinancialEntryType, string> = {
  revenue: 'Revenue',
  expense: 'Expense',
  investment: 'Investment',
}

const RecurringCheckbox = ({ defaultChecked }: { defaultChecked: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <>
      <input type="hidden" name="is_recurring" value={checked ? 'true' : ''} />
      <Checkbox
        id="is_recurring"
        checked={checked}
        onCheckedChange={(val) => setChecked(!!val)}
      />
    </>
  )
}

const CategorySelect = ({
  categories,
  defaultValue,
}: {
  categories: readonly string[]
  defaultValue: string
}) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <>
      <input type="hidden" name="category" value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category…" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {CATEGORY_LABELS[cat] ?? cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export const FinancialEntryForm = ({ isOpen, onClose, editEntry }: FinancialEntryFormProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entryType, setEntryType] = useState<FinancialEntryType>(
    editEntry?.entryType ?? 'expense',
  )

  const isEdit = editEntry != null

  // Sync type when editEntry changes
  useEffect(() => {
    if (editEntry) setEntryType(editEntry.entryType)
    else setEntryType('expense')
    setError(null)
  }, [editEntry, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current) return

    setPending(true)
    setError(null)

    const formData = new FormData(formRef.current)

    const result = isEdit
      ? await updateFinancialEntry(formData)
      : await addFinancialEntry(formData)

    setPending(false)

    if (!result.success) {
      setError(result.error ?? 'Something went wrong')
      return
    }

    formRef.current.reset()
    setEntryType('expense')
    onClose()
  }

  const categories = CATEGORY_MAP[entryType]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-lg flex flex-col transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit financial entry' : 'Add financial entry'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            {isEdit ? 'Edit Entry' : 'Add Financial Entry'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isEdit && <input type="hidden" name="id" value={editEntry.id} />}

          {/* Entry Date */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground" htmlFor="entry_date">
              Entry Date
            </label>
            <input
              id="entry_date"
              name="entry_date"
              type="date"
              required
              defaultValue={editEntry?.entryDate ?? new Date().toISOString().split('T')[0]}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground" htmlFor="entry_type">
              Type
            </label>
            <input type="hidden" name="entry_type" value={entryType} />
            <Select
              value={entryType}
              onValueChange={(val) => setEntryType(val as FinancialEntryType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABELS) as FinancialEntryType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground" htmlFor="category">
              Category
            </label>
            <CategorySelect
              categories={categories}
              defaultValue={editEntry?.category ?? ''}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground" htmlFor="amount_php">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">₱</span>
              <input
                id="amount_php"
                name="amount_php"
                type="number"
                step="0.01"
                min="0.01"
                max="100000000"
                required
                defaultValue={editEntry?.amountPhp ?? ''}
                className="w-full rounded-sm border border-border bg-background pl-7 pr-3 py-2 text-sm text-foreground font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground" htmlFor="description">
              Description <span className="normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={500}
              rows={3}
              defaultValue={editEntry?.description ?? ''}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Add a note…"
            />
          </div>

          {/* Is Recurring */}
          <div className="flex items-center gap-3">
            <RecurringCheckbox defaultChecked={editEntry?.isRecurring ?? false} />
            <label htmlFor="is_recurring" className="text-sm text-foreground select-none cursor-pointer">
              Recurring monthly entry
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-sm bg-destructive/10 border border-destructive/20 px-3 py-2 text-[12px] text-destructive">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={pending}
            loading={pending}
            fullWidth
          >
            {isEdit ? 'Save Changes' : 'Add Entry'}
          </Button>
        </div>
      </div>
    </>
  )
}
