// src/app/calculators/flooring/page.tsx
import type { Metadata } from 'next'
import { FlooringCalculator } from './_components/FlooringCalculator'

export const metadata: Metadata = {
  title: 'Tile Calculator | SlateCamp',
  description:
    'Free tile estimation calculator with 3D pattern preview. Compute tile count, waste, and boxes to buy for any room.',
}

export default function FlooringCalculatorPage() {
  return <FlooringCalculator />
}
