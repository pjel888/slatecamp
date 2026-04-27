import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading3DLabModule() {
  return (
    <div
      className="flex h-full w-full flex-col bg-page-bg"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-sm" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
          <CircleNotch size={16} className="animate-spin text-primary" />
          Loading 3D module...
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[420px] bg-muted/30">
          <div className="absolute inset-6 rounded-xl border border-border/70 bg-background/70">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </div>
        <aside className="hidden border-l border-border bg-background/90 p-4 lg:block">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </aside>
      </div>
    </div>
  )
}
