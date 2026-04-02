// src/app/calculators/_components/CanvasEmptyState.tsx
// Ghost placeholder shown before any dimensions are entered.
// Renders as a DOM element — the R3F Canvas does NOT mount until
// valid dimensions are provided.

interface CanvasEmptyStateProps {
  message?: string
}

export function CanvasEmptyState({
  message = 'Enter room dimensions to see your 3D preview',
}: CanvasEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-3 h-12 w-12 rounded-lg bg-muted" />
      <p className="max-w-[200px] font-sans text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  )
}
