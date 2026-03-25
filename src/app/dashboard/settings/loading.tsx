import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in-0 duration-150">
      {/* Discipline card */}
      <div className="rounded-md border border-border bg-white p-5 space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-64" />
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-9 w-48 rounded-sm" />
          <Skeleton className="h-9 w-28 rounded-sm" />
        </div>
      </div>

      {/* Account card */}
      <div className="rounded-md border border-border bg-white p-5 space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-sm" />
      </div>
    </div>
  )
}
