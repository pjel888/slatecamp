import type { CalculatorConfig } from '@/features/3d-lab/types/templates'

export const calculatorFlooringConfig: CalculatorConfig = {
  id: 'calculator-flooring',
  title: 'Flooring / Tile Visualizer',
  description: 'Estimate tiles with 3D pattern preview and waste calculation',
  subject: 'Estimating & Quantity Surveying',
  toolType: 'flooring',
  camera: {
    position: [5, 5, 5],
    zoom: 80,
  },
}

