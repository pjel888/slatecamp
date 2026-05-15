import { parseMdxProp } from '../shared/parse-mdx-prop'

interface SourceItem {
  id: number | string
  label: string
  detail?: string
  status?: string
}

interface SourceRefProps {
  id: number | string
  label?: string
}

interface SourceQuoteProps {
  id: number | string
  quote: string
  note?: string
}

interface SourceListProps {
  items: SourceItem[] | string
}

export const SourceRef = ({ id, label }: SourceRefProps) => {
  const display = label || String(id)
  return (
    <a
      href={`#source-${id}`}
      aria-label={`Source ${display}`}
      className="not-prose align-super ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-camp-cobalt/25 bg-cobalt-light px-1 text-[10px] font-semibold leading-none text-camp-cobalt no-underline hover:border-camp-cobalt/45 hover:bg-camp-cobalt hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt/30"
    >
      {display}
    </a>
  )
}

export const SourceQuote = ({ id, quote, note }: SourceQuoteProps) => {
  return (
    <aside className="not-prose my-4 rounded-md border border-wiki-border bg-surface-light/60 px-4 py-3 dark:border-wiki-invert-divider dark:bg-wiki-ink/70">
      <div className="flex items-start gap-3">
        <a
          href={`#source-${id}`}
          className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-camp-cobalt px-1.5 text-[11px] font-semibold leading-none text-white no-underline"
          aria-label={`Source ${id}`}
        >
          {id}
        </a>
        <div className="min-w-0">
          <blockquote className="m-0 border-0 p-0 text-[13px] leading-relaxed text-wiki-body dark:text-wiki-invert-body">
            “{quote}”
          </blockquote>
          {note ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-wiki-muted dark:text-wiki-muted">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

export const SourceList = ({ items: rawItems }: SourceListProps) => {
  const items = parseMdxProp<SourceItem[]>(rawItems, [])
  if (items.length === 0) return null

  return (
    <section className="not-prose my-6 rounded-md border border-wiki-border bg-card dark:border-wiki-invert-divider dark:bg-wiki-ink">
      <div className="border-b border-wiki-border px-4 py-3 dark:border-wiki-invert-divider">
        <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt">
          Sources
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-wiki-muted dark:text-wiki-muted">
          Numbered references used in this article. These support vocabulary and construction concepts unless a governing Philippine source is named.
        </p>
      </div>
      <ol className="m-0 list-none divide-y divide-wiki-border p-0 dark:divide-wiki-invert-divider">
        {items.map((item) => (
          <li key={String(item.id)} id={`source-${item.id}`} className="scroll-mt-24 px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-camp-cobalt/25 bg-cobalt-light px-1.5 text-[11px] font-semibold leading-none text-camp-cobalt">
                {item.id}
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[13px] font-semibold leading-snug text-wiki-ink dark:text-wiki-invert-heading">
                  {item.label}
                </p>
                {item.detail ? (
                  <p className="m-0 mt-1 text-[12px] leading-relaxed text-wiki-body dark:text-wiki-invert-body">
                    {item.detail}
                  </p>
                ) : null}
                {item.status ? (
                  <p className="m-0 mt-1 text-[11px] leading-relaxed text-wiki-muted dark:text-wiki-muted">
                    {item.status}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
