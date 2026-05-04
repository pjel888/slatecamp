import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { Button } from '@/components/ui/button'

export default function WikiArticleNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h2 className="font-display text-2xl font-extrabold text-foreground">
        Article not found
      </h2>
      <p className="text-sm text-muted-foreground">
        This wiki article doesn&apos;t exist or has been moved.
      </p>
      <Link href={ROUTES.wiki.root}>
        <Button>Back to Wiki</Button>
      </Link>
    </div>
  )
}
