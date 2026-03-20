import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h2 className="font-display text-2xl font-extrabold text-foreground">
        This page doesn&apos;t exist
      </h2>
      <p className="text-sm text-muted-foreground">
        The section you&apos;re looking for isn&apos;t here.
      </p>
      <Link href="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
