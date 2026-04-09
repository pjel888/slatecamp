// .ai/docs/XX-3D-Modules/Site-Development-Controls/UI-Audit/site-dev-controls.blueprint.ts
// Populated from codebase scan — every value grounded in actual source files.
import type { ModuleBlueprint } from '@/types/module-blueprint'

export const siteDevControlsBlueprint: ModuleBlueprint = {
  schemaVersion: '1.0.0',

  // ===================================================================
  // MODULE IDENTITY
  // ===================================================================
  meta: {
    slug: 'site-development-controls',
    displayName: 'Site Development Controls',
    category: 'Building Code',
    routePath: '/dashboard/3d-lab/site-development-controls', // AUDIT: No dedicated route file found under src/app — module is rendered via feature import at src/features/3d-lab/DevControlsModule/index.tsx
    aleTaxonomy: [
      'PD 1096 IRR Rule VII — Classification by Use/Occupancy',
      'PD 1096 IRR Rule VIII — Types of Construction',
    ],
    codeReferences: [
      'PD 1096 IRR Rule VII, Sec. 701-709',
      'PD 1096 IRR Rule VIII, Sec. 801-811',
      'PD 1096 IRR Rule VIII, Table VIII.1 — Percentages of Site Occupancy',
      'PD 1096 IRR Rule VIII, Table VIII.2 — Residential Minimum Setbacks',
      'PD 1096 IRR Rule VIII, Table VIII.3 — Commercial/Industrial Setbacks by RROW',
      'PD 1096 IRR Rule VII, Table VII.2 — RROW-based Building Height Limit',
      'PD 1096 IRR Rule VII, Table VII.G.1 — FLAR by Zone',
      'PD 1096 IRR Rule VII, Table VII.G.2 — GFA to TGFA Multiplier',
    ],
    description:
      'Interactive 3D parametric sandbox for PD 1096 site development controls. Computes TLA, setbacks, AMBF (three-way check), TOSL/ISA/USA closure identity, FLAR, BHL, TGFA, and AMVB with real-time compliance feedback across 15 zoning classes.',
    status: 'production',
  },

  // ===================================================================
  // ZUSTAND STORE SHAPE
  // Source: src/features/3d-lab/DevControlsModule/stores/useDevControlsStore.ts (425 lines)
  // ===================================================================
  store: {
    storeName: 'useDevControlsStore',
    filePath: 'features/3d-lab/DevControlsModule/stores/useDevControlsStore.ts',
    fields: [
      // --- Raw Inputs ---
      { name: 'lot', type: 'LotParams', defaultValue: '{ width: 20, depth: 15, type: "interior" }', description: 'Lot dimensions and type (interior/corner/through). // GAP: No UI control for lot.type — hardcoded to "interior". LotType has 4 values: interior|corner|through|corner-through (src/lib/pd1096/types.ts:17). Corner/through lots affect setback computation.', computed: false },
      { name: 'zoning', type: 'ZoningParams', defaultValue: '{ zoneClass: "R-1", firewallActive: false, firewallSides: [] }', description: 'Zoning classification and firewall configuration', computed: false },
      { name: 'building', type: 'BuildingParams', defaultValue: '{ proposedFootprintWidth: 12, proposedFootprintDepth: 6, proposedStoreys: 2, floorHeight: 3.0 }', description: 'Proposed building dimensions', computed: false },
      { name: 'rrow', type: 'RROWParams', defaultValue: '{ width: 10 }', description: 'Road Right-of-Way width', computed: false },
      { name: 'flarOverride', type: 'number | undefined', defaultValue: 'undefined', description: 'Optional user-adjusted FLAR (overrides zone midpoint)', computed: false },
      { name: 'bhlOverride', type: 'number | undefined', defaultValue: 'undefined', description: 'Optional custom BHL storeys (local ordinance override)', computed: false },

      // --- Computed Output ---
      { name: 'result', type: 'DevControlsResult', defaultValue: 'computeResult(DEFAULT_LOT, DEFAULT_ZONING, DEFAULT_BUILDING, DEFAULT_RROW)', description: 'Complete computed site analysis including TLA, setbacks, AMBF, TOSL, ISA, USA, GFA, TGFA, BHL, compliance checks', computed: true, dependencies: ['lot', 'zoning', 'building', 'rrow', 'flarOverride', 'bhlOverride'] },

      // --- Mode ---
      { name: 'labMode', type: "LabMode ('sandbox' | 'exam')", defaultValue: '"sandbox"', description: 'Current lab interaction mode', computed: false },

      // --- ISA/USA Spatial Placement ---
      { name: 'isaPlacement', type: '{ x: number; z: number; w: number; d: number }', defaultValue: '{ x: 0, z: 0, w: 5, d: 5 }', description: 'ISA zone position and dimensions (user-draggable)', computed: false },
      { name: 'usaPlacement', type: '{ x: number; z: number; w: number; d: number }', defaultValue: '{ x: 0, z: 10, w: 5, d: 5 }', description: 'USA zone position and dimensions (user-draggable)', computed: false },

      // --- 3D Scene UI State ---
      { name: 'cameraPreset', type: 'CameraPreset', defaultValue: '"orbit"', description: 'Active camera preset (perspective/top/front/iso-ne/iso-nw/iso-se/iso-sw/orbit)', computed: false },
      { name: 'visibleLayers', type: 'Set<LayerKey>', defaultValue: "new Set(['setbacks','ambf','pso','bhl','flar','floors','tosl'])", description: 'Which 3D overlay layers are visible', computed: false },
      { name: 'activeHotspot', type: 'string | null', defaultValue: 'null', description: 'Currently hovered/selected scene hotspot ID', computed: false },
      { name: 'highlightedMetric', type: 'string | null', defaultValue: 'null', description: 'Metric currently highlighted in HUD/scene', computed: false },
      { name: 'showDimensions', type: 'boolean', defaultValue: 'false', description: 'Whether dimension annotation lines are shown', computed: false },
      { name: 'xrayMode', type: 'boolean', defaultValue: 'false', description: 'Transparent building for see-through to setback volumes', computed: false },
      { name: 'isDraggingZone', type: 'boolean', defaultValue: 'false', description: 'Locks camera when dragging ISA/USA zones', computed: false },
      { name: 'dpr', type: 'number', defaultValue: '1.5', description: 'Device pixel ratio for R3F canvas', computed: false },

      // --- R3F Bridge ---
      { name: 'invalidateFn', type: '(() => void) | null', defaultValue: 'null', description: 'R3F invalidate function for demand frameloop', computed: false },

      // --- Tour ---
      { name: 'tourStep', type: 'number | null', defaultValue: '0', description: 'Current tour step (0-5) or null if dismissed', computed: false },
    ],
  },

  // ===================================================================
  // LEFT SIDEBAR: CONTROL PANELS
  // Source: src/features/3d-lab/DevControlsModule/dashboard/InputPanel.tsx
  //         + splits/*.tsx, ProposedBuildingPanel.tsx, tabs/SettingsTab.tsx
  // ===================================================================
  sidebar: {
    width: '480px',
    tabs: [
      // ---------------------------------------------------------------
      // TAB 1: LOT (default)
      // ---------------------------------------------------------------
      {
        id: 'lot',
        label: 'Lot',
        icon: 'Ruler',
        default: true,
        sections: [
          // --- Zoning Classification ---
          {
            id: 'zoning-classification',
            title: 'Zoning Classification',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              {
                controlType: 'dropdown' as const,
                id: 'zoneClass',
                label: 'Zoning Classification',
                description: 'Sets Table VIII.1 development controls',
                storeBinding: 'zoning.zoneClass',
                defaultValue: 'R-1',
                options: [
                  { value: 'R-1', label: 'R-1 Low-Density Residential' },
                  { value: 'R-2-basic', label: 'R-2 Basic (Duplex/Rowhouse)' },
                  { value: 'R-2-max', label: 'R-2 Maximum (Apartment)' },
                  { value: 'R-3-basic', label: 'R-3 Basic Medium-Density Residential' },
                  { value: 'R-3-max', label: 'R-3 Maximum High-Density Residential' },
                  { value: 'R-4', label: 'R-4 High-Rise Condominium' },
                  { value: 'R-5', label: 'R-5 Very High-Density Residential' },
                  { value: 'Com-1', label: 'Com-1 Low-Intensity Commercial' },
                  { value: 'Com-2', label: 'Com-2 Medium-Intensity Commercial' },
                  { value: 'Com-3', label: 'Com-3 High-Intensity Commercial' },
                  { value: 'Ind-1', label: 'Ind-1 Light Industrial' },
                  { value: 'Ind-2', label: 'Ind-2 Medium Industrial' },
                  { value: 'Ind-3', label: 'Ind-3 Heavy Industrial' },
                  { value: 'Institutional', label: 'Institutional' },
                  { value: 'Cultural', label: 'Cultural' },
                ],
              },
            ],
          },
          // --- Lot Parameters ---
          {
            id: 'lot-parameters',
            title: 'Lot Parameters',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              { controlType: 'slider' as const, id: 'lotWidth', label: 'Lot Width', storeBinding: 'lot.width', min: 5, max: 100, step: 0.5, defaultValue: 20, unit: 'm', showInput: true },
              { controlType: 'slider' as const, id: 'lotDepth', label: 'Lot Depth', storeBinding: 'lot.depth', min: 5, max: 100, step: 0.5, defaultValue: 15, unit: 'm', showInput: true },
              { controlType: 'slider' as const, id: 'rrowWidth', label: 'RROW Width', storeBinding: 'rrow.width', min: 6, max: 40, step: 1, defaultValue: 10, unit: 'm', showInput: true },
            ],
          },
          // --- Table VIII.1 Reference (display-only, right column) ---
          {
            id: 'zone-table-ref',
            title: 'Table VIII.1 Reference',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'card',
            controls: [
              {
                controlType: 'display-group' as const,
                id: 'tableVIII1',
                label: 'Table VIII.1 Reference',
                fields: [
                  { label: 'PSO', sourceExpression: 'ZONING_TABLE[zoneClass].psoNoFirewall ?? "N/A (setback-only)"', format: 'percentage' },
                  { label: 'ISA', sourceExpression: 'ZONING_TABLE[zoneClass].isaPercent * 100 + "% of TLA"', format: 'percentage' },
                  { label: 'USA', sourceExpression: 'ZONING_TABLE[zoneClass].usaPercent * 100 + "% of TLA"', format: 'percentage' },
                  { label: 'TOSL', sourceExpression: 'ZONING_TABLE[zoneClass].toslPercent * 100 + "% of TLA"', format: 'percentage' },
                  { label: 'BHL', sourceExpression: 'ZONING_TABLE[zoneClass].bhlStoreys + "F / " + ZONING_TABLE[zoneClass].bhlMeters + "m"', format: 'text' },
                  { label: 'FLAR', sourceExpression: 'ZONING_TABLE[zoneClass].flarMin + "~" + ZONING_TABLE[zoneClass].flarMax', format: 'text' },
                ],
              },
            ],
          },
          // --- Lot Summary (display-only, right column) ---
          {
            id: 'lot-summary',
            title: 'Lot Summary',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'card',
            controls: [
              {
                controlType: 'display-group' as const,
                id: 'lotSummary',
                label: 'Lot Summary',
                fields: [
                  { label: 'Total Lot Area', sourceExpression: 'result.tla', unit: 'sqm', format: 'number' },
                  { label: 'Frontage', sourceExpression: 'lot.width', unit: 'm', format: 'number' },
                  { label: 'Lot Depth', sourceExpression: 'lot.depth', unit: 'm', format: 'number' },
                  { label: 'RROW', sourceExpression: 'rrow.width', unit: 'm', format: 'number' },
                ],
              },
            ],
          },
          // --- Presets ---
          {
            id: 'presets',
            title: 'Presets',
            collapsible: true,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              {
                controlType: 'custom' as const,
                id: 'presetSelector',
                label: 'Presets',
                componentName: 'PresetSelector',
                behavior: 'Renders 5 standard presets (R-1 Subdivision 300sqm, R-2 Rowhouse, C-1 Commercial, Narrow Lot Violation, Max Height Test) and 4 violation presets (Lot Encroachment, BHL Violation, Setback Breach, TGFA Overbuilt) as clickable cards. Each applies a complete parameter set via applyPreset(). Includes a Reset button.',
              },
            ],
          },
        ],
      },

      // ---------------------------------------------------------------
      // TAB 2: BUILD
      // ---------------------------------------------------------------
      {
        id: 'building',
        label: 'Build',
        icon: 'Building2',
        default: false,
        sections: [
          // --- FLAR Controls ---
          {
            id: 'flar-controls',
            title: 'Floor Area Ratio',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              { controlType: 'slider' as const, id: 'flarOverride', label: 'FLAR', description: 'Floor Area Ratio — ratio of building total GFA to TLA. PD 1096 IRR Rule VII, Sec. 705, Table VII.G.1', storeBinding: 'flarOverride', min: 0.50, max: 15.00, step: 0.05, defaultValue: 1.50, unit: '', showInput: true },
            ],
          },
          // --- FLAR Info (right column) ---
          {
            id: 'flar-info',
            title: null,
            collapsible: false,
            defaultCollapsed: false,
            variant: 'card',
            controls: [
              {
                controlType: 'display-group' as const,
                id: 'flarMetrics',
                label: 'FLAR Metrics',
                fields: [
                  { label: 'Current FLAR', sourceExpression: 'result.flar', format: 'number' },
                  { label: 'Zone Range', sourceExpression: 'lookupFLAR(zoning.zoneClass).min + "-" + lookupFLAR(zoning.zoneClass).max', format: 'text' },
                  { label: 'GFA', sourceExpression: 'result.gfa', unit: 'sqm', format: 'number' },
                  { label: 'TGFA (FLAR)', sourceExpression: 'result.tgfaByFlar', unit: 'sqm', format: 'number' },
                  { label: 'TGFA (BHL)', sourceExpression: 'result.tgfaByBhl', unit: 'sqm', format: 'number' },
                  { label: 'Governing TGFA', sourceExpression: 'result.tgfa', unit: 'sqm', format: 'number' },
                ],
              },
            ],
          },
          // --- BHL Controls ---
          {
            id: 'bhl-controls',
            title: 'Building Height Limit',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              { controlType: 'slider' as const, id: 'bhlOverride', label: 'BHL', description: 'Building Height Limit in storeys. Computed as min(zoning BHL, RROW BHL). PD 1096 IRR Rule VIII, Sec. 805, Table VIII.3', storeBinding: 'bhlOverride', min: 1, max: 50, step: 1, defaultValue: 3, unit: 'F', showInput: true },
            ],
          },
          // --- BHL Info (right column) ---
          {
            id: 'bhl-info',
            title: null,
            collapsible: false,
            defaultCollapsed: false,
            variant: 'card',
            controls: [
              {
                controlType: 'display-group' as const,
                id: 'bhlMetrics',
                label: 'BHL Metrics',
                fields: [
                  { label: 'Zoning BHL', sourceExpression: 'getZoningEntry(zoning.zoneClass).bhlStoreys', unit: 'F', format: 'number' },
                  { label: 'RROW BHL', sourceExpression: 'lookupRrowBhl(rrow.width)', unit: 'F', format: 'number' },
                  { label: 'Governing BHL', sourceExpression: 'result.bhlStoreys', unit: 'F', format: 'number' },
                  { label: 'BHL Source', sourceExpression: 'result.bhlSource', format: 'text' },
                  { label: 'Height Limit', sourceExpression: 'result.bhlMeters', unit: 'm', format: 'number' },
                  { label: 'AMVB', sourceExpression: 'result.amvbInitial', unit: 'cu.m', format: 'number' },
                ],
              },
            ],
          },
          // --- Proposed Building ---
          {
            id: 'proposed-building',
            title: 'Proposed Building',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              { controlType: 'slider' as const, id: 'proposedFootprintWidth', label: 'Footprint Width', storeBinding: 'building.proposedFootprintWidth', min: 2, max: 80, step: 0.5, defaultValue: 12, unit: 'm', showInput: true },
              { controlType: 'slider' as const, id: 'proposedFootprintDepth', label: 'Footprint Depth', storeBinding: 'building.proposedFootprintDepth', min: 2, max: 80, step: 0.5, defaultValue: 6, unit: 'm', showInput: true },
              { controlType: 'slider' as const, id: 'proposedStoreys', label: 'Number of Floors', storeBinding: 'building.proposedStoreys', min: 1, max: 50, step: 1, defaultValue: 2, unit: '', showInput: true, description: 'Warning shown when exceeding BHL storeys' },
              { controlType: 'slider' as const, id: 'floorHeight', label: 'Floor-to-Floor Height', storeBinding: 'building.floorHeight', min: 2.4, max: 6.0, step: 0.1, defaultValue: 3.0, unit: 'm', showInput: true, description: 'Warning shown below 2.7m habitable minimum' },
            ],
          },
          // --- Firewall Panel ---
          {
            id: 'firewall',
            title: 'Firewall',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              {
                controlType: 'custom' as const,
                id: 'firewallPanel',
                label: 'Firewall',
                componentName: 'FirewallPanel',
                behavior: 'Toggle firewall active/inactive + select which sides (front/rear/left/right) have firewalls. Allowed sides governed by zoning entry firewallAllowed array. Changes PSO lookup column in Table VIII.1.',
              },
            ],
          },
          // --- Setback Info (right column) ---
          {
            id: 'setback-info',
            title: 'Setbacks',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'card',
            controls: [
              {
                controlType: 'custom' as const,
                id: 'setbackInfoPanel',
                label: 'Setback Info',
                componentName: 'SetbackInfoPanel',
                behavior: 'Displays computed effective setbacks (front/rear/left/right) in meters. Shows base + incremental + firewall adjustments. Read-only.',
              },
            ],
          },
        ],
      },

      // ---------------------------------------------------------------
      // TAB 3: SETTINGS
      // ---------------------------------------------------------------
      {
        id: 'settings',
        label: 'Settings',
        icon: 'Settings',
        default: false,
        sections: [
          {
            id: 'display-settings',
            title: 'Display',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              { controlType: 'toggle' as const, id: 'showDimensions', label: 'Dimension labels', storeBinding: 'showDimensions', defaultValue: false },
              { controlType: 'toggle' as const, id: 'showRrowGrid', label: 'Road & ground grid', storeBinding: 'visibleLayers:rrow', defaultValue: true },
            ],
          },
          {
            id: 'export-settings',
            title: 'Export',
            collapsible: false,
            defaultCollapsed: false,
            variant: 'default',
            controls: [
              { controlType: 'button' as const, id: 'screenshotExport', label: 'Screenshot (.png)', variant: 'secondary', action: 'captureScreenshot' },
            ],
          },
        ],
      },
    ],
  },

  // ===================================================================
  // CENTER: 3D VIEWPORT
  // Source: src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx
  //         + canvas/constants.ts, canvas/layers/*.tsx
  // ===================================================================
  scene: {
    canvas: {
      camera: { position: [18, 14, 20], fov: 42, near: 0.1, far: 500 },
      shadows: false, // AUDIT: No shadow prop on Canvas — shadows not explicitly enabled
      dpr: [1, 1.5],
      frameloop: 'demand',
      background: '#F2F0EB', // SCENE.SKY_COLOR
      gl: {
        antialias: true,
        alpha: false,
        powerPreference: 'default',
        stencil: false,
        depth: true,
        toneMapping: 'ACESFilmicToneMapping',
        outputColorSpace: 'SRGBColorSpace',
      },
    },
    lighting: [
      // Source: canvas/SceneLighting.tsx — custom rig (NOT shared StudioLighting)
      { type: 'ambient', props: { intensity: 0.35 } },
      { type: 'directional', props: { position: [8, 10, 4], intensity: 1.2, color: '#FFF5E6' } }, // Key light — warm, upper-right
      { type: 'directional', props: { position: [-6, 8, -3], intensity: 0.4, color: '#E6EFFF' } }, // Fill light — cool, opposite side
      { type: 'hemisphere', props: { skyColor: '#E8F0FF', groundColor: '#D4CFC4', intensity: 0.2 } }, // Sky/ground tint
    ],
    environment: null, // No drei Environment component used
    ground: {
      type: 'plane',
      config: {
        component: 'LotGround',
        yPosition: 0.100, // GEOMETRY_Y.LOT_SURFACE
        color: '#cbd5e1', // COLOR.LOT_SURFACE
      },
    },
    controls: {
      type: 'orbit',
      config: {
        enablePan: true,
        minPolarAngle: 0.1,
        maxPolarAngle: 'Math.PI / 2 - 0.05',
        minDistance: 1,
        maxDistance: 500,
        enableDamping: false,
        disabledDuringDrag: true, // Camera disabled when isDraggingZone is true
      },
    },
    objects: [
      {
        id: 'lot-ground',
        semanticRole: 'Lot boundary ground plane',
        geometrySource: 'parametric',
        reactivity: 'Dimensions driven by lot.width and lot.depth. Repositions on lot change.',
        material: { type: 'MeshStandardMaterial', props: { color: '#cbd5e1' } },
        visibilityCondition: 'always',
      },
      {
        id: 'dev-controls-layers',
        semanticRole: 'Composite layer group: setback zones, AMBF footprint, PSO ghost, building massing, floor plates, TOSL overlay',
        geometrySource: 'parametric',
        reactivity: 'All sub-layers driven by result (setbacks, ambf, tosl, isa, usa) + visibleLayers set. Each sub-layer has independent visibility via LayerKey.',
        material: { type: 'various', props: { setbackColor: '#E74C3C', ambfColor: '#1B3FC4', toslColor: '#86efac', isaColor: '#F5A623', usaColor: '#4A7C59', buildingColor: '#a1a1aa' } },
        visibilityCondition: 'Sub-layers individually controlled by visibleLayers Set<LayerKey>',
      },
      {
        id: 'rrow-indicator',
        semanticRole: 'Road Right-of-Way zone at front of lot',
        geometrySource: 'parametric',
        reactivity: 'Width driven by rrow.width. Position aligned to lot front edge.',
        material: { type: 'MeshStandardMaterial', props: { color: '#6B7280' } },
        visibilityCondition: "visibleLayers.has('rrow')",
      },
      {
        id: 'firewall-markers',
        semanticRole: 'Visual markers indicating firewall positions on lot sides',
        geometrySource: 'parametric',
        reactivity: 'Driven by zoning.firewallActive and zoning.firewallSides array.',
        material: { type: 'MeshStandardMaterial', props: { color: '#FF6B35' } },
        visibilityCondition: "visibleLayers.has('firewall')",
      },
    ],
    overlays: [
      {
        id: 'dimension-lines',
        semanticRole: 'Annotation dimension lines showing lot/setback/building measurements',
        overlayType: 'dimension-line',
        reactivity: 'Re-rendered when lot, setbacks, or building dimensions change.',
        visibilityCondition: 'showDimensions === true',
      },
      {
        id: 'setback-zones',
        semanticRole: 'Translucent red overlay planes showing front/rear/side setback exclusion areas',
        overlayType: 'zone-fill',
        reactivity: 'Driven by result.setbacks.effective (front/rear/left/right). Color: #E74C3C at 15% opacity.',
        visibilityCondition: "visibleLayers.has('setbacks')",
      },
      {
        id: 'ambf-footprint',
        semanticRole: 'Buildable footprint indicator (binding AMBF envelope)',
        overlayType: 'zone-fill',
        reactivity: 'Driven by result.ambf, result.buildableWidth, result.buildableDepth. Color: #1B3FC4 at 18% opacity.',
        visibilityCondition: "visibleLayers.has('ambf')",
      },
      {
        id: 'tosl-overlay',
        semanticRole: 'Total Open Space within Lot overlay',
        overlayType: 'zone-fill',
        reactivity: 'Driven by result.tosl. Color: #86efac at 25% opacity.',
        visibilityCondition: "visibleLayers.has('tosl')",
      },
    ],
  },

  // ===================================================================
  // RIGHT SIDEBAR: COMPLIANCE / INFO PANELS
  // Source: src/features/3d-lab/DevControlsModule/dashboard/OutputPanel.tsx
  // ===================================================================
  infoPanel: {
    width: '300px',
    collapsible: true, // Panel collapse via right handle
    sections: [
      {
        id: 'compliance-summary',
        title: 'Compliance Status',
        collapsible: false,
        defaultCollapsed: false,
        contentType: 'status-bar',
        content: 'Shows overall PASS/VIOLATION badge, "X of Y checks pass" count, and a green/red progress bar. Red left-border accent when violations exist.',
        dependencies: ['result.checks', 'result.overallCompliant'],
      },
      {
        id: 'ambf-three-way',
        title: 'AMBF Three-Way Check',
        collapsible: true,
        defaultCollapsed: false,
        contentType: 'computation-display',
        content: 'Shows three AMBF computation methods side-by-side: (1) By Setback with formula (W-L-R)(D-F-Rear), tagged "GOVERNS" when binding; (2) By PSO with formula PSO% x TLA; (3) By TOSL with formula (1-TOSL%) x TLA. Displays binding AMBF = min(setback, PSO) with percentage of TLA.',
        dependencies: ['result.ambfCandidates', 'result.ambf', 'result.tla'],
      },
      {
        id: 'closure-identity',
        title: 'Area Closure Identity',
        collapsible: true,
        defaultCollapsed: false,
        contentType: 'stacked-bar',
        content: 'Horizontal stacked bar visualization: AMBF (dark) + ISA (blue/amber) + USA (green) = TLA. Shows numeric values and validates TLA = AMBF + ISA + USA closure identity.',
        dependencies: ['result.ambf', 'result.isa', 'result.usa', 'result.tla', 'result.closureIdentityValid'],
      },
      {
        id: 'detailed-scorecard',
        title: 'Detailed Scorecard',
        collapsible: true,
        defaultCollapsed: true,
        contentType: 'scorecard',
        content: 'Grid of 9 pass/fail compliance checks: AMBF, TOSL, ISA, USA, BHL, TGFA, AMVB, Floor Height, Area Identity. Each shows required vs actual with pass/fail icon. Compact grid (CompactScorecardGrid) always visible below.',
        dependencies: ['result.checks'],
      },
      {
        id: 'code-reference',
        title: 'Code Reference',
        collapsible: true,
        defaultCollapsed: true,
        contentType: 'code-reference',
        content: 'PD 1096 Rules VII & VIII -- Site Development Controls. 2004 Revised IRR (DPWH, April 2005). Rule VII Sections 701-709. Rule VIII Sections 801-811. Table VIII.1 -- Percentages of Site Occupancy.',
        dependencies: [],
      },
    ],
  },

  // ===================================================================
  // BOTTOM HUD
  // Source: src/features/3d-lab/DevControlsModule/dashboard/KpiBar.tsx
  // ===================================================================
  hud: {
    position: 'bottom-center',
    metrics: [
      { id: 'tla', label: 'TLA', sourceExpression: 'result.tla.toFixed(0)', unit: 'sqm', format: 'number' },
      { id: 'ambf', label: 'AMBF', sourceExpression: 'result.ambf.toFixed(0)', unit: 'sqm', format: 'number', highlightCondition: '!result.overallCompliant' },
      { id: 'pso', label: 'PSO', sourceExpression: '(result.psoActual * 100).toFixed(1)', unit: '%', format: 'percentage' },
      { id: 'tosl', label: 'TOSL', sourceExpression: 'result.tosl.toFixed(0)', unit: 'sqm', format: 'number' },
      { id: 'bhl', label: 'BHL', sourceExpression: 'result.bhlStoreys + "F"', unit: '', format: 'floors' },
    ],
    extras: [
      {
        id: 'camera-presets',
        type: 'camera-presets',
        config: {
          buttons: [
            { value: 'perspective', label: 'Orbit' },
            { value: 'top', label: 'Plan' },
            { value: 'front', label: 'Front' },
            { value: 'iso-cycle', label: 'Iso', behavior: 'Cycles through iso-ne/iso-nw/iso-se/iso-sw on repeated clicks' },
          ],
        },
      },
      {
        id: 'dims-toggle',
        type: 'view-toggles',
        config: { label: 'Dims', storeBinding: 'showDimensions' },
      },
    ],
  },

  // ===================================================================
  // GUIDED TOUR
  // Source: src/features/3d-lab/DevControlsModule/dashboard/TourOverlay.tsx
  // ===================================================================
  tour: {
    totalStops: 6,
    skippable: true,
    stops: [
      {
        step: 1,
        title: 'Read the Lot',
        narration: 'Start with the Total Lot Area (TLA). The lot boundary defines the full extent of your site — everything else is carved from this.',
        camera: { position: [18, 14, 20], lookAt: [10, 0, 7.5] }, // AUDIT: Tour does not set camera per step — uses current camera
        highlights: ['tla'],
        quiz: null,
      },
      {
        step: 2,
        title: 'Carve the Margins',
        narration: 'Setbacks create mandatory buffers from property lines. They differ by zoning class and RROW width. This is where you cannot build.',
        camera: { position: [18, 14, 20], lookAt: [10, 0, 7.5] },
        highlights: ['setbacks'],
        quiz: null,
      },
      {
        step: 3,
        title: 'Find the Footprint',
        narration: "The AMBF is the maximum area your building can occupy. It's the lesser of the setback-based envelope and the PSO-based limit.",
        camera: { position: [18, 14, 20], lookAt: [10, 0, 7.5] },
        highlights: ['ambf'],
        quiz: null,
      },
      {
        step: 4,
        title: 'Rise Within Limits',
        narration: "Building Height Limit (BHL) caps how tall you can go. It's governed by both zoning and road width. Your volume is AMBF x BHL.",
        camera: { position: [18, 14, 20], lookAt: [10, 0, 7.5] },
        highlights: ['bhl'],
        quiz: null,
      },
      {
        step: 5,
        title: 'Give Back the Ground',
        narration: 'Open space (TOSL) = TLA minus AMBF. It splits into ISA (paved) and USA (unpaved). The closure identity must hold: TLA = AMBF + ISA + USA.',
        camera: { position: [18, 14, 20], lookAt: [10, 0, 7.5] },
        highlights: ['tosl'],
        quiz: null,
      },
      {
        step: 6,
        title: 'Test Your Limits',
        narration: "You're in sandbox mode now. Adjust any parameter and watch how the site responds. Try triggering a violation — then fix it.",
        camera: { position: [18, 14, 20], lookAt: [10, 0, 7.5] },
        highlights: [],
        quiz: null,
      },
    ],
  },

  // ===================================================================
  // TOOLBAR
  // Source: src/features/3d-lab/DevControlsModule/dashboard/ViewportToolbar.tsx
  // ===================================================================
  toolbar: {
    position: 'top-left',
    items: [
      { id: 'grid', icon: 'Grid3x3', label: 'Grid', type: 'toggle', behavior: "Toggles 'rrow' layer visibility (road & ground grid)", storeBinding: "visibleLayers:rrow", shortcut: 'G' },
      { id: 'dimensions', icon: 'Ruler', label: 'Dimensions', type: 'toggle', behavior: 'Toggles dimension annotation lines on/off', storeBinding: 'showDimensions', shortcut: 'D' },
      { id: 'xray', icon: 'Eye', label: 'X-ray', type: 'toggle', behavior: 'Toggles transparent building mode for see-through to setback volumes', storeBinding: 'xrayMode', shortcut: 'X' },
      { id: 'layers', icon: 'Layers', label: 'Layers', type: 'toggle', behavior: 'Opens/closes LayersOverlay panel below toolbar for per-layer visibility control', shortcut: 'L' },
      // Separator
      { id: 'screenshot', icon: 'Camera', label: 'Screenshot', type: 'action', behavior: 'Captures canvas as PNG and triggers download (slatecamp-3dlab-screenshot.png)', shortcut: 'P' },
      { id: 'fullscreen', icon: 'Maximize2', label: 'Fullscreen', type: 'action', behavior: 'Toggles fullscreen mode on [data-viewport-wrapper] element', shortcut: 'F' },
    ],
  },

  // ===================================================================
  // COMPUTATION ENGINE
  // Source: src/lib/pd1096/computationEngine.ts (348 lines, 15-step sequence)
  //         src/lib/pd1096/computeSetbacks.ts
  //         src/lib/pd1096/zoningTables.ts
  // ===================================================================
  computations: [
    {
      functionName: 'computeDevControls',
      filePath: 'lib/pd1096/computationEngine.ts',
      inputs: [
        { name: 'lot', type: 'LotParams' },
        { name: 'zoning', type: 'ZoningParams' },
        { name: 'building', type: 'BuildingParams' },
        { name: 'rrow', type: 'RROWParams' },
        { name: 'flarOverride', type: 'number | undefined' },
        { name: 'bhlOverrideStoreys', type: 'number | undefined' },
      ],
      outputs: [
        { name: 'tla', type: 'number' },
        { name: 'setbacks', type: 'SetbackResult' },
        { name: 'ambfCandidates', type: 'AMBFCandidates' },
        { name: 'ambf', type: 'number' },
        { name: 'tosl', type: 'number' },
        { name: 'isa', type: 'number' },
        { name: 'usa', type: 'number' },
        { name: 'maca', type: 'number' },
        { name: 'gfa', type: 'number' },
        { name: 'tgfaByFlar', type: 'number' },
        { name: 'tgfaByBhl', type: 'number' },
        { name: 'tgfa', type: 'number' },
        { name: 'tgfaSource', type: "'flar' | 'bhl'" },
        { name: 'flar', type: 'number' },
        { name: 'proposedGFA', type: 'number' },
        { name: 'maxCompliantFloors', type: 'number' },
        { name: 'bhlMeters', type: 'number' },
        { name: 'bhlStoreys', type: 'number' },
        { name: 'bhlSource', type: "'zoning' | 'rrow' | 'custom'" },
        { name: 'proposedHeight', type: 'number' },
        { name: 'amvbInitial', type: 'number' },
        { name: 'amvbFinal', type: 'number' },
        { name: 'psoActual', type: 'number' },
        { name: 'psoAllowed', type: 'number' },
        { name: 'isaPercent', type: 'number' },
        { name: 'usaPercent', type: 'number' },
        { name: 'toslPercent', type: 'number' },
        { name: 'checks', type: 'ComplianceCheck[]' },
        { name: 'overallCompliant', type: 'boolean' },
        { name: 'closureIdentityValid', type: 'boolean' },
        { name: 'buildableWidth', type: 'number' },
        { name: 'buildableDepth', type: 'number' },
      ],
      description: '15-step canonical computation sequence from PD 1096 IRR Rules VII & VIII. Steps: 0-TLA, 1/2-Setbacks, 3-Buildable envelope, 4-AMBF candidates (three-way), 5-AMBF binding, 6-TOSL, 7-ISA, 8-USA, 9-MACA, 10-Closure identity, 11-GFA, 12-BHL, 13-AMVB, 14-Dual TGFA, 15-Compliance checks.',
      codeReference: 'PD 1096 IRR Rules VII & VIII',
      formula: 'TLA = W x D; AMBF = min(setback_envelope, PSO x TLA); TOSL = TLA - AMBF; ISA = min(ISA% x TLA, TOSL); USA = TLA - AMBF - ISA; GFA = TLA x FLAR; TGFA = min(GFA x multiplier, BHL x AMBF)',
    },
    {
      functionName: 'computeSetbacks',
      filePath: 'lib/pd1096/computeSetbacks.ts',
      inputs: [
        { name: 'zoning', type: 'ZoningParams' },
        { name: 'building', type: 'BuildingParams' },
        { name: 'rrow', type: 'RROWParams' },
      ],
      outputs: [
        { name: 'base', type: 'PerSideSetbacks' },
        { name: 'incremental', type: 'number' },
        { name: 'effective', type: 'PerSideSetbacks' },
        { name: 'note', type: 'string' },
      ],
      description: 'Computes base setbacks from Table VIII.2 (residential) or Table VIII.3 (commercial/industrial by RROW width), adds incremental setbacks per section 804.6 for buildings above 3 storeys, and zeroes setback sides with active firewalls.',
      codeReference: 'PD 1096 IRR Rule VII, Sec. 704 + Rule VIII, Sec. 804, Tables VIII.2/VIII.3',
      formula: 'effective[side] = base[side] + incremental - (firewallActive && firewallSides.includes(side) ? base[side] + incremental : 0)',
    },
    {
      functionName: 'getZoningEntry',
      filePath: 'lib/pd1096/zoningTables.ts',
      inputs: [{ name: 'zoneClass', type: 'ZoneClass' }],
      outputs: [{ name: 'entry', type: 'ZoningTableEntry' }],
      description: 'Looks up Table VIII.1 entry for a zone class. Returns PSO (with/without firewall), ISA%, USA%, TOSL%, BHL, FLAR range, TGFA multiplier.',
      codeReference: 'PD 1096 IRR Rule VIII, Table VIII.1',
    },
    {
      functionName: 'lookupRrowBhl',
      filePath: 'lib/pd1096/zoningTables.ts',
      inputs: [{ name: 'rrowWidth', type: 'number' }],
      outputs: [{ name: 'bhlStoreys', type: 'number' }],
      description: 'Looks up RROW-based building height limit from Table VII.2 bands: <8m=3F, 8-10m=5F, 10-12m=5F, 12-15m=12F, 15-20m=15F, 20-30m=18F, 30m+=36F.',
      codeReference: 'PD 1096 IRR Rule VII, Table VII.2',
    },
  ],

  // ===================================================================
  // CODE COMPLIANCE RULES
  // Source: computationEngine.ts STEP 15
  // ===================================================================
  compliance: [
    {
      id: 'ambf',
      label: 'Building Footprint (AMBF)',
      codeSection: 'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
      logic: 'proposedFootprint <= ambf (proposed footprint width x depth must not exceed AMBF)',
      dependencies: ['building.proposedFootprintWidth', 'building.proposedFootprintDepth', 'result.ambf'],
      violationVisualization: 'Red highlight on AMBF check in scorecard; violation banner appears',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'tosl',
      label: 'Open Space (TOSL)',
      codeSection: 'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1 (note d)',
      logic: '(TLA - proposedFootprint) >= TOSL (remaining open space after building must meet minimum)',
      dependencies: ['result.tla', 'result.tosl', 'building.proposedFootprintWidth', 'building.proposedFootprintDepth'],
      violationVisualization: 'Red highlight on TOSL check in scorecard',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'isa',
      label: 'Impervious Surface Area (ISA)',
      codeSection: 'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
      logic: 'ISA <= ISA% x TLA (impervious surface must not exceed percentage limit)',
      dependencies: ['result.isa', 'result.tla'],
      violationVisualization: 'Red highlight on ISA check in scorecard',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'usa',
      label: 'Unpaved Surface Area (USA)',
      codeSection: 'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
      logic: 'USA >= USA% x TLA (unpaved surface must meet minimum percentage)',
      dependencies: ['result.usa', 'result.tla'],
      violationVisualization: 'Red highlight on USA check in scorecard',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'bhl',
      label: 'Building Height (BHL)',
      codeSection: 'PD 1096 IRR Rule VII, Sec. 707, Table VII.2',
      logic: 'proposedStoreys <= governingBhlStoreys (proposed floors must not exceed BHL)',
      dependencies: ['building.proposedStoreys', 'result.bhlStoreys'],
      violationVisualization: 'Red highlight on BHL check; warning on floor slider',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'tgfa',
      label: 'Total Gross Floor Area (TGFA)',
      codeSection: 'PD 1096 IRR Rule VII, Sec. 705, Tables VII.G.1/VII.G.2',
      logic: 'proposedGFA <= TGFA (proposed total floor area must not exceed governing TGFA)',
      dependencies: ['result.proposedGFA', 'result.tgfa'],
      violationVisualization: 'Red highlight on TGFA check in scorecard',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'amvb',
      label: 'Building Volume (AMVB)',
      codeSection: 'PD 1096 IRR Rule VII Guidelines',
      logic: '(proposedFootprint x proposedHeight) <= AMVB',
      dependencies: ['building.proposedFootprintWidth', 'building.proposedFootprintDepth', 'building.proposedStoreys', 'building.floorHeight', 'result.amvbFinal'],
      violationVisualization: 'Red highlight on AMVB check in scorecard',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'floorHeight',
      label: 'Floor-to-Floor Height',
      codeSection: 'PD 1096 IRR Rule VIII, Sec. 805 -- Minimum ceiling height 2.70m',
      logic: 'floorHeight >= 2.70 (habitable minimum)',
      dependencies: ['building.floorHeight'],
      violationVisualization: 'Red highlight on floor height check; warning label on slider below 2.7m',
      passVisualization: 'Green check mark in scorecard',
    },
    {
      id: 'closure',
      label: 'Area Identity (TLA = AMBF+ISA+USA)',
      codeSection: 'PD 1096 IRR Rule VIII, Sec. 803 Note (d)',
      logic: 'abs((AMBF + ISA + USA) - TLA) <= 0.01 (closure identity within floating-point tolerance)',
      dependencies: ['result.ambf', 'result.isa', 'result.usa', 'result.tla'],
      violationVisualization: 'Red highlight on closure check — indicates computation error',
      passVisualization: 'Green check mark in scorecard',
    },
  ],

  // ===================================================================
  // LEARNING INTEGRATION
  // ===================================================================
  learning: {
    primaryObjective: 'Apply PD 1096 development controls to compute site area components, building envelope limits, and verify compliance for any zoning classification',
    bloomLevel: 3, // Apply
    keyValues: [
      'TLA = lot width x lot depth',
      'AMBF = min(setback_envelope, PSO x TLA)',
      'TLA = AMBF + ISA + USA (closure identity)',
      'TOSL = TLA - AMBF',
      'GFA = TLA x FLAR',
      'TGFA = min(GFA x multiplier, BHL_storeys x AMBF)',
      'AMVB = AMBF x BHL_meters',
      'R-1 setbacks: F=4.5m, S=2.0m, R=2.0m',
      'R-1: PSO not applicable (setback-only)',
      'BHL = min(zoning_BHL, RROW_BHL)',
      'Min floor height: 2.70m habitable',
    ],
    prerequisites: [
      'Basic understanding of lot/parcel terminology (TLA, frontage, depth)',
      'Knowledge of Philippine zoning classification system',
      'Understanding of setback concept (front, side, rear)',
    ],
    aleQuestionTypes: [
      'Compute AMBF given lot dimensions and zone class',
      'Determine governing BHL from zoning and RROW width',
      'Verify closure identity (TLA = AMBF + ISA + USA)',
      'Calculate maximum TGFA using dual-method approach',
      'Identify which constraint governs (setback vs PSO, FLAR vs BHL)',
    ],
    successCriteria: 'Student can independently compute all site development controls for any zoning class and verify the closure identity without assistance.',
    quizIntegration: [
      { type: 'in-situ', description: 'Tour stops focus on one concept at a time (TLA, setbacks, AMBF, BHL, TOSL, sandbox)' },
      // GAP: No dedicated post-exploration quiz integration found in module code
    ],
  },

  // ===================================================================
  // INTERACTION MAP (BINDINGS)
  // ===================================================================
  bindings: [
    {
      source: { type: 'dropdown', id: 'zoneClass' },
      storeField: 'zoning.zoneClass',
      effects: ['computeDevControls rerun', 'Table VIII.1 reference update', 'setbacks recalc', 'AMBF recalc', 'all compliance checks', 'HUD metrics', 'scene geometry'],
      description: 'Zone selector -> setZoneClass() -> resets flarOverride/bhlOverride -> recomputes entire result atomically -> all UI updates',
    },
    {
      source: { type: 'slider', id: 'lotWidth' },
      storeField: 'lot.width',
      effects: ['TLA recalc', 'setback envelope', 'AMBF', 'TOSL/ISA/USA', 'closure identity', 'compliance', 'scene lot ground', 'HUD TLA/AMBF/PSO/TOSL'],
      description: 'Lot width slider -> setLot({ width }) -> recompute + auto-reposition ISA/USA placements',
    },
    {
      source: { type: 'slider', id: 'lotDepth' },
      storeField: 'lot.depth',
      effects: ['TLA recalc', 'setback envelope', 'AMBF', 'TOSL/ISA/USA', 'closure identity', 'compliance', 'scene lot ground', 'HUD metrics'],
      description: 'Lot depth slider -> setLot({ depth }) -> recompute + auto-reposition ISA/USA placements',
    },
    {
      source: { type: 'slider', id: 'rrowWidth' },
      storeField: 'rrow.width',
      effects: ['RROW BHL lookup', 'commercial setback bands', 'governing BHL', 'TGFA by BHL', 'AMVB', 'compliance', 'RROW indicator geometry'],
      description: 'RROW width slider -> setRrowWidth() -> recompute (affects BHL and setbacks for commercial zones)',
    },
    {
      source: { type: 'slider', id: 'flarOverride' },
      storeField: 'flarOverride',
      effects: ['GFA recalc', 'TGFA by FLAR', 'governing TGFA', 'compliance TGFA check', 'max compliant floors'],
      description: 'FLAR slider -> setFlarOverride() -> recompute GFA and TGFA chain',
    },
    {
      source: { type: 'slider', id: 'bhlOverride' },
      storeField: 'bhlOverride',
      effects: ['governing BHL', 'BHL meters', 'TGFA by BHL', 'AMVB', 'compliance BHL+TGFA+AMVB', 'building height cap visualization'],
      description: 'BHL slider -> setBhlOverride() -> recompute BHL chain and volume limits',
    },
    {
      source: { type: 'slider', id: 'proposedFootprintWidth' },
      storeField: 'building.proposedFootprintWidth',
      effects: ['proposedGFA', 'compliance AMBF/TOSL/TGFA/AMVB checks', 'building massing geometry'],
      description: 'Footprint width slider -> setBuilding({ proposedFootprintWidth }) -> recompute proposed metrics + compliance',
    },
    {
      source: { type: 'slider', id: 'proposedFootprintDepth' },
      storeField: 'building.proposedFootprintDepth',
      effects: ['proposedGFA', 'compliance AMBF/TOSL/TGFA/AMVB checks', 'building massing geometry'],
      description: 'Footprint depth slider -> setBuilding({ proposedFootprintDepth }) -> recompute proposed metrics + compliance',
    },
    {
      source: { type: 'slider', id: 'proposedStoreys' },
      storeField: 'building.proposedStoreys',
      effects: ['proposedGFA', 'proposedHeight', 'compliance BHL/TGFA/AMVB checks', 'building massing height', 'floor plate count'],
      description: 'Floor count slider -> setBuilding({ proposedStoreys }) -> recompute height + GFA chain',
    },
    {
      source: { type: 'slider', id: 'floorHeight' },
      storeField: 'building.floorHeight',
      effects: ['proposedHeight', 'BHL meters', 'AMVB', 'compliance floorHeight/AMVB checks', 'building massing height'],
      description: 'Floor height slider -> setBuilding({ floorHeight }) -> recompute volumetric chain',
    },
    {
      source: { type: 'preset', id: 'presetSelector' },
      storeField: 'lot + zoning + building + rrow',
      effects: ['Full recompute of all parameters', 'All scene objects', 'All compliance checks', 'All HUD metrics'],
      description: 'Preset card click -> applyPreset() -> replaces all inputs atomically -> full recompute',
    },
  ],

  // ===================================================================
  // CAMERA PRESETS
  // Source: src/features/3d-lab/DevControlsModule/canvas/constants.ts
  // ===================================================================
  cameraPresets: [
    { id: 'perspective', label: 'Perspective', position: [18, 14, 20], lookAt: [10, 0, 7.5], transitionDuration: 0, orthographic: false },
    { id: 'orbit', label: 'Orbit', position: [18, 14, 20], lookAt: [10, 0, 7.5], transitionDuration: 0, orthographic: false },
    { id: 'top', label: 'Plan', position: [10, 50, 7.5], lookAt: [10, 0, 7.5], transitionDuration: 0, orthographic: true },
    { id: 'front', label: 'Front', position: [10, 8, 40], lookAt: [10, 4, 7.5], transitionDuration: 0, orthographic: true },
    { id: 'iso-ne', label: 'Iso NE', position: [35, 25, 30], lookAt: [10, 0, 7.5], transitionDuration: 0, orthographic: true },
    { id: 'iso-nw', label: 'Iso NW', position: [-15, 25, 30], lookAt: [10, 0, 7.5], transitionDuration: 0, orthographic: true },
    { id: 'iso-se', label: 'Iso SE', position: [35, 25, -15], lookAt: [10, 0, 7.5], transitionDuration: 0, orthographic: true },
    { id: 'iso-sw', label: 'Iso SW', position: [-15, 25, -15], lookAt: [10, 0, 7.5], transitionDuration: 0, orthographic: true },
  ],

  // ===================================================================
  // KEYBOARD SHORTCUTS
  // Source: src/features/3d-lab/DevControlsModule/hooks/useKeyboardShortcuts.ts
  // ===================================================================
  shortcuts: [
    { key: '[', action: 'toggleLeftPanel', description: 'Toggle left panel visibility' },
    { key: ']', action: 'toggleRightPanel', description: 'Toggle right panel visibility' },
    { key: 'm', modifier: 'ctrl', action: 'toggleBothPanels', description: 'Minimize/restore both panels' },
    { key: '1', action: 'setCameraPreset("perspective")', description: 'Switch to perspective camera' },
    { key: '2', action: 'setCameraPreset("top")', description: 'Switch to top/plan camera' },
    { key: '3', action: 'setCameraPreset("front")', description: 'Switch to front elevation camera' },
    { key: '4', action: 'cycleIso()', description: 'Cycle isometric views (NE -> NW -> SE -> SW)' },
    { key: 'd', action: 'toggleShowDimensions', description: 'Toggle dimension annotation lines' },
    { key: 'g', action: 'toggleLayer("rrow")', description: 'Toggle grid/road layer' },
    { key: 'x', action: 'toggleXrayMode', description: 'Toggle X-ray (transparent building) mode' },
    { key: 'l', action: 'toggleLayersOverlay', description: 'Toggle layers overlay panel' },
    { key: 'f', action: 'toggleFullscreen', description: 'Toggle fullscreen on viewport' },
    { key: 'p', action: 'captureScreenshot', description: 'Capture canvas as PNG download' },
  ],
}
