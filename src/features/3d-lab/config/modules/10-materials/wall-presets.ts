// src/features/3d-lab/config/modules/10-materials/wall-presets.ts
// All wall configurator presets — 7 original + 5 new structural presets

import type { Preset } from '@/features/3d-lab/types/templates'

export const wallPresets: Preset[] = [
  {
    label: 'Standard CHB Room',
    values: {
      coreType: 'chb', wallLength: 5000, wallHeight: 3000, sides: '1 Side',
      showPlaster: true, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
      rebarSpacing: 800, rebarDiameter: '12', bondBeamInterval: 'Every 3rd course', chbSize: '150', showReinforcement: true,
    },
  },
  {
    label: 'Drywall Office Partition',
    values: {
      coreType: 'drywall', wallLength: 3000, wallHeight: 2700, sides: 'Both Sides',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Light Gray',
      studSpacing: '600', studDepth: '92', gypsumThickness: '12.5', gypsumLayers: 'Single layer', showInsulation: false, showBridging: false,
    },
  },
  {
    label: 'Plywood Temp Partition',
    values: {
      coreType: 'plywood', wallLength: 2400, wallHeight: 2700, sides: '1 Side',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Cream',
      studSpacing: '600', studDepth: '64', showInsulation: false, showBridging: false,
    },
  },
  {
    label: 'HardieFlex Exterior',
    values: {
      coreType: 'cement-board', wallLength: 4000, wallHeight: 3000, sides: 'Both Sides',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Warm Beige',
      studSpacing: '600', studDepth: '92', showInsulation: false, showBridging: false,
    },
  },
  {
    label: 'Brick Feature Wall',
    values: {
      coreType: 'brick', wallLength: 3000, wallHeight: 3000, sides: '1 Side',
      showPlaster: true, showSkimCoat: true, showPrimer: true, showPaint: true, paintColor: 'Sage Green',
    },
  },
  {
    label: 'Concrete Basement',
    values: {
      coreType: 'solid-concrete', wallLength: 5000, wallHeight: 3000, sides: 'Both Sides',
      showPlaster: true, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
    },
  },
  {
    label: 'Quick Repaint',
    values: {
      coreType: 'existing-wall', wallLength: 4000, wallHeight: 3000, sides: '1 Side',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Sky Blue',
    },
  },
  // ── New structural presets ──
  {
    label: 'CHB with Reinforcement',
    values: {
      coreType: 'chb', wallLength: 5000, wallHeight: 3000, sides: 'Both Sides',
      showPlaster: true, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
      rebarSpacing: 800, rebarDiameter: '12', bondBeamInterval: 'Every 3rd course', chbSize: '150', showReinforcement: true,
    },
  },
  {
    label: 'Drywall with Framing',
    values: {
      coreType: 'drywall', wallLength: 4000, wallHeight: 2700, sides: 'Both Sides',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
      studSpacing: '600', studDepth: '92', gypsumThickness: '12.5', gypsumLayers: 'Single layer', showInsulation: true, showBridging: true,
    },
  },
  {
    label: 'Fire-Rated Corridor',
    values: {
      coreType: 'drywall', wallLength: 5000, wallHeight: 3000, sides: 'Both Sides',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Light Gray',
      studSpacing: '600', studDepth: '92', gypsumThickness: '15.9', gypsumLayers: 'Double layer', showInsulation: true, showBridging: true,
    },
  },
  {
    label: 'Bathroom Wall (6" studs)',
    values: {
      coreType: 'drywall', wallLength: 3000, wallHeight: 2700, sides: 'Both Sides',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
      studSpacing: '400', studDepth: '150', gypsumThickness: '15.9', gypsumLayers: 'Single layer', showInsulation: true, showBridging: false,
    },
  },
  {
    label: 'Budget Partition',
    values: {
      coreType: 'plywood', wallLength: 3000, wallHeight: 2700, sides: '1 Side',
      showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Cream',
      studSpacing: '600', studDepth: '64', showInsulation: false, showBridging: false,
    },
  },
]
