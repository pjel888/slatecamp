// src/app/calculators/paint/page.tsx
import type { Metadata } from 'next'
import { PaintCalculator } from './_components/PaintCalculator'

export const metadata: Metadata = {
  title: 'Paint Calculator | SlateCamp',
  description:
    'Free paint estimation calculator with 3D room preview. Compute wall area, paint liters, and cans to buy.',
}

export default function PaintCalculatorPage() {
  return <PaintCalculator />
}
