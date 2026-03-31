'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { buildRegistryTree, getModelConfigDetail } from '../_lib/model-registry-data'
import type { RegistryTree } from '../_lib/model-registry-data'
import { ModelRegistryTree } from './ModelRegistryTree'
import { ModelConfigDetail } from './ModelConfigDetail'

export function ModelRegistryPage() {
  const tree: RegistryTree = useMemo(() => buildRegistryTree(), [])

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [selectedModelConfig, setSelectedModelConfig] = useState<unknown | null>(null)
  const [configLoading, setConfigLoading] = useState(false)

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
    <div>
      <header>
        <h1>3D Models Registry</h1>
        <p>{tree.totalModules} models across {tree.totalCategories} categories</p>
      </header>
      <div>
        <div>
          <ModelRegistryTree
            tree={tree}
            selectedId={selectedModelId}
            onSelect={handleSelect}
          />
        </div>
        <div>
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
