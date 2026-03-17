'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Model3D, ModelParameter, SpatialHotspot } from '@/components/3d/Workspace'
import { Workspace } from '@/components/3d/Workspace'
import { Loader2 } from 'lucide-react'
import type {
  ParametricSceneConfig,
  ExplodedAssemblyConfig,
  FloorPlanConfig,
  CutawaySectionConfig,
  AnimatedSequenceConfig,
} from '../_types/templates'

// ─── Legacy Scene Imports (SSR disabled) ───────────────────────────────────

const FARPlayground = dynamic(
  () => import('../_scenes/FARPlayground'),
  { ssr: false },
)

const ClassicalOrders = dynamic(
  () => import('../_scenes/ClassicalOrders'),
  { ssr: false },
)

const NBCPEnvelope = dynamic(
  () => import('../_scenes/NBCPEnvelope'),
  { ssr: false },
)

// ─── Template Components (dynamic, SSR disabled) ──────────────────────────

const ParametricScene = dynamic(
  () => import('../_templates/ParametricScene'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const ExplodedAssembly = dynamic(
  () => import('../_templates/ExplodedAssembly'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const FloorPlanWalkthrough = dynamic(
  () => import('../_templates/FloorPlanWalkthrough'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const CutawaySection = dynamic(
  () => import('../_templates/CutawaySection'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const AnimatedSequence = dynamic(
  () => import('../_templates/AnimatedSequence'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

// ─── Module Config Registry ────────────────────────────────────────────────

interface ModuleConfigEntry {
  template: 'parametric' | 'exploded' | 'floorplan' | 'cutaway' | 'animated'
  configImport: () => Promise<{ [key: string]: unknown }>
  /** The named export key in the module file */
  exportKey: string
}

const MODULE_CONFIGS: Record<string, ModuleConfigEntry> = {
  'stairway-configurator': {
    template: 'parametric',
    configImport: () => import('../_config/modules/stairway-configurator'),
    exportKey: 'stairwayConfigurator',
  },
  'fire-travel-distance': {
    template: 'floorplan',
    configImport: () => import('../_config/modules/fire-travel-distance'),
    exportKey: 'fireTravelDistanceConfig',
  },
  'ramp-accessible-toilet': {
    template: 'parametric',
    configImport: () => import('../_config/modules/ramp-accessible-toilet'),
    exportKey: 'rampAccessibleToiletConfig',
  },
  'classical-orders-comparison': {
    template: 'exploded',
    configImport: () => import('../_config/modules/classical-orders-comparison'),
    exportKey: 'classicalOrdersComparisonConfig',
  },
  'structural-load-path': {
    template: 'animated',
    configImport: () => import('../_config/modules/structural-load-path'),
    exportKey: 'structuralLoadPathConfig',
  },
  'plumbing-fixture-cutaway': {
    template: 'cutaway',
    configImport: () => import('../_config/modules/plumbing-fixture-cutaway'),
    exportKey: 'plumbingFixtureCutaway',
  },
  'bahay-na-bato': {
    template: 'exploded',
    configImport: () => import('../_config/modules/bahay-na-bato'),
    exportKey: 'bahayNaBatoConfig',
  },
  'construction-sequence-foundation': {
    template: 'animated',
    configImport: () => import('../_config/modules/construction-sequence'),
    exportKey: 'constructionSequenceConfig',
  },
  // ── Phase 2: P11–P20 ───────────────────────────────────────────────────
  'nbcp-envelope': {
    template: 'parametric',
    configImport: () => import('../_config/modules/nbcp-envelope'),
    exportKey: 'nbcpEnvelopeConfig',
  },
  'ceiling-height-configurator': {
    template: 'parametric',
    configImport: () => import('../_config/modules/ceiling-height-configurator'),
    exportKey: 'ceilingHeightConfiguratorConfig',
  },
  'development-controls-pso': {
    template: 'parametric',
    configImport: () => import('../_config/modules/development-controls-pso'),
    exportKey: 'developmentControlsPsoConfig',
  },
  'occupant-load-calculator': {
    template: 'floorplan',
    configImport: () => import('../_config/modules/occupant-load-calculator'),
    exportKey: 'occupantLoadCalculatorConfig',
  },
  'wheelchair-maneuvering': {
    template: 'parametric',
    configImport: () => import('../_config/modules/wheelchair-maneuvering'),
    exportKey: 'wheelchairManeuveringConfig',
  },
  'construction-types-comparison': {
    template: 'exploded',
    configImport: () => import('../_config/modules/construction-types-comparison'),
    exportKey: 'constructionTypesComparisonConfig',
  },
  'chb-block-types': {
    template: 'exploded',
    configImport: () => import('../_config/modules/chb-block-types'),
    exportKey: 'chbBlockTypesConfig',
  },
  'pipe-slope-visualization': {
    template: 'cutaway',
    configImport: () => import('../_config/modules/pipe-slope-visualization'),
    exportKey: 'pipeSlopeVisualizationConfig',
  },
  'exit-door-mechanics': {
    template: 'animated',
    configImport: () => import('../_config/modules/exit-door-mechanics'),
    exportKey: 'exitDoorMechanicsConfig',
  },
  'seismic-parameter-map': {
    template: 'parametric',
    configImport: () => import('../_config/modules/seismic-parameter-map'),
    exportKey: 'seismicParameterMapConfig',
  },
  // ── Phase 3: All remaining modules ──────────────────────────────────────
  'accessible-bathing': { template: 'cutaway', configImport: () => import('../_config/modules/accessible-bathing'), exportKey: 'accessibleBathingConfig' },
  'accessible-corridor-widths': { template: 'parametric', configImport: () => import('../_config/modules/accessible-corridor-widths'), exportKey: 'accessibleCorridorWidthsConfig' },
  'accessible-counter-heights': { template: 'parametric', configImport: () => import('../_config/modules/accessible-counter-heights'), exportKey: 'accessibleCounterHeightsConfig' },
  'accessible-door-clearances': { template: 'parametric', configImport: () => import('../_config/modules/accessible-door-clearances'), exportKey: 'accessibleDoorClearancesConfig' },
  'accessible-elevator-cab': { template: 'parametric', configImport: () => import('../_config/modules/accessible-elevator-cab'), exportKey: 'accessibleElevatorCabConfig' },
  'accessible-parking': { template: 'floorplan', configImport: () => import('../_config/modules/accessible-parking'), exportKey: 'accessibleParkingConfig' },
  'accessible-signage': { template: 'parametric', configImport: () => import('../_config/modules/accessible-signage'), exportKey: 'accessibleSignageConfig' },
  'accessible-stair-handrails': { template: 'parametric', configImport: () => import('../_config/modules/accessible-stair-handrails'), exportKey: 'accessibleStairHandrailsConfig' },
  'accessible-toilet-detailed': { template: 'cutaway', configImport: () => import('../_config/modules/accessible-toilet-detailed'), exportKey: 'accessibleToiletDetailedConfig' },
  'air-changes-per-hour': { template: 'animated', configImport: () => import('../_config/modules/air-changes-per-hour'), exportKey: 'airChangesPerHourConfig' },
  'art-deco-manila': { template: 'cutaway', configImport: () => import('../_config/modules/art-deco-manila'), exportKey: 'artDecoManilaConfig' },
  'attic-requirements': { template: 'parametric', configImport: () => import('../_config/modules/attic-requirements'), exportKey: 'atticRequirementsConfig' },
  'backflow-prevention': { template: 'exploded', configImport: () => import('../_config/modules/backflow-prevention'), exportKey: 'backflowPreventionConfig' },
  'bahay-kubo': { template: 'exploded', configImport: () => import('../_config/modules/bahay-kubo'), exportKey: 'bahayKuboConfig' },
  'balcony-guardrail': { template: 'parametric', configImport: () => import('../_config/modules/balcony-guardrail'), exportKey: 'balconyGuardrailConfig' },
  'base-shear-calculator': { template: 'parametric', configImport: () => import('../_config/modules/base-shear-calculator'), exportKey: 'baseShearCalculatorConfig' },
  'beam-construction-sequence': { template: 'animated', configImport: () => import('../_config/modules/beam-construction-sequence'), exportKey: 'beamConstructionSequenceConfig' },
  'beam-stress-diagram': { template: 'parametric', configImport: () => import('../_config/modules/beam-stress-diagram'), exportKey: 'beamStressDiagramConfig' },
  'bond-pattern-comparison': { template: 'exploded', configImport: () => import('../_config/modules/bond-pattern-comparison'), exportKey: 'bondPatternComparisonConfig' },
  'building-height-limits': { template: 'parametric', configImport: () => import('../_config/modules/building-height-limits'), exportKey: 'buildingHeightLimitsConfig' },
  'building-sewer-minimum': { template: 'cutaway', configImport: () => import('../_config/modules/building-sewer-minimum'), exportKey: 'buildingSewerMinimumConfig' },
  'building-typology-commercial': { template: 'parametric', configImport: () => import('../_config/modules/building-typology-commercial'), exportKey: 'buildingTypologyCommercialConfig' },
  'building-typology-institutional': { template: 'parametric', configImport: () => import('../_config/modules/building-typology-institutional'), exportKey: 'buildingTypologyInstitutionalConfig' },
  'building-typology-residential': { template: 'parametric', configImport: () => import('../_config/modules/building-typology-residential'), exportKey: 'buildingTypologyResidentialConfig' },
  'byzantine-pendentive': { template: 'cutaway', configImport: () => import('../_config/modules/byzantine-pendentive'), exportKey: 'byzantinePendentiveConfig' },
  'carport-abutment-rules': { template: 'parametric', configImport: () => import('../_config/modules/carport-abutment-rules'), exportKey: 'carportAbutmentRulesConfig' },
  'chb-wall-construction': { template: 'animated', configImport: () => import('../_config/modules/chb-wall-construction'), exportKey: 'chbWallConstructionConfig' },
  'circuit-conductor-sizing': { template: 'cutaway', configImport: () => import('../_config/modules/circuit-conductor-sizing'), exportKey: 'circuitConductorSizingConfig' },
  'clup-zoning-overlay': { template: 'floorplan', configImport: () => import('../_config/modules/clup-zoning-overlay'), exportKey: 'clupZoningOverlayConfig' },
  'colossal-order': { template: 'exploded', configImport: () => import('../_config/modules/colossal-order'), exportKey: 'colossalOrderConfig' },
  'column-construction-sequence': { template: 'animated', configImport: () => import('../_config/modules/column-construction-sequence'), exportKey: 'columnConstructionSequenceConfig' },
  'column-interaction-diagram': { template: 'parametric', configImport: () => import('../_config/modules/column-interaction-diagram'), exportKey: 'columnInteractionDiagramConfig' },
  'composite-order': { template: 'exploded', configImport: () => import('../_config/modules/composite-order'), exportKey: 'compositeOrderConfig' },
  'concrete-aggregate-visualizer': { template: 'parametric', configImport: () => import('../_config/modules/concrete-aggregate-visualizer'), exportKey: 'concreteAggregateVisualizerConfig' },
  'concrete-density-values': { template: 'parametric', configImport: () => import('../_config/modules/concrete-density-values'), exportKey: 'concreteDensityValuesConfig' },
  'concrete-mix-proportions': { template: 'parametric', configImport: () => import('../_config/modules/concrete-mix-proportions'), exportKey: 'concreteMixProportionsConfig' },
  'contemporary-parametric': { template: 'cutaway', configImport: () => import('../_config/modules/contemporary-parametric'), exportKey: 'contemporaryParametricConfig' },
  'contract-document-hierarchy': { template: 'exploded', configImport: () => import('../_config/modules/contract-document-hierarchy'), exportKey: 'contractDocumentHierarchyConfig' },
  'corinthian-order': { template: 'exploded', configImport: () => import('../_config/modules/corinthian-order'), exportKey: 'corinthianOrderConfig' },
  'corridor-width-calculator': { template: 'parametric', configImport: () => import('../_config/modules/corridor-width-calculator'), exportKey: 'corridorWidthCalculatorConfig' },
  'court-requirements': { template: 'parametric', configImport: () => import('../_config/modules/court-requirements'), exportKey: 'courtRequirementsConfig' },
  'cross-ventilation-analysis': { template: 'animated', configImport: () => import('../_config/modules/cross-ventilation-analysis'), exportKey: 'crossVentilationAnalysisConfig' },
  'csi-masterformat-explorer': { template: 'parametric', configImport: () => import('../_config/modules/csi-masterformat-explorer'), exportKey: 'csiMasterformatExplorerConfig' },
  'dead-live-load-toggles': { template: 'parametric', configImport: () => import('../_config/modules/dead-live-load-toggles'), exportKey: 'deadLiveLoadTogglesConfig' },
  'door-schedule-configurator': { template: 'parametric', configImport: () => import('../_config/modules/door-schedule-configurator'), exportKey: 'doorScheduleConfiguratorConfig' },
  'doric-order': { template: 'exploded', configImport: () => import('../_config/modules/doric-order'), exportKey: 'doricOrderConfig' },
  'drainage-system-cutaway': { template: 'cutaway', configImport: () => import('../_config/modules/drainage-system-cutaway'), exportKey: 'drainageSystemCutawayConfig' },
  'earthquake-baroque-church': { template: 'cutaway', configImport: () => import('../_config/modules/earthquake-baroque-church'), exportKey: 'earthquakeBaroqueChurchConfig' },
  'earthwork-volume': { template: 'parametric', configImport: () => import('../_config/modules/earthwork-volume'), exportKey: 'earthworkVolumeConfig' },
  'egyptian-post-lintel': { template: 'cutaway', configImport: () => import('../_config/modules/egyptian-post-lintel'), exportKey: 'egyptianPostLintelConfig' },
  'electrical-room-context': { template: 'parametric', configImport: () => import('../_config/modules/electrical-room-context'), exportKey: 'electricalRoomContextConfig' },
  'elevator-dimensions': { template: 'parametric', configImport: () => import('../_config/modules/elevator-dimensions'), exportKey: 'elevatorDimensionsConfig' },
  'elevator-hoistway': { template: 'cutaway', configImport: () => import('../_config/modules/elevator-hoistway'), exportKey: 'elevatorHoistwayConfig' },
  'emergency-lighting-layout': { template: 'floorplan', configImport: () => import('../_config/modules/emergency-lighting-layout'), exportKey: 'emergencyLightingLayoutConfig' },
  'emergency-power-system': { template: 'floorplan', configImport: () => import('../_config/modules/emergency-power-system'), exportKey: 'emergencyPowerSystemConfig' },
  'escalator-section': { template: 'cutaway', configImport: () => import('../_config/modules/escalator-section'), exportKey: 'escalatorSectionConfig' },
  'exit-width-calculator': { template: 'parametric', configImport: () => import('../_config/modules/exit-width-calculator'), exportKey: 'exitWidthCalculatorConfig' },
  'fault-line-setback': { template: 'floorplan', configImport: () => import('../_config/modules/fault-line-setback'), exportKey: 'faultLineSetbackConfig' },
  'fire-alarm-system': { template: 'floorplan', configImport: () => import('../_config/modules/fire-alarm-system'), exportKey: 'fireAlarmSystemConfig' },
  'fire-detection-layout': { template: 'floorplan', configImport: () => import('../_config/modules/fire-detection-layout'), exportKey: 'fireDetectionLayoutConfig' },
  'fire-door-ratings': { template: 'cutaway', configImport: () => import('../_config/modules/fire-door-ratings'), exportKey: 'fireDoorRatingsConfig' },
  'fire-exit-layout': { template: 'floorplan', configImport: () => import('../_config/modules/fire-exit-layout'), exportKey: 'fireExitLayoutConfig' },
  'fire-extinguisher-placement': { template: 'floorplan', configImport: () => import('../_config/modules/fire-extinguisher-placement'), exportKey: 'fireExtinguisherPlacementConfig' },
  'fire-resistance-ratings': { template: 'parametric', configImport: () => import('../_config/modules/fire-resistance-ratings'), exportKey: 'fireResistanceRatingsConfig' },
  'fire-suppression-overview': { template: 'cutaway', configImport: () => import('../_config/modules/fire-suppression-overview'), exportKey: 'fireSuppressionOverviewConfig' },
  'fire-zone-classification': { template: 'floorplan', configImport: () => import('../_config/modules/fire-zone-classification'), exportKey: 'fireZoneClassificationConfig' },
  'firewall-construction': { template: 'cutaway', configImport: () => import('../_config/modules/firewall-construction'), exportKey: 'firewallConstructionConfig' },
  'fixture-unit-values': { template: 'parametric', configImport: () => import('../_config/modules/fixture-unit-values'), exportKey: 'fixtureUnitValuesConfig' },
  'florence-cathedral-dome': { template: 'cutaway', configImport: () => import('../_config/modules/florence-cathedral-dome'), exportKey: 'florenceCathedralDomeConfig' },
  'formwork-assembly': { template: 'exploded', configImport: () => import('../_config/modules/formwork-assembly'), exportKey: 'formworkAssemblyConfig' },
  'foundation-types': { template: 'exploded', configImport: () => import('../_config/modules/foundation-types'), exportKey: 'foundationTypesConfig' },
  'garage-ventilation': { template: 'parametric', configImport: () => import('../_config/modules/garage-ventilation'), exportKey: 'garageVentilationConfig' },
  'gfci-protection-zones': { template: 'floorplan', configImport: () => import('../_config/modules/gfci-protection-zones'), exportKey: 'gfciProtectionZonesConfig' },
  'gothic-ribbed-vault': { template: 'exploded', configImport: () => import('../_config/modules/gothic-ribbed-vault'), exportKey: 'gothicRibbedVaultConfig' },
  'gothic-structural-system': { template: 'cutaway', configImport: () => import('../_config/modules/gothic-structural-system'), exportKey: 'gothicStructuralSystemConfig' },
  'grease-trap-detail': { template: 'cutaway', configImport: () => import('../_config/modules/grease-trap-detail'), exportKey: 'greaseTrapDetailConfig' },
  'greek-peristyle-temple': { template: 'exploded', configImport: () => import('../_config/modules/greek-peristyle-temple'), exportKey: 'greekPeristyleTempleConfig' },
  'grounding-system': { template: 'cutaway', configImport: () => import('../_config/modules/grounding-system'), exportKey: 'groundingSystemConfig' },
  'guggenheim-bilbao': { template: 'cutaway', configImport: () => import('../_config/modules/guggenheim-bilbao'), exportKey: 'guggenheimBilbaoConfig' },
  'hagia-sophia-section': { template: 'cutaway', configImport: () => import('../_config/modules/hagia-sophia-section'), exportKey: 'hagiaSophiaSectionConfig' },
  'handrail-requirements': { template: 'parametric', configImport: () => import('../_config/modules/handrail-requirements'), exportKey: 'handrailRequirementsConfig' },
  'horizontal-exit-design': { template: 'floorplan', configImport: () => import('../_config/modules/horizontal-exit-design'), exportKey: 'horizontalExitDesignConfig' },
  'hot-water-system': { template: 'cutaway', configImport: () => import('../_config/modules/hot-water-system'), exportKey: 'hotWaterSystemConfig' },
  'housing-open-space': { template: 'parametric', configImport: () => import('../_config/modules/housing-open-space'), exportKey: 'housingOpenSpaceConfig' },
  'hvac-duct-layout': { template: 'floorplan', configImport: () => import('../_config/modules/hvac-duct-layout'), exportKey: 'hvacDuctLayoutConfig' },
  'ifugao-house': { template: 'exploded', configImport: () => import('../_config/modules/ifugao-house'), exportKey: 'ifugaoHouseConfig' },
  'illumination-levels': { template: 'floorplan', configImport: () => import('../_config/modules/illumination-levels'), exportKey: 'illuminationLevelsConfig' },
  'ionic-order': { template: 'exploded', configImport: () => import('../_config/modules/ionic-order'), exportKey: 'ionicOrderConfig' },
  'ivatan-stone-house': { template: 'exploded', configImport: () => import('../_config/modules/ivatan-stone-house'), exportKey: 'ivatanStoneHouseConfig' },
  'light-ventilation-openings': { template: 'parametric', configImport: () => import('../_config/modules/light-ventilation-openings'), exportKey: 'lightVentilationOpeningsConfig' },
  'lighting-layout': { template: 'floorplan', configImport: () => import('../_config/modules/lighting-layout'), exportKey: 'lightingLayoutConfig' },
  'lintel-over-opening': { template: 'cutaway', configImport: () => import('../_config/modules/lintel-over-opening'), exportKey: 'lintelOverOpeningConfig' },
  'locsin-cultural-center': { template: 'cutaway', configImport: () => import('../_config/modules/locsin-cultural-center'), exportKey: 'locsinCulturalCenterConfig' },
  'lrfd-load-combinations': { template: 'animated', configImport: () => import('../_config/modules/lrfd-load-combinations'), exportKey: 'lrfdLoadCombinationsConfig' },
  'lumber-sizes': { template: 'exploded', configImport: () => import('../_config/modules/lumber-sizes'), exportKey: 'lumberSizesConfig' },
  'machine-room-layout': { template: 'floorplan', configImport: () => import('../_config/modules/machine-room-layout'), exportKey: 'machineRoomLayoutConfig' },
  'manila-cathedral-section': { template: 'cutaway', configImport: () => import('../_config/modules/manila-cathedral-section'), exportKey: 'manilaCathedralSectionConfig' },
  'mezzanine-clearances': { template: 'cutaway', configImport: () => import('../_config/modules/mezzanine-clearances'), exportKey: 'mezzanineClearancesConfig' },
  'mixed-occupancy-separator': { template: 'cutaway', configImport: () => import('../_config/modules/mixed-occupancy-separator'), exportKey: 'mixedOccupancySeparatorConfig' },
  'modernism-five-points': { template: 'exploded', configImport: () => import('../_config/modules/modernism-five-points'), exportKey: 'modernismFivePointsConfig' },
  'mortar-joint-types': { template: 'cutaway', configImport: () => import('../_config/modules/mortar-joint-types'), exportKey: 'mortarJointTypesConfig' },
  'mounting-heights': { template: 'parametric', configImport: () => import('../_config/modules/mounting-heights'), exportKey: 'mountingHeightsConfig' },
  'natural-ventilation-rules': { template: 'parametric', configImport: () => import('../_config/modules/natural-ventilation-rules'), exportKey: 'naturalVentilationRulesConfig' },
  'near-source-factors': { template: 'parametric', configImport: () => import('../_config/modules/near-source-factors'), exportKey: 'nearSourceFactorsConfig' },
  'notre-dame-section': { template: 'cutaway', configImport: () => import('../_config/modules/notre-dame-section'), exportKey: 'notreDameSectionConfig' },
  'occupancy-classification': { template: 'parametric', configImport: () => import('../_config/modules/occupancy-classification'), exportKey: 'occupancyClassificationConfig' },
  'open-space-requirements': { template: 'parametric', configImport: () => import('../_config/modules/open-space-requirements'), exportKey: 'openSpaceRequirementsConfig' },
  'outlet-spacing-room': { template: 'floorplan', configImport: () => import('../_config/modules/outlet-spacing-room'), exportKey: 'outletSpacingRoomConfig' },
  'panel-board-layout': { template: 'cutaway', configImport: () => import('../_config/modules/panel-board-layout'), exportKey: 'panelBoardLayoutConfig' },
  'pantheon-cutaway': { template: 'cutaway', configImport: () => import('../_config/modules/pantheon-cutaway'), exportKey: 'pantheonCutawayConfig' },
  'parking-layout': { template: 'floorplan', configImport: () => import('../_config/modules/parking-layout'), exportKey: 'parkingLayoutConfig' },
  'parking-slot-dimensions': { template: 'parametric', configImport: () => import('../_config/modules/parking-slot-dimensions'), exportKey: 'parkingSlotDimensionsConfig' },
  'pd957-vs-bp220-comparison': { template: 'floorplan', configImport: () => import('../_config/modules/pd957-vs-bp220-comparison'), exportKey: 'pd957VsBp220ComparisonConfig' },
  'plastering-layers': { template: 'cutaway', configImport: () => import('../_config/modules/plastering-layers'), exportKey: 'plasteringLayersConfig' },
  'project-delivery-methods': { template: 'animated', configImport: () => import('../_config/modules/project-delivery-methods'), exportKey: 'projectDeliveryMethodsConfig' },
  'quantity-takeoff-room': { template: 'parametric', configImport: () => import('../_config/modules/quantity-takeoff-room'), exportKey: 'quantityTakeoffRoomConfig' },
  'ramp-gradient-building': { template: 'parametric', configImport: () => import('../_config/modules/ramp-gradient-building'), exportKey: 'rampGradientBuildingConfig' },
  'ramp-tactile-warnings': { template: 'parametric', configImport: () => import('../_config/modules/ramp-tactile-warnings'), exportKey: 'rampTactileWarningsConfig' },
  'rc-cover-requirements': { template: 'cutaway', configImport: () => import('../_config/modules/rc-cover-requirements'), exportKey: 'rcCoverRequirementsConfig' },
  'rebar-catalog': { template: 'exploded', configImport: () => import('../_config/modules/rebar-catalog'), exportKey: 'rebarCatalogConfig' },
  'rebar-sizes-catalog': { template: 'exploded', configImport: () => import('../_config/modules/rebar-sizes-catalog'), exportKey: 'rebarSizesCatalogConfig' },
  'refrigeration-cycle': { template: 'animated', configImport: () => import('../_config/modules/refrigeration-cycle'), exportKey: 'refrigerationCycleConfig' },
  'refuge-area-design': { template: 'floorplan', configImport: () => import('../_config/modules/refuge-area-design'), exportKey: 'refugeAreaDesignConfig' },
  'renaissance-dome-construction': { template: 'cutaway', configImport: () => import('../_config/modules/renaissance-dome-construction'), exportKey: 'renaissanceDomeConstructionConfig' },
  'roman-arch-vault': { template: 'cutaway', configImport: () => import('../_config/modules/roman-arch-vault'), exportKey: 'romanArchVaultConfig' },
  'romanesque-barrel-vault': { template: 'cutaway', configImport: () => import('../_config/modules/romanesque-barrel-vault'), exportKey: 'romanesqueBarrelVaultConfig' },
  'roof-truss-fink': { template: 'exploded', configImport: () => import('../_config/modules/roof-truss-fink'), exportKey: 'roofTrussFinkConfig' },
  'roof-truss-howe': { template: 'exploded', configImport: () => import('../_config/modules/roof-truss-howe'), exportKey: 'roofTrussHoweConfig' },
  'roof-truss-king-post': { template: 'exploded', configImport: () => import('../_config/modules/roof-truss-king-post'), exportKey: 'roofTrussKingPostConfig' },
  'roof-truss-pratt': { template: 'exploded', configImport: () => import('../_config/modules/roof-truss-pratt'), exportKey: 'roofTrussPrattConfig' },
  'roof-truss-queen-post': { template: 'exploded', configImport: () => import('../_config/modules/roof-truss-queen-post'), exportKey: 'roofTrussQueenPostConfig' },
  'roof-truss-warren': { template: 'exploded', configImport: () => import('../_config/modules/roof-truss-warren'), exportKey: 'roofTrussWarrenConfig' },
  'room-size-minimums': { template: 'parametric', configImport: () => import('../_config/modules/room-size-minimums'), exportKey: 'roomSizeMinimumsConfig' },
  'san-agustin-church': { template: 'cutaway', configImport: () => import('../_config/modules/san-agustin-church'), exportKey: 'sanAgustinChurchConfig' },
  'seismic-zone-map': { template: 'parametric', configImport: () => import('../_config/modules/seismic-zone-map'), exportKey: 'seismicZoneMapConfig' },
  'septic-tank-design': { template: 'parametric', configImport: () => import('../_config/modules/septic-tank-design'), exportKey: 'septicTankDesignConfig' },
  'shoreline-setback': { template: 'floorplan', configImport: () => import('../_config/modules/shoreline-setback'), exportKey: 'shorelineSetbackConfig' },
  'site-circulation-analysis': { template: 'floorplan', configImport: () => import('../_config/modules/site-circulation-analysis'), exportKey: 'siteCirculationAnalysisConfig' },
  'skylight-requirements': { template: 'parametric', configImport: () => import('../_config/modules/skylight-requirements'), exportKey: 'skylightRequirementsConfig' },
  'slab-construction-sequence': { template: 'animated', configImport: () => import('../_config/modules/slab-construction-sequence'), exportKey: 'slabConstructionSequenceConfig' },
  'smoke-control-systems': { template: 'animated', configImport: () => import('../_config/modules/smoke-control-systems'), exportKey: 'smokeControlSystemsConfig' },
  'smoke-partition-requirements': { template: 'cutaway', configImport: () => import('../_config/modules/smoke-partition-requirements'), exportKey: 'smokePartitionRequirementsConfig' },
  'soil-profile-cutaway': { template: 'cutaway', configImport: () => import('../_config/modules/soil-profile-cutaway'), exportKey: 'soilProfileCutawayConfig' },
  'split-ac-cutaway': { template: 'cutaway', configImport: () => import('../_config/modules/split-ac-cutaway'), exportKey: 'splitAcCutawayConfig' },
  'sprinkler-layout': { template: 'floorplan', configImport: () => import('../_config/modules/sprinkler-layout'), exportKey: 'sprinklerLayoutConfig' },
  'stairwell-enclosure': { template: 'cutaway', configImport: () => import('../_config/modules/stairwell-enclosure'), exportKey: 'stairwellEnclosureConfig' },
  'standard-material-sheets': { template: 'exploded', configImport: () => import('../_config/modules/standard-material-sheets'), exportKey: 'standardMaterialSheetsConfig' },
  'standpipe-classes': { template: 'cutaway', configImport: () => import('../_config/modules/standpipe-classes'), exportKey: 'standpipeClassesConfig' },
  'steel-connections': { template: 'exploded', configImport: () => import('../_config/modules/steel-connections'), exportKey: 'steelConnectionsConfig' },
  'steel-sections-catalog': { template: 'exploded', configImport: () => import('../_config/modules/steel-sections-catalog'), exportKey: 'steelSectionsCatalogConfig' },
  'storm-drainage-system': { template: 'cutaway', configImport: () => import('../_config/modules/storm-drainage-system'), exportKey: 'stormDrainageSystemConfig' },
  'structural-systems-comparison': { template: 'parametric', configImport: () => import('../_config/modules/structural-systems-comparison'), exportKey: 'structuralSystemsComparisonConfig' },
  'subdivision-layout-bp220': { template: 'floorplan', configImport: () => import('../_config/modules/subdivision-layout-bp220'), exportKey: 'subdivisionLayoutBp220Config' },
  'subdivision-layout-pd957': { template: 'floorplan', configImport: () => import('../_config/modules/subdivision-layout-pd957'), exportKey: 'subdivisionLayoutPd957Config' },
  'superposition-demo': { template: 'animated', configImport: () => import('../_config/modules/superposition-demo'), exportKey: 'superpositionDemoConfig' },
  'tactile-block-types': { template: 'exploded', configImport: () => import('../_config/modules/tactile-block-types'), exportKey: 'tactileBlockTypesConfig' },
  'trap-seal-depth': { template: 'cutaway', configImport: () => import('../_config/modules/trap-seal-depth'), exportKey: 'trapSealDepthConfig' },
  'tuscan-order': { template: 'exploded', configImport: () => import('../_config/modules/tuscan-order'), exportKey: 'tuscanOrderConfig' },
  'vent-pipe-routing': { template: 'cutaway', configImport: () => import('../_config/modules/vent-pipe-routing'), exportKey: 'ventPipeRoutingConfig' },
  'vent-shaft-dimensions': { template: 'parametric', configImport: () => import('../_config/modules/vent-shaft-dimensions'), exportKey: 'ventShaftDimensionsConfig' },
  'vigan-heritage-house': { template: 'exploded', configImport: () => import('../_config/modules/vigan-heritage-house'), exportKey: 'viganHeritageHouseConfig' },
  'wall-section-assembly': { template: 'exploded', configImport: () => import('../_config/modules/wall-section-assembly'), exportKey: 'wallSectionAssemblyConfig' },
  'wall-types-comparison': { template: 'cutaway', configImport: () => import('../_config/modules/wall-types-comparison'), exportKey: 'wallTypesComparisonConfig' },
  'water-code-easements': { template: 'floorplan', configImport: () => import('../_config/modules/water-code-easements'), exportKey: 'waterCodeEasementsConfig' },
  'water-meter-assembly': { template: 'exploded', configImport: () => import('../_config/modules/water-meter-assembly'), exportKey: 'waterMeterAssemblyConfig' },
  'water-supply-riser': { template: 'cutaway', configImport: () => import('../_config/modules/water-supply-riser'), exportKey: 'waterSupplyRiserConfig' },
  'waterproofing-systems': { template: 'cutaway', configImport: () => import('../_config/modules/waterproofing-systems'), exportKey: 'waterproofingSystemsConfig' },
  'wind-load-analysis': { template: 'parametric', configImport: () => import('../_config/modules/wind-load-analysis'), exportKey: 'windLoadAnalysisConfig' },
  'zoning-setback-overlay': { template: 'floorplan', configImport: () => import('../_config/modules/zoning-setback-overlay'), exportKey: 'zoningSetbackOverlayConfig' },
}

// ─── Loading Spinner ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-[11px] text-muted-foreground">Loading module…</span>
    </div>
  )
}

// ─── Template Module Wrapper ───────────────────────────────────────────────

function TemplateModuleWrapper({ moduleId }: { moduleId: string }) {
  const entry = MODULE_CONFIGS[moduleId]
  const [config, setConfig] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    entry
      .configImport()
      .then((mod) => {
        if (!cancelled) {
          const cfg = (mod as Record<string, unknown>)[entry.exportKey] ?? Object.values(mod)[0]
          setConfig(cfg)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })
    return () => { cancelled = true }
  }, [moduleId])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        Failed to load module: {error}
      </div>
    )
  }

  if (!config) return <LoadingSpinner />

  switch (entry.template) {
    case 'parametric':
      return <ParametricScene config={config as ParametricSceneConfig} />
    case 'exploded':
      return <ExplodedAssembly config={config as ExplodedAssemblyConfig} />
    case 'floorplan':
      return <FloorPlanWalkthrough config={config as FloorPlanConfig} />
    case 'cutaway':
      return <CutawaySection config={config as CutawaySectionConfig} />
    case 'animated':
      return <AnimatedSequence config={config as AnimatedSequenceConfig} />
    default:
      return null
  }
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface LabViewportProps {
  modelId: string
  model: Model3D
  parameters: ModelParameter[]
  hotspots: SpatialHotspot[]
  userTier: string
}

// ─── Main Component ────────────────────────────────────────────────────────

/**
 * Routes a modelId to the correct scene implementation:
 * - Legacy scenes (far-calculator, nbcp-envelope, classical-orders) → hardcoded imports
 * - Template modules (stairway-configurator, etc.) → registry-driven dynamic loading
 * - All other modelIds → existing GLTF Workspace (backwards compatible)
 */
export function LabViewport({
  modelId,
  model,
  parameters,
  hotspots,
  userTier,
}: LabViewportProps) {
  // Legacy hardcoded scenes — must remain for backwards compatibility
  if (modelId === 'far-calculator') return <FARPlayground />
  if (modelId === 'classical-orders') return <ClassicalOrders />
  // nbcp-envelope now routes through template system (legacy scene preserved at _scenes/NBCPEnvelope)

  // Template-driven modules from registry
  if (modelId in MODULE_CONFIGS) {
    return <TemplateModuleWrapper moduleId={modelId} />
  }

  // Default: existing GLTF model viewer (unchanged)
  return (
    <Workspace
      model={model}
      parameters={parameters}
      hotspots={hotspots}
      userTier={userTier}
    />
  )
}
