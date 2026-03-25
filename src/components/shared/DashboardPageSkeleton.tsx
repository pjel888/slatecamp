"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for the dashboard page — mirrors the actual layout structure:
 * Streak ribbon → Hero command bar (score + greeting + heatmap) → Content grid.
 * Per design system: skeleton screens only, no spinners. Transition 150ms ease.
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-full h-full min-h-0 animate-in fade-in-0 duration-150">
      {/* ── Streak Ribbon ──────────────────────────────── */}
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* ── Hero Command Bar ───────────────────────────── */}
      <div className="rounded-md border border-border bg-white p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Score circle */}
          <div className="flex items-center gap-4 shrink-0">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>

          {/* Hero stats row */}
          <div className="flex-1 flex items-end gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap area */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-24 rounded-sm" />
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 32 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      {/* ── Content Grid ───────────────────────────────── */}
      <div className="min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
          {/* Quick-stat cards (3-col span) */}
          <div className="lg:col-span-3 rounded-md border border-border bg-white p-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { bg: "bg-primary-50" },
                { bg: "bg-[#EDFAF4]" },
                { bg: "bg-[#FEF8ED]" },
              ].map((card, i) => (
                <div key={i} className={`rounded-md ${card.bg} p-3 min-h-[72px] flex flex-col justify-between`}>
                  <Skeleton className="h-3 w-16 bg-black/5" />
                  <Skeleton className="h-5 w-10 bg-black/5" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed (right column, spans 2 rows) */}
          <div className="h-full lg:row-span-2 rounded-md border border-border bg-white p-3">
            <Skeleton className="h-4 w-24 mb-3" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily wiki card */}
          <div className="rounded-md border border-border bg-white p-3">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-full mb-1.5" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-7 w-24 rounded-sm mt-3" />
          </div>

          {/* Empty spacer (matches real layout) */}
          <div />

          {/* Subject mastery card */}
          <div className="rounded-md border border-border bg-white p-3">
            <Skeleton className="h-4 w-28 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24 flex-1" />
                  <Skeleton className="h-2 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
