import { calculatorCHBConfig } from '@/features/3d-lab/config/modules/15-estimating/calculator-chb'
import { calculatorDrywallConfig } from '@/features/3d-lab/config/modules/15-estimating/calculator-drywall'
import { calculatorFlooringConfig } from '@/features/3d-lab/config/modules/15-estimating/calculator-flooring'
import { calculatorPaintConfig } from '@/features/3d-lab/config/modules/15-estimating/calculator-paint'

export const CALCULATOR_TOOL_SLUGS = ['flooring', 'paint', 'drywall', 'chb'] as const

export type CalculatorToolSlug = (typeof CALCULATOR_TOOL_SLUGS)[number]

export const CALCULATOR_TOOL_CONFIGS = {
  chb: calculatorCHBConfig,
  drywall: calculatorDrywallConfig,
  flooring: calculatorFlooringConfig,
  paint: calculatorPaintConfig,
} satisfies Record<CalculatorToolSlug, typeof calculatorFlooringConfig>

export const CALCULATOR_TOOL_META = {
  chb: {
    title: 'CHB Wall Calculator | SlateCamp',
    description:
      'Free CHB wall estimation calculator with 3D preview. Compute hollow blocks, mortar, cement, sand, and rebar for masonry walls.',
  },
  drywall: {
    title: 'Drywall Calculator | SlateCamp',
    description:
      'Free drywall partition estimation calculator with 3D preview. Compute studs, boards, and tracks for any wall.',
  },
  flooring: {
    title: 'Tile Calculator | SlateCamp',
    description:
      'Free tile estimation calculator with 3D pattern preview. Compute tile count, waste, and boxes to buy for any room.',
  },
  paint: {
    title: 'Paint Calculator | SlateCamp',
    description:
      'Free paint estimation calculator with 3D room preview. Compute wall area, paint liters, and cans to buy.',
  },
} satisfies Record<CalculatorToolSlug, { title: string; description: string }>
