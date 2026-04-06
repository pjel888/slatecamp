import type { CalculatorConfig } from '@/features/3d-lab/types/templates'

export const calculatorPaintConfig: CalculatorConfig = {
  id: 'calculator-paint',
  title: 'Paint Visualizer',
  description: 'Calculate paint for walls and ceilings with 3D room preview',
  subject: 'Estimating & Quantity Surveying',
  toolType: 'paint',
  camera: {
    position: [6, 5, 6],
    zoom: 60,
  },
}

