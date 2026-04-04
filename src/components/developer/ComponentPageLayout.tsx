'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/portal'
import { PreviewArea } from './PreviewArea'
import { CodeBlock } from '@/app/developer/_components/CodeBlock'
import { PropTable } from '@/app/developer/_components/PropTable'
import type { PropsTableEntry } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Component Page Layout — the Preview | Props | Code triad           */
/* ------------------------------------------------------------------ */

interface ComponentPageLayoutProps {
  title: string
  description: string
  domain: string
  status: 'stable' | 'beta' | 'deprecated'
  importPath: string
  filePath: string
  preview: React.ReactNode
  propsTable: PropsTableEntry[]
  codeSnippet: string
  lastUpdated?: string
}

const STATUS_VARIANT = {
  stable: 'success',
  beta: 'warning',
  deprecated: 'danger',
} as const

type Tab = 'preview' | 'props' | 'code'

export const ComponentPageLayout = ({
  title,
  description,
  domain,
  status,
  importPath,
  filePath,
  preview,
  propsTable,
  codeSnippet,
  lastUpdated,
}: ComponentPageLayoutProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'preview', label: 'Preview' },
    { id: 'props', label: 'Props' },
    { id: 'code', label: 'Code' },
  ]

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-5">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
          {domain}
        </p>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground">
            {title}
          </h1>
          <Badge variant={STATUS_VARIANT[status]} size="xs" pill>
            {status}
          </Badge>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl">
          {description}
        </p>

        {/* Import / file path */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <code className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
              {importPath}
            </code>
            <CopyButton text={`import { ${title} } from '${importPath}'`} />
          </div>
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground/60">
            {filePath}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer',
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'preview' && (
        <PreviewArea>{preview}</PreviewArea>
      )}

      {activeTab === 'props' && (
        <PropTable
          props={propsTable.map((p) => ({
            name: p.name,
            type: p.type,
            default: p.defaultValue ?? undefined,
            required: p.required,
            description: p.description,
          }))}
        />
      )}

      {activeTab === 'code' && (
        <CodeBlock
          code={codeSnippet}
          language="tsx"
          showLineNumbers
        />
      )}

      {/* Footer */}
      {lastUpdated && (
        <p className="mt-6 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
          Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
    </div>
  )
}
