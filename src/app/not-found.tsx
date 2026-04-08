import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="font-display text-3xl font-extrabold text-foreground">
        Page not found
      </h1>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        This page doesn&apos;t exist or may have moved.
      </p>
      <div className="flex gap-3">
        <Link href={ROUTES.dashboard.root}>
          <Button>Go to Dashboard</Button>
        </Link>
        <Link href={ROUTES.home}>
          <Button variant="outline">Home</Button>
        </Link>
      </div>
    </div>
  )
}
