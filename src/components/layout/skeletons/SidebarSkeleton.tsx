// No 'use client' needed — pure static markup

export const SidebarSkeleton = () => (
  <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-card shrink-0 fixed top-0 left-0 bottom-0 z-30">
    {/* Title block */}
    <div className="px-4 py-4 border-b border-border shrink-0">
      <div className="h-3 w-28 rounded-sm bg-muted animate-pulse" />
    </div>

    {/* Nav section groups */}
    <div className="flex-1 px-2 py-3 overflow-hidden">
      {[0, 1, 2].map((sectionIdx) => (
        <div key={sectionIdx} className="mb-6">
          {/* Section eyebrow label */}
          <div className="mb-2 mx-3 h-2.5 w-16 rounded-sm bg-muted animate-pulse" />

          {/* Nav item placeholders */}
          <div className="space-y-0.5">
            {[0, 1, 2, sectionIdx === 0 ? 3 : -1]
              .filter((n) => n >= 0)
              .map((itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-center gap-2.5 px-3 min-h-[44px]"
                >
                  <div className="h-4 w-4 rounded-sm bg-muted animate-pulse shrink-0" />
                  <div
                    className={`h-3 rounded-sm bg-muted animate-pulse`}
                    style={{ width: `${60 + itemIdx * 12}%` }}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>

    {/* Footer placeholder */}
    <div className="shrink-0 border-t border-border px-2 py-2 space-y-0.5">
      <div className="flex items-center gap-2.5 px-3 min-h-[44px]">
        <div className="h-4 w-4 rounded-sm bg-muted animate-pulse shrink-0" />
        <div className="h-3 w-16 rounded-sm bg-muted animate-pulse" />
      </div>
    </div>
  </aside>
)
