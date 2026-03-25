'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cube, ArrowLeft, Trash } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  name: string
  slug: string
  url: string
  thumbnail: string | null
  status: string
  metadata: Record<string, unknown> | null
  created_at: string
}

interface AssetDetailViewProps {
  asset: Asset
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending_review: 'outline',
  published: 'default',
  archived: 'destructive',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
  archived: 'Archived',
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export const AssetDetailView = ({ asset }: AssetDetailViewProps) => {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const system = asset.metadata?.system as string | undefined
  const layer = asset.metadata?.layer as string | undefined

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      // Placeholder: wire up a deleteAsset server action when available
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      setDeleteOpen(false)
      router.push('/admin/assets')
      router.refresh()
    } catch {
      setDeleteError('An unexpected error occurred. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          3D ASSET
        </p>
        <h1 className="text-xl font-semibold">{asset.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thumbnail */}
        <div className="lg:col-span-1">
          <Card className="rounded-md border border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                {asset.thumbnail ? (
                  <img
                    src={asset.thumbnail}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <SCIcon icon={Cube} size="2xl" className="text-muted-foreground" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-[family-name:var(--font-dm-mono)] uppercase tracking-widest">
                {asset.thumbnail ? 'Thumbnail Preview' : 'No thumbnail'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-md border border-border bg-card">
            <CardHeader className="pb-2">
              <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-widest text-muted-foreground">
                Asset Details
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <DetailRow label="Status">
                <Badge variant={statusVariant[asset.status] ?? 'secondary'}>
                  {statusLabels[asset.status] ?? asset.status}
                </Badge>
              </DetailRow>

              <DetailRow label="Slug">
                <span className="font-[family-name:var(--font-dm-mono)] text-[13px] tabular-nums">
                  {asset.slug}
                </span>
              </DetailRow>

              <DetailRow label="File URL">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm truncate max-w-[360px] block"
                >
                  {asset.url}
                </a>
              </DetailRow>

              {system && (
                <DetailRow label="System">
                  <span className="text-sm capitalize">{system}</span>
                </DetailRow>
              )}

              {layer && (
                <DetailRow label="Layer">
                  <span className="text-sm capitalize">{layer}</span>
                </DetailRow>
              )}

              <DetailRow label="Uploaded">
                <span className="font-[family-name:var(--font-dm-mono)] text-[13px] tabular-nums text-muted-foreground">
                  {formatDate(asset.created_at)}
                </span>
              </DetailRow>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/admin/assets"
              className={cn(
                'inline-flex items-center justify-center rounded-sm border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors duration-150',
              )}
            >
              <SCIcon icon={ArrowLeft} size="sm" className="mr-1.5" />
              Back to Assets
            </Link>
            <Button
              variant="destructive"
              className="rounded-sm"
              onClick={() => setDeleteOpen(true)}
            >
              <SCIcon icon={Trash} size="sm" className="mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">&ldquo;{asset.name}&rdquo;</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="text-[11px] text-destructive bg-[#FDF0F0] border border-destructive/20 rounded-sm px-3 py-2">
              {deleteError}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteError(null)
                setDeleteOpen(false)
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Asset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const DetailRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex items-start gap-4">
    <span className="text-[11px] font-[family-name:var(--font-dm-mono)] uppercase tracking-widest text-muted-foreground w-24 shrink-0 pt-0.5">
      {label}
    </span>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
)
