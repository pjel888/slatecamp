'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Box, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  name: string
  slug: string
  url: string
  thumbnail: string | null
  status: string
  metadata: Record<string, unknown>
  created_at: string
}

interface AssetListProps {
  initialAssets: Asset[]
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
  archived: 'Archived',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function AssetList({ initialAssets }: AssetListProps) {
  const [assets] = useState(initialAssets)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [systemFilter, setSystemFilter] = useState<string | null>(null)

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === null || a.status === statusFilter
    const matchesSystem = systemFilter === null || (a.metadata as any)?.system === systemFilter
    return matchesSearch && matchesStatus && matchesSystem
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
          />
        </div>
        <select
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter(e.target.value ? e.target.value : null)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={systemFilter ?? ''}
          onChange={(e) => setSystemFilter(e.target.value ? e.target.value : null)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Systems</option>
          <option value="structural">Structural</option>
          <option value="mep">MEP</option>
          <option value="architectural">Architectural</option>
        </select>
        <Link
          href="/admin/assets/new"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Upload Asset
        </Link>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No assets found
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-md border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                {asset.thumbnail ? (
                  <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover rounded-t-lg" />
                ) : (
                  <Box className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium truncate">{asset.name}</h3>
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                    statusColors[asset.status]
                  )}>
                    {statusLabels[asset.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {(asset.metadata as any)?.system} • {(asset.metadata as any)?.layer}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/assets/${asset.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md border border-input hover:bg-muted"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
