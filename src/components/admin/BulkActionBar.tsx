'use client'

import { useState } from 'react'
import { Trash } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'

interface BulkActionBarProps {
  selectedCount: number
  onDelete: () => Promise<void>
  onExport?: () => void
  entityName: string
}

export const BulkActionBar = ({
  selectedCount,
  onDelete,
  onExport,
  entityName,
}: BulkActionBarProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 ml-auto">
        {error && (
          <span className="text-[11px] text-destructive">{error}</span>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            Export CSV
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          leftIcon={<Trash weight="bold" />}
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
        >
          Delete ({selectedCount})
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${selectedCount} ${entityName}?`}
        description="This cannot be undone."
        confirmLabel={`Delete ${selectedCount}`}
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </>
  )
}
