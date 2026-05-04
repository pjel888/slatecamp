import { parseMdxProp } from '../shared/parse-mdx-prop'

interface KeyValueItem {
  value: string
  label: string
}

interface KeyValuesRawProps {
  items?: KeyValueItem[] | [string, string][] | string
  values?: Record<string, string> | string
  pairs?: [string, string][] | string
  title?: string
  note?: string
}

function normalizeKeyValues(raw: KeyValuesRawProps): { items: KeyValueItem[]; title?: string; note?: string } {
  // Determine which prop convention is in use
  let items: KeyValueItem[] = []

  if (raw.items) {
    const parsed: any[] = parseMdxProp<any[]>(raw.items, [])
    items = parsed.map((p: any) => {
      if (Array.isArray(p)) {
        // Tuple format: ["Label", "Value"]
        return { label: String(p[0] || ''), value: String(p[1] || '') }
      }
      return p as KeyValueItem
    })
  } else if (raw.values) {
    // Flat object format: { "Key": "Value", ... }
    const vals = typeof raw.values === 'string'
      ? parseMdxProp<Record<string, string>>(raw.values, {})
      : raw.values
    items = Object.entries(vals).map(([label, value]) => ({ value, label }))
  } else if (raw.pairs) {
    // Tuple array format: [["Label", "Value"], ...]
    const pairs = parseMdxProp<[string, string][]>(raw.pairs, [])
    items = pairs.map(([label, value]) => ({ value, label }))
  }

  return { items, title: raw.title, note: raw.note }
}

export const KeyValues = (raw: KeyValuesRawProps) => {
  const { items, title, note } = normalizeKeyValues(raw)
  if (items.length === 0) return null
  return (
    <div className="not-prose my-5">
      {title && (
        <p className="font-sans text-xs font-semibold text-wiki-ink mb-3 dark:text-wiki-invert-heading">
          {title}
        </p>
      )}
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-card border border-wiki-border rounded-md px-4 py-4 text-center dark:bg-wiki-ink dark:border-wiki-invert-divider"
        >
          <div className={`font-sans text-camp-cobalt leading-tight mb-1 ${
            item.value.length > 30
              ? 'text-[14px] font-medium'
              : item.value.length > 12
                ? 'text-[18px] font-semibold'
                : 'text-[28px] font-bold leading-none'
          }`}>
            {item.value}
          </div>
          <div className="font-[var(--font-dm-mono)] text-[11px] text-ink-muted uppercase tracking-[0.06em] dark:text-wiki-muted">
            {item.label}
          </div>
        </div>
      ))}
    </div>
      {note && (
        <p className="font-[var(--font-dm-mono)] text-[10px] text-wiki-muted mt-2 dark:text-wiki-muted">
          {note}
        </p>
      )}
    </div>
  )
}
