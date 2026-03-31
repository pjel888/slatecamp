'use client'

import React from 'react'

interface ModelConfigDetailProps {
  modelId: string | null
  config: unknown | null
  loading: boolean
}

function renderValue(value: unknown, depth = 0): React.ReactNode {
  try {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'function') return '[Function]'
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (typeof value === 'number' || typeof value === 'string') return String(value)
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]'
      return (
        <ul>
          {value.map((item, i) => (
            <li key={i}>{renderValue(item, depth + 1)}</li>
          ))}
        </ul>
      )
    }
    if (typeof value === 'object') {
      return (
        <dl>
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{renderValue(v, depth + 1)}</dd>
            </div>
          ))}
        </dl>
      )
    }
    return String(value)
  } catch {
    return 'Error rendering field'
  }
}

export function ModelConfigDetail({ modelId, config, loading }: ModelConfigDetailProps) {
  if (!modelId) {
    return (
      <div>
        <p>Select a model from the tree to view its configuration</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <p>Loading configuration...</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div>
        <p>No configuration found for this model.</p>
      </div>
    )
  }

  const configObj = config as Record<string, unknown>

  return (
    <div>
      <h2>{(configObj.title as string) ?? (configObj.id as string) ?? modelId}</h2>
      <dl>
        {Object.entries(configObj).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>
              {(() => {
                try {
                  return renderValue(value)
                } catch {
                  return 'Error rendering field'
                }
              })()}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
