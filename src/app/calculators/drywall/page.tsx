// src/app/calculators/drywall/page.tsx
import type { Metadata } from 'next'
import { DrywallCalculator } from './_components/DrywallCalculator'

export const metadata: Metadata = {
  title: 'Drywall Calculator | SlateCamp',
  description:
    'Free drywall partition estimation calculator with 3D preview. Compute studs, boards, and tracks for any wall.',
}

export default function DrywallCalculatorPage() {
  return <DrywallCalculator />
}
