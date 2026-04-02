import type { Metadata } from 'next'
import { CHBCalculator } from './_components/CHBCalculator'

export const metadata: Metadata = {
  title: 'CHB Wall Calculator | SlateCamp',
  description:
    'Free CHB wall estimation calculator with 3D preview. Compute hollow blocks, mortar, cement, sand, and rebar for masonry walls.',
}

export default function CHBCalculatorPage() {
  return <CHBCalculator />
}
