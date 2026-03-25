export const DocSection = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-md border border-border p-4">
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
  </div>
)
