'use client'

import { useDevStore } from '@/stores/dev-store'
import { useAllFeatureFlags } from '@/lib/hooks/useFeatureFlag'
import { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagCategory } from '@/config/feature-flags'

const CATEGORY_LABELS: Record<FeatureFlagCategory, string> = {
  access: 'Access Gates',
  org: 'Organization',
  dev: 'Developer',
}

const SOURCE_COLORS: Record<string, string> = {
  override: 'text-amber-500',
  db: 'text-blue-500',
  config: 'text-muted-foreground',
}

interface FeatureFlagBoardProps {
  dbFlags?: Partial<Record<FeatureFlagKey, boolean>>
}

export function FeatureFlagBoard({ dbFlags }: FeatureFlagBoardProps) {
  const setFeatureOverride = useDevStore((s) => s.setFeatureOverride)
  const clearFeatureOverrides = useDevStore((s) => s.clearFeatureOverrides)
  const resolved = useAllFeatureFlags(dbFlags)

  // Group by category
  const grouped = (Object.keys(CATEGORY_LABELS) as FeatureFlagCategory[]).map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    flags: (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).filter(
      (k) => FEATURE_FLAGS[k].category === cat,
    ),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Feature Flags
        </h3>
        <button
          type="button"
          onClick={clearFeatureOverrides}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear overrides
        </button>
      </div>

      <div className="space-y-4">
        {grouped.map(({ category, label, flags }) => (
          <div key={category}>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className="mt-1.5 space-y-1">
              {flags.map((key) => {
                const def = FEATURE_FLAGS[key]
                const { enabled, source } = resolved[key]

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-foreground">
                        {def.description}
                      </span>
                      <span className={`text-[11px] ${SOURCE_COLORS[source]}`}>
                        {source}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFeatureOverride(key, source === 'override' ? null : !enabled)
                      }
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        enabled ? 'bg-emerald-500' : 'bg-muted-foreground'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
