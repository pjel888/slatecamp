// src/app/calculators/layout.tsx
// Minimal layout for Calculator Suite — no dashboard sidebar.
// Calculators are public-facing SEO pages with their own navigation.
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Calculator Suite | SlateCamp',
  description:
    'Free 3D material estimation tools for architects and contractors. Tile, paint, and drywall calculators with interactive 3D preview.',
}

export default function CalculatorsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-light">
      {children}
    </div>
  )
}
