'use client'

import { useState, useMemo, useCallback } from 'react'
import { buildRegistryTree, getModelConfigDetail } from '../_lib/model-registry-data'
import type { RegistryTree } from '../_lib/model-registry-data'
import { ModelRegistryTree } from './ModelRegistryTree'
import { ModelConfigDetail } from './ModelConfigDetail'
import { Cube, Stack, TreeStructure } from '@phosphor-icons/react/dist/ssr'
import { SearchInput } from '@/components/ui/input'

export function ModelRegistryPage() {
  const tree: RegistryTree = useMemo(() => buildRegistryTree(), [])

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [selectedModelConfig, setSelectedModelConfig] = useState<unknown | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSelect = useCallback(async (modelId: string) => {
    setSelectedModelId(modelId)
    setSelectedModelConfig(null)
    setConfigLoading(true)
    try {
      const config = await getModelConfigDetail(modelId)
      setSelectedModelConfig(config)
    } catch {
      setSelectedModelConfig(null)
    } finally {
      setConfigLoading(false)
    }
  }, [])

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">3D Models Registry</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Inspect all {tree.totalModules} registered 3D modules across {tree.totalCategories} categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatBadge icon={<Cube size={14} weight="duotone" />} label="Models" value={tree.totalModules} />
            <StatBadge icon={<Stack size={14} weight="duotone" />} label="Categories" value={tree.totalCategories} />
            <StatBadge icon={<TreeStructure size={14} weight="duotone" />} label="Subjects" value={tree.subjects.length} />
          </div>
        </div>
      </header>

      {/* Two-column layout — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Tree */}
        <div className="flex w-[340px] shrink-0 flex-col bg-card">
          <div className="shrink-0 border-b border-border px-3 py-2.5">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search models..."
              size="sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <ModelRegistryTree
              tree={tree}
              selectedId={selectedModelId}
              onSelect={handleSelect}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* Right panel: Detail — fills all remaining space */}
        <div className="flex-1 overflow-y-auto bg-background">
          <ModelConfigDetail
            modelId={selectedModelId}
            config={selectedModelConfig}
            loading={configLoading}
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Badge                                                         */
/* ------------------------------------------------------------------ */

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
