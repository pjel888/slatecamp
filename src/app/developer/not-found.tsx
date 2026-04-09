import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

export default function NotFound() {
  return (
    <div className="max-w-4xl flex flex-col items-center justify-center py-20 text-center">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1">
        404
      </p>
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground mb-2">
        Page Not Found
      </h1>
      <p className="text-[13px] text-muted-foreground max-w-md mb-6">
        This developer portal page doesn&#39;t exist. Check the sidebar for available pages.
      </p>
      <Link
        href={ROUTES.developer.root}
        className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-primary rounded-sm hover:bg-primary/90 transition-colors"
      >
        Back to Developer Portal
      </Link>
    </div>
  )
}
