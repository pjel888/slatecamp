// src/app/calculators/_components/EstimationDisclaimer.tsx
// Standard estimation disclaimer footer — shared by all calculator tools.

export function EstimationDisclaimer() {
  return (
    <div className="border-t border-border bg-card px-4 py-2">
      <p className="font-sans text-[10px] text-muted-foreground">
        Preliminary estimation for budgeting purposes. Not a final bill of
        quantities or code-certified documentation.
      </p>
    </div>
  )
}
