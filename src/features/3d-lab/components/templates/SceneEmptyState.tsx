// src/features/3d-lab/components/templates/SceneEmptyState.tsx
// Shown when a scene has no geometry data to render.

export const SceneEmptyState = () => (
  <div className="flex h-full w-full items-center justify-center">
    <p className="text-sm text-muted-foreground">
      No geometry data available for this module
    </p>
  </div>
)
