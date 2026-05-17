import type {
  AnnotationDef,
  GeometryInstruction,
  ParameterDef,
  ParametricSceneConfig,
  Preset,
} from '@/features/3d-lab/types/templates'
import {
  LIGHTING_FORMULA_SOURCE_ID,
  LIGHTING_LAMP_EFFICACY,
  LIGHTING_REVIEW_COLORS,
  computeLightingRoomState,
  lumensForLampWatts,
} from './lighting-computation'

const parameters: ParameterDef[] = [
  {
    key: 'lampType',
    label: 'Lamp type',
    type: 'dropdown',
    default: 'led',
    group: 'Light source',
    options: [
      { value: 'incandescent', label: `Incandescent (${LIGHTING_LAMP_EFFICACY.incandescent} lm/W)` },
      { value: 'fluorescent', label: `Fluorescent (${LIGHTING_LAMP_EFFICACY.fluorescent} lm/W)` },
      { value: 'led', label: `LED (${LIGHTING_LAMP_EFFICACY.led} lm/W)` },
    ],
  },
  {
    key: 'wattage',
    label: 'Fixture wattage',
    type: 'slider',
    min: 5,
    max: 300,
    step: 1,
    default: 48,
    unit: 'W',
    group: 'Light source',
  },
  {
    key: 'lumens',
    label: 'Delivered lumens',
    type: 'slider',
    min: 100,
    max: 18000,
    step: 50,
    default: lumensForLampWatts('led', 48),
    unit: 'lm',
    group: 'Light source',
  },
  {
    key: 'roomType',
    label: 'Room use',
    type: 'dropdown',
    default: 'office',
    group: 'Teaching target',
    options: [
      { value: 'office', label: 'Office work area' },
      { value: 'reading', label: 'Reading / study table' },
      { value: 'drafting', label: 'Drafting / detailed work' },
      { value: 'corridor', label: 'Corridor / circulation' },
      { value: 'custom', label: 'Custom teaching setup' },
    ],
  },
  {
    key: 'roomWidth',
    label: 'Room width',
    type: 'slider',
    min: 2,
    max: 8,
    step: 0.1,
    default: 4,
    unit: 'm',
    group: 'Room',
    decimals: 1,
  },
  {
    key: 'roomDepth',
    label: 'Room depth',
    type: 'slider',
    min: 2,
    max: 8,
    step: 0.1,
    default: 4,
    unit: 'm',
    group: 'Room',
    decimals: 1,
  },
  {
    key: 'mountingHeight',
    label: 'Mounting height',
    type: 'slider',
    min: 2.1,
    max: 3.6,
    step: 0.1,
    default: 2.7,
    unit: 'm',
    group: 'Fixture',
    decimals: 1,
  },
  {
    key: 'beamAngle',
    label: 'Beam angle',
    type: 'slider',
    min: 15,
    max: 120,
    step: 5,
    default: 90,
    unit: 'deg',
    group: 'Fixture',
  },
  {
    key: 'colorTemperature',
    label: 'Color temperature',
    type: 'slider',
    min: 2700,
    max: 6500,
    step: 100,
    default: 4000,
    unit: 'K',
    group: 'Fixture',
  },
  {
    key: 'showBeamCone',
    label: 'Show beam cone',
    type: 'toggle',
    default: true,
    group: 'Fixture',
  },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const state = computeLightingRoomState(params)
  const width = state.roomWidthM
  const depth = state.roomDepthM
  const height = state.mountingHeightM
  const wallThickness = 0.08
  const beamRadius = Math.min(state.beamDiameterM / 2, Math.max(width, depth) * 0.9)
  const targetColor = state.isBelowTeachingTarget ? LIGHTING_REVIEW_COLORS.review : LIGHTING_REVIEW_COLORS.ready
  const instructions: GeometryInstruction[] = [
    {
      id: 'floor-slab',
      type: 'box',
      position: [0, -0.03, 0],
      args: [width, 0.06, depth],
      color: '#d8d3c7',
    },
    {
      id: 'rear-wall',
      type: 'box',
      position: [0, height / 2, -depth / 2],
      args: [width, height, wallThickness],
      color: '#f1efe8',
    },
    {
      id: 'left-wall',
      type: 'box',
      position: [-width / 2, height / 2, 0],
      args: [wallThickness, height, depth],
      color: '#ece7dc',
    },
    {
      id: 'ceiling-plane',
      type: 'box',
      position: [0, height + 0.03, 0],
      args: [width, 0.06, depth],
      color: '#f8f5ef',
      opacity: 0.55,
      transparent: true,
    },
    {
      id: 'luminaire-body',
      type: 'cylinder',
      position: [0, height - 0.05, 0],
      args: [0.26, 0.26, 0.1, 36],
      color: '#1f2937',
    },
    {
      id: 'working-plane-target',
      type: 'box',
      position: [0, 0.01, 0],
      args: [width * 0.92, 0.01, depth * 0.92],
      color: targetColor,
      opacity: 0.14,
      transparent: true,
      material: 'basic',
      depthWrite: false,
      cameraFitExclude: true,
    },
  ]

  if (state.showBeamCone) {
    instructions.push({
      id: 'beam-spread',
      type: 'cone',
      position: [0, height / 2, 0],
      args: [beamRadius, height, 48, 1, 1],
      color: state.visualLightColor,
      opacity: 0.16,
      transparent: true,
      material: 'basic',
      depthWrite: false,
      cameraFitExclude: true,
    })
  }

  return instructions
}

const annotations: AnnotationDef[] = [
  {
    id: 'ann-average-lux',
    label: 'Average lux',
    description: 'Simplified teaching model: delivered lumens divided by room floor area.',
    codeCitation: `${LIGHTING_FORMULA_SOURCE_ID} - internal teaching formula`,
    position: (params) => {
      const state = computeLightingRoomState(params)
      return [-state.roomWidthM / 2 - 0.35, 1.15, 0]
    },
  },
  {
    id: 'ann-working-plane',
    label: 'Working plane',
    description: 'The floor overlay shows whether the current setup is at the selected teaching target; it is not a legal result.',
    codeCitation: 'Teaching overlay only',
    position: (params) => {
      const state = computeLightingRoomState(params)
      return [state.roomWidthM / 2 + 0.35, 0.12, state.roomDepthM / 2]
    },
  },
]

export const lightingRoomPresets: Preset[] = [
  {
    id: 'office-standard-led',
    label: 'Office LED target',
    values: {
      lampType: 'led',
      wattage: 48,
      lumens: 4800,
      roomType: 'office',
      roomWidth: 4,
      roomDepth: 4,
      mountingHeight: 2.7,
      beamAngle: 90,
      colorTemperature: 4000,
      showBeamCone: true,
    },
  },
  {
    id: 'drafting-studio',
    label: 'Drafting studio',
    values: {
      lampType: 'led',
      wattage: 120,
      lumens: 12000,
      roomType: 'drafting',
      roomWidth: 4,
      roomDepth: 4,
      mountingHeight: 2.7,
      beamAngle: 90,
      colorTemperature: 5000,
      showBeamCone: true,
    },
  },
  {
    id: 'incandescent-comparison',
    label: 'Incandescent comparison',
    values: {
      lampType: 'incandescent',
      wattage: 100,
      lumens: 1200,
      roomType: 'office',
      roomWidth: 4,
      roomDepth: 4,
      mountingHeight: 2.7,
      beamAngle: 120,
      colorTemperature: 2700,
      showBeamCone: true,
    },
  },
  {
    id: 'corridor-strip',
    label: 'Corridor strip',
    values: {
      lampType: 'fluorescent',
      wattage: 30,
      lumens: 1800,
      roomType: 'corridor',
      roomWidth: 2,
      roomDepth: 6,
      mountingHeight: 2.4,
      beamAngle: 120,
      colorTemperature: 4000,
      showBeamCone: true,
    },
  },
  {
    id: 'under-target-demo',
    label: 'Under target demo',
    values: {
      lampType: 'incandescent',
      wattage: 40,
      lumens: 480,
      roomType: 'office',
      roomWidth: 4,
      roomDepth: 4,
      mountingHeight: 2.7,
      beamAngle: 60,
      colorTemperature: 2700,
      showBeamCone: true,
    },
  },
]

export const lightingRoomSimulatorConfig: ParametricSceneConfig = {
  id: 'lighting-room-simulator',
  title: 'Lighting Room Simulator',
  description: 'A 3D teaching lab for seeing how lumens, wattage, mounting height, beam angle, color temperature, and room area change the lighting result.',
  subject: 'lighting-design',
  parameters,
  geometry,
  annotations,
  presets: lightingRoomPresets,
  camera: {
    position: [5.2, 3.8, 5.2],
    target: [0, 1.15, 0],
    fov: 38,
    zoomToFit: { position: [5.2, 3.8, 5.2], target: [0, 1.15, 0], fov: 38 },
    resetPreset: 'perspective',
    presets: {
      perspective: { position: [5.2, 3.8, 5.2], target: [0, 1.15, 0], fov: 38 },
      top: { position: [0, 7.8, 0.1], target: [0, 0, 0], fov: 35 },
      front: { position: [0, 1.9, 7], target: [0, 1.1, 0], fov: 38 },
      'iso-nw': { position: [-5.6, 4.2, 5.6], target: [0, 1.1, 0], fov: 38 },
    },
  },
  contextScenario: 'A small studio office needs enough visual task light without wasting energy. Adjust one variable at a time and watch how the room, beam spread, average lux, and LPD reference move together.',
  leaQuestionCount: 3,
  leaQuestionType: 'lighting calculation and visual reasoning',
  supportedPhases: ['guided', 'faded', 'sandbox'],
  hasChallengeMode: false,
  showHumanScale: false,
  alwaysShowAnnotations: false,
}
