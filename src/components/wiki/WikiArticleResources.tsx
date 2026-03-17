'use client'

export function WikiArticleResources() {
  return (
    <div className="mt-10 pt-8 border-t border-border/40">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
        Resources
      </h3>
      <ul className="space-y-3">
        <li>
          <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            Cite this article
          </button>
        </li>
        <li>
          <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            Suggest an edit
          </button>
        </li>
        <li>
          <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            Download PDF
          </button>
        </li>
      </ul>
    </div>
  )
}
