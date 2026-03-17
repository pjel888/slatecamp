export default function DesignSystemPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Design System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Living component gallery and style reference.
        </p>
      </div>

      {/* Colors */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">Color Palette</h2>
        <div className="grid grid-cols-5 gap-3">
          {[
            { name: 'Primary (Campfire)', class: 'bg-primary', hex: '#3B6B9C' },
            { name: 'Mastery (Green)', class: 'bg-green-600', hex: '#16A34A' },
            { name: 'Developing (Amber)', class: 'bg-amber-600', hex: '#D97706' },
            { name: 'Critical (Red)', class: 'bg-red-600', hex: '#DC2626' },
            { name: 'Surface (Zinc)', class: 'bg-zinc-800', hex: '#27272A' },
          ].map((c) => (
            <div key={c.name} className="text-center">
              <div className={`h-12 w-full rounded-lg ${c.class}`} />
              <p className="mt-1.5 text-[11px] font-medium text-foreground">{c.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{c.hex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">Typography</h2>
        <div className="space-y-2 rounded-lg border border-border p-4">
          <p className="text-2xl font-bold text-foreground">Heading XL (24px bold)</p>
          <p className="text-lg font-bold text-foreground">Heading LG (18px bold)</p>
          <p className="text-sm font-semibold text-foreground">Heading SM (14px semibold)</p>
          <p className="text-sm text-foreground">Body (14px regular)</p>
          <p className="text-xs text-muted-foreground">Caption (12px muted)</p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Label (10px uppercase)
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#2F5A85] transition-colors">
            Primary
          </button>
          <button className="rounded-md bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">
            Secondary
          </button>
          <button className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            Outline
          </button>
          <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            Destructive
          </button>
          <button className="rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Ghost
          </button>
        </div>
      </section>

      {/* Status indicators */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">Status Indicators</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Success', dot: 'bg-emerald-500', bg: 'bg-emerald-500/10 text-emerald-600' },
            { label: 'Warning', dot: 'bg-amber-500', bg: 'bg-amber-500/10 text-amber-600' },
            { label: 'Error', dot: 'bg-red-500', bg: 'bg-red-500/10 text-red-600' },
            { label: 'Info', dot: 'bg-[#3B6B9C]', bg: 'bg-[#3B6B9C]/10 text-primary' },
          ].map((s) => (
            <span
              key={s.label}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
