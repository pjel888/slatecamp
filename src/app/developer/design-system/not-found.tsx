import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-4xl flex flex-col items-center justify-center py-20 text-center">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1">
        404
      </p>
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight mb-2">
        Component Not Found
      </h1>
      <p className="text-[13px] text-muted-foreground max-w-md mb-6">
        The component you&#39;re looking for doesn&#39;t exist in the design system catalog.
        It may have been renamed or removed.
      </p>
      <div className="flex gap-3">
        <Link
          href="/developer/design-system"
          className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-primary rounded-sm hover:bg-primary/90 transition-colors"
        >
          Browse Components
        </Link>
        <Link
          href="/developer"
          className="inline-flex items-center px-4 py-2 text-xs font-medium text-foreground border border-border rounded-sm hover:bg-muted transition-colors"
        >
          Developer Portal
        </Link>
      </div>
    </div>
  )
}
