// .ai/docs/XX-3D-Modules/Stairway-Configurator/UI-Audit/stairway-configurator.blueprint.ts
// Populated from codebase scan — every value grounded in actual source files.
// Source of truth: src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts
import type { ModuleBlueprint } from '@/types/module-blueprint'

export const stairwayConfiguratorBlueprint: ModuleBlueprint = {
  schemaVersion: '1.1.0',

  // ===================================================================
  // MODULE IDENTITY
  // Source: stairway-configurator.ts export (lines 1345–1366)
  // ===================================================================
  meta: {
    slug: 'stairway-configurator',
    displayName: 'Stairway Configurator',
    category: 'Vertical Circulation',
    routePath: '/dashboard/3d-lab/stairway-configurator',
    aleTaxonomy: [
      'PD 1096 IRR Rule VIII §804 — Stairways',
      'BP 220 IRR — Socialized/Economic Housing Stairs',
      'BP 344 IRR — Accessibility Requirements for Stairs',
      'RA 9514 IRR Rule 10 — Exit Stairways',
    ],
    codeReferences: [
      'PD 1096 IRR Rule VIII §804 — Stairways (max riser, min tread, headroom, width, handrail)',
      'BP 220 IRR · DHSUD — Socialized/Economic Housing (relaxed riser/tread/width)',
      'BP 344 IRR · DPWH — Accessibility (min 1200 mm width, dual handrails at 700+900 mm)',
      'RA 9514 IRR · BFP — Fire Code exit stairs (max 180 mm riser, min 900 mm width, max 3000 mm rise)',
      "Blondel, Cours d'Architecture (1675) — 2R+T comfort formula (600–650 mm)",
      'IBC 2024 §1011.5.4 — Dimensional uniformity (9.5 mm tolerance)',
      'ADA/ANSI A117.1 — Nosing projection, edge radius, handrail graspability',
    ],
    description:
      'Multi-law 3D stair compliance explorer — PD 1096, BP 220, BP 344, and RA 9514 evaluated in parallel with conflict detection.',
    status: 'beta',
  },

  // ===================================================================
  // ZUSTAND STORE SHAPE
  // Uses createModuleStore (parametric template store), NOT a custom store.
  // Store shape: { params: Record<string, number|boolean|string>, ... }
  // Source: ParametricSceneConfig pattern + stairway-configurator.ts parameters array
  // ===================================================================
  store: {
    storeName: 'createModuleStore',
    filePath: 'features/3d-lab/stores/createModuleStore.ts',
    fields: [
      // ── Project Classification ──
      { name: 'params.projectType', type: "string ('general_residential' | 'commercial' | 'school' | 'hospital' | 'bp220_socialized' | 'bp220_economic')", defaultValue: "'general_residential'", description: 'Project type — determines which law regime applies (PD 1096 base vs BP 220 housing)', computed: false },
      { name: 'params.isAccessibleRoute', type: 'boolean', defaultValue: 'false', description: 'Whether stair is part of an accessible route (activates BP 344 rules)', computed: false },
      { name: 'params.isExitStair', type: 'boolean', defaultValue: 'false', description: 'Whether stair is a required exit stair (activates RA 9514 rules)', computed: false },
      { name: 'params.isHighOccupancy', type: 'boolean', defaultValue: 'false', description: 'Whether occupant load > 50 (triggers wider PD 1096 width requirement)', computed: false },

      // ── Stair Geometry ──
      { name: 'params.stairType', type: "string ('straight' | 'l-shape' | 'u-shape')", defaultValue: "'straight'", description: 'Stair configuration type — straight run, L-shape quarter turn, or U-shape switchback', computed: false },
      { name: 'params.turnDirection', type: "string ('left' | 'right')", defaultValue: "'right'", description: 'Turn direction for L-shape stairs', computed: false },
      { name: 'params.risersBeforeTurn', type: 'number', defaultValue: '6', description: 'Number of risers before the landing turn (L/U-shape only)', computed: false },
      { name: 'params.stairWidth', type: 'number', defaultValue: '900', description: 'Clear width in mm (500–1500, step 25)', computed: false },
      { name: 'params.riserHeight', type: 'number', defaultValue: '185', description: 'Riser height in mm (100–300, step 5)', computed: false },
      { name: 'params.treadDepth', type: 'number', defaultValue: '250', description: 'Tread depth in mm (150–350, step 5)', computed: false },
      { name: 'params.headroom', type: 'number', defaultValue: '2100', description: 'Headroom clearance in mm (1800–2500, step 50)', computed: false },
      { name: 'params.handrailHeight', type: 'number', defaultValue: '900', description: 'Handrail height above nosing in mm (600–1200, step 25)', computed: false },
      { name: 'params.numRisers', type: 'number', defaultValue: '12', description: 'Number of risers in the flight (3–20, step 1)', computed: false },

      // ── Learning Overlays ──
      { name: 'params.showHistory', type: 'boolean', defaultValue: 'false', description: 'Show historical context annotations (Blondel, Templer, Cocoanut Grove)', computed: false },
      { name: 'params.toleranceMode', type: 'boolean', defaultValue: 'false', description: 'Activate construction tolerance mode — adds per-step riser variation', computed: false },
      { name: 'params.toleranceRange', type: 'number', defaultValue: '5', description: 'Tolerance range in mm (0–20, step 1) — maximum deviation per riser', computed: false },
      { name: 'params.compareMode', type: 'boolean', defaultValue: 'false', description: 'Show IBC ghost geometry overlay for international comparison', computed: false },

      // ── Nosing Detail ──
      { name: 'params.nosingProjection', type: 'number', defaultValue: '25', description: 'Nosing projection in mm (0–40, step 1)', computed: false },
      { name: 'params.nosingRadius', type: 'number', defaultValue: '10', description: 'Nosing edge radius in mm (0–20, step 1)', computed: false },
      { name: 'params.riserUndercut', type: 'number', defaultValue: '15', description: 'Riser undercut angle in degrees (0–45, step 1)', computed: false },
      { name: 'params.contrastStripWidth', type: 'number', defaultValue: '38', description: 'Contrast strip width in mm (0–60, step 1)', computed: false },
      { name: 'params.detailViewActive', type: 'boolean', defaultValue: 'false', description: 'Activate nosing detail view — dims all treads except midpoint, shows extruded profile', computed: false },

      // ── Handrail Detail ──
      { name: 'params.handrailDiameter', type: 'number', defaultValue: '35', description: 'Handrail grip diameter in mm (20–60, step 1)', computed: false },
      { name: 'params.wallClearance', type: 'number', defaultValue: '45', description: 'Wall clearance in mm (20–80, step 1)', computed: false },
      { name: 'params.handrailProfile', type: "string ('circular' | 'oval' | 'rectangular-rounded')", defaultValue: "'circular'", description: 'Handrail cross-section profile shape', computed: false },
      { name: 'params.handrailDetailActive', type: 'boolean', defaultValue: 'false', description: 'Activate handrail detail view — shows cross-section at midpoint', computed: false },

      // ── User Safety ──
      { name: 'params.primaryUsers', type: "string ('general' | 'children' | 'elderly' | 'mixed')", defaultValue: "'general'", description: 'Primary user group — children/mixed shows 711mm ghost handrail', computed: false },

      // ── Material ──
      { name: 'params.treadMaterial', type: "string ('polished-marble' | 'honed-granite' | 'ceramic-tile' | 'concrete' | 'wood' | 'steel')", defaultValue: "'concrete'", description: 'Tread material — affects PBR baseColor of tread geometry', computed: false },

      // ── Egress Calculator ──
      { name: 'params.floorArea', type: 'number', defaultValue: '300', description: 'Floor area in sqm (50–2000, step 10)', computed: false },
      { name: 'params.occupancyType', type: "string ('assembly' | 'business' | 'educational' | 'residential' | 'mercantile' | 'industrial')", defaultValue: "'business'", description: 'Occupancy type for egress load factor calculation', computed: false },
      { name: 'params.providedExits', type: 'number', defaultValue: '2', description: 'Number of exits provided (1–6, step 1)', computed: false },
      { name: 'params.isSprinklered', type: 'boolean', defaultValue: 'false', description: 'Whether building has sprinkler system (affects travel distance)', computed: false },
      { name: 'params.evacuationActive', type: 'boolean', defaultValue: 'false', description: 'Activate evacuation dot simulation along stair', computed: false },
    ],
  },

  // ===================================================================
  // LEFT SIDEBAR: CONTROL PANELS
  // Source: GenericControlPanel.tsx renders parameter groups as sections.
  // The stairway configurator has 9 parameter groups.
  // ===================================================================
  sidebar: {
    width: '320px',
    tabs: null, // Single panel — no tabs. GenericControlPanel renders all groups.
  },

  // ===================================================================
  // CENTER: 3D VIEWPORT
  // Source: stairway-configurator.ts camera config + geometry function
  // ===================================================================
  scene: {
    canvas: {
      camera: { position: [3, 3, 3], fov: 45 },
      shadows: true,
      dpr: [1, 1.5],
      frameloop: 'demand',
      background: '#f5f5f5',
    },
    lighting: [
      { type: 'ambient', props: { intensity: 0.5 } },
      { type: 'directional', props: { position: [5, 10, 5], intensity: 1.0, castShadow: true } },
    ],
    environment: null,
    ground: {
      type: 'grid',
      config: { size: 10, divisions: 10 },
    },
    controls: {
      type: 'orbit',
      config: { enableDamping: true, dampingFactor: 0.05 },
    },
    objects: [
      // ── Base platform ──
      {
        id: 'base-platform',
        semanticRole: 'Bottom landing platform',
        geometrySource: 'parametric',
        reactivity: 'Size driven by stairWidth and treadDepth. Fixed at y=0.',
        material: { type: 'meshStandard', props: { color: '#a1a1aa' } },
        visibilityCondition: 'always',
      },
      // ── Treads (N instances) ──
      {
        id: 'tread-[i]',
        semanticRole: 'Individual stair tread',
        geometrySource: 'parametric',
        reactivity: 'Position: y = cumulative riser heights, z = -(i * treadDepth). Size: stairWidth x TREAD_THICKNESS(30mm) x treadDepth. Color: treadColor (material baseColor) or violation color from resolveColor. In toleranceMode, each riser has per-step deviation.',
        material: { type: 'meshStandard', props: { color: 'materialColor or violation override' } },
        visibilityCondition: 'always',
      },
      // ── Risers (N instances) ──
      {
        id: 'riser-[i]',
        semanticRole: 'Individual stair riser face',
        geometrySource: 'parametric',
        reactivity: 'Position between consecutive treads. Color: riserColor (violation) or NEUTRAL_COLORS.RISER (#a1a1aa). In toleranceMode, risers at uniformity violation indices colored LAW_COLORS.PD_1096 (#4A7FAD).',
        material: { type: 'meshStandard', props: { color: '#a1a1aa or violation override' } },
        visibilityCondition: 'always',
      },
      // ── Primary handrails (2) ──
      {
        id: 'handrail-L/R',
        semanticRole: 'Primary handrails on left and right sides',
        geometrySource: 'parametric',
        reactivity: 'Cylinder along stair slope. Height driven by handrailHeight. Position offset by stairWidth/2 + STRINGER_THICKNESS(40mm)/2. Color: handrailColor (violation) or NEUTRAL_COLORS.HANDRAIL (#71717a).',
        material: { type: 'meshStandard', props: { color: '#71717a or violation override' } },
        visibilityCondition: 'always',
      },
      // ── Top landing ──
      {
        id: 'top-landing',
        semanticRole: 'Top landing platform',
        geometrySource: 'parametric',
        reactivity: 'Position at y = numRisers * riserHeight. Size same as base platform.',
        material: { type: 'meshStandard', props: { color: '#a1a1aa' } },
        visibilityCondition: 'always',
      },
      // ── Headroom clearance plane ──
      {
        id: 'headroom-plane',
        semanticRole: 'Transparent plane showing headroom clearance above nosing line',
        geometrySource: 'parametric',
        reactivity: 'Y position = midpoint riserHeight + headroom. Color: LAW_COLORS.PD_1096 (#4A7FAD) when headroom < 2000mm, else HEADROOM_PASS_COLOR (#dbeafe). Opacity: 0.3.',
        material: { type: 'meshStandard', props: { color: '#dbeafe', transparent: true, opacity: 0.3 } },
        visibilityCondition: 'always',
      },
      // ── BP 344 Ghost Handrails ──
      {
        id: 'bp344-rail-[height]-L/R',
        semanticRole: 'Accessibility ghost handrails at 900mm and 700mm (BP 344 dual-height requirement)',
        geometrySource: 'parametric',
        reactivity: 'Dual-height ghost cylinders along slope + 300mm horizontal extensions at top and bottom. Color: LAW_COLORS.BP_344 (#3498DB). Opacity: 0.4. Offset 30mm from main rail.',
        material: { type: 'meshStandard', props: { color: '#3498DB', transparent: true, opacity: 0.4 } },
        visibilityCondition: 'when isAccessibleRoute === true',
      },
      // ── Width deficit indicator planes ──
      {
        id: 'width-gap-L/R',
        semanticRole: 'Translucent planes showing the width deficit on each side',
        geometrySource: 'parametric',
        reactivity: 'Width = widthDeficit/2. Color = widthColor (most severe applicable law). Opacity: 0.15.',
        material: { type: 'meshStandard', props: { color: 'widthColor', transparent: true, opacity: 0.15 } },
        visibilityCondition: 'when widthColor is not null (stairWidth < strictestMinWidth)',
      },
      // ── IBC comparison ghost geometry ──
      {
        id: 'compare-ibc-tread/riser-[i]',
        semanticRole: 'Ghost stair at IBC 2024 dimensions (178mm riser, 279mm tread) for international comparison',
        geometrySource: 'parametric',
        reactivity: 'Overlaid ghost treads/risers at IBC dimensions. Color: #94a3b8. Opacity: 0.2.',
        material: { type: 'meshStandard', props: { color: '#94a3b8', transparent: true, opacity: 0.2 } },
        visibilityCondition: 'when compareMode === true',
      },
      // ── Nosing detail view ──
      {
        id: 'nosing-detail-[midIdx]',
        semanticRole: 'Extruded nosing profile at midpoint tread showing projection, radius, undercut, contrast strip',
        geometrySource: 'parametric',
        reactivity: 'Built by buildNosingProfile(). Non-selected treads dimmed to 0.3 opacity. Position at mid-step.',
        material: { type: 'meshStandard', props: {} },
        visibilityCondition: 'when detailViewActive === true',
      },
      // ── Handrail cross-section ──
      {
        id: 'handrail-cross-section',
        semanticRole: 'Extruded cross-section disc showing handrail grip profile',
        geometrySource: 'parametric',
        reactivity: 'Extruded circle at handrailDiameter/2 radius. 16 segments. Depth 50mm. Position at midpoint.',
        material: { type: 'meshStandard', props: {} },
        visibilityCondition: 'when handrailDetailActive === true',
      },
      // ── Children ghost handrail ──
      {
        id: 'children-rail-711-L/R',
        semanticRole: 'Ghost handrail at 711mm for children (ADA §504 Advisory)',
        geometrySource: 'parametric',
        reactivity: 'Cylinder along slope at 711mm height. 80% of main handrail radius. Color: #94a3b8. Opacity: 0.4.',
        material: { type: 'meshStandard', props: { color: '#94a3b8', transparent: true, opacity: 0.4 } },
        visibilityCondition: "when primaryUsers === 'children' or 'mixed'",
      },
      // ── Evacuation dots ──
      {
        id: 'evac-dot-[i]',
        semanticRole: 'Evacuation simulation dots representing occupant flow',
        geometrySource: 'parametric',
        reactivity: 'Sphere count = min(floor(occupantLoad/2), 200). Distributed along stair run. Color: #E74C3C if bottleneck (width < 900mm), else #3B82F6. Opacity: 0.7.',
        material: { type: 'meshStandard', props: { color: '#3B82F6', transparent: true, opacity: 0.7 } },
        visibilityCondition: 'when evacuationActive === true',
      },
    ],
    overlays: [
      {
        id: 'blondel-comfort-zone',
        semanticRole: 'Blondel 2R+T comfort annotation (600–650mm range)',
        overlayType: 'label',
        reactivity: 'Displayed at top of stair. Shows current 2R+T value and comfort status.',
        visibilityCondition: 'always (as annotation)',
      },
      {
        id: 'law-color-legend',
        semanticRole: 'Color legend showing which law is causing each violation',
        overlayType: 'label',
        reactivity: 'Shows active law colors: RA 9514 red (#E74C3C), BP 344 blue (#3498DB), PD 1096 slate (#4A7FAD), BP 220 amber (#F5A623), Pass green (#2ECC71)',
        visibilityCondition: 'when any violation is active',
      },
    ],
  },

  // ===================================================================
  // RIGHT SIDEBAR: COMPLIANCE / INFO PANELS
  // Source: ComplianceReportPanel.tsx renders violation results
  // ===================================================================
  infoPanel: {
    width: '360px',
    collapsible: true,
    sections: [
      {
        id: 'active-violations',
        title: 'Active Violations',
        collapsible: false,
        defaultCollapsed: false,
        contentType: 'scorecard',
        content: 'Lists all currently active violation rules grouped by law. Each violation shows: severity icon, message, code citation. Color-coded by law: RA 9514 (red), BP 344 (blue), PD 1096 (slate), BP 220 (amber).',
        dependencies: ['params.riserHeight', 'params.treadDepth', 'params.stairWidth', 'params.headroom', 'params.handrailHeight', 'params.numRisers', 'params.projectType', 'params.isAccessibleRoute', 'params.isExitStair', 'params.isHighOccupancy'],
      },
      {
        id: 'cross-law-conflicts',
        title: 'Cross-Law Conflicts',
        collapsible: true,
        defaultCollapsed: false,
        contentType: 'custom',
        content: 'Shows conflicts where one law passes but another fails on the same dimension (e.g., BP 220 allows 250mm riser but PD 1096 limits to 200mm). Formatted as warning badges with explanation.',
        dependencies: ['params.riserHeight', 'params.stairWidth', 'params.projectType', 'params.isExitStair'],
      },
      {
        id: 'blondel-comfort',
        title: 'Blondel Comfort',
        collapsible: true,
        defaultCollapsed: false,
        contentType: 'computation-display',
        content: 'Displays 2R+T value, R+T value, comfort status (comfortable/too-cramped/too-stretched), and pitch angle with classification (ramp-like/comfortable/steep/ladder-like).',
        dependencies: ['params.riserHeight', 'params.treadDepth'],
      },
      {
        id: 'geometry-metrics',
        title: 'Geometry Summary',
        collapsible: true,
        defaultCollapsed: true,
        contentType: 'computation-display',
        content: 'Shows totalRise, totalRun, stringerLength, pitchAngle, landingRequired flag.',
        dependencies: ['params.numRisers', 'params.riserHeight', 'params.treadDepth'],
      },
      {
        id: 'international-comparison',
        title: 'International Comparison',
        collapsible: true,
        defaultCollapsed: true,
        contentType: 'custom',
        content: 'Table comparing PH law limits vs IBC 2024, ADA/ANSI A117.1, and IRC for each dimension (riser, tread, headroom, handrail, width, vertical rise). All international values marked UNVERIFIED.',
        dependencies: ['params.riserHeight', 'params.treadDepth', 'params.headroom', 'params.handrailHeight', 'params.stairWidth', 'params.numRisers', 'params.projectType'],
      },
    ],
  },

  // ===================================================================
  // BOTTOM HUD
  // ===================================================================
  hud: {
    position: 'bottom-center',
    metrics: [
      { id: 'riser-value', label: 'Riser', sourceExpression: 'params.riserHeight', unit: 'mm', format: 'number', highlightCondition: 'riserColor !== null' },
      { id: 'tread-value', label: 'Tread', sourceExpression: 'params.treadDepth', unit: 'mm', format: 'number', highlightCondition: 'treadColor !== null' },
      { id: 'width-value', label: 'Width', sourceExpression: 'params.stairWidth', unit: 'mm', format: 'number', highlightCondition: 'widthColor !== null' },
      { id: 'blondel-value', label: '2R+T', sourceExpression: '2 * params.riserHeight + params.treadDepth', unit: 'mm', format: 'number', highlightCondition: 'twoRPlusT < 600 || twoRPlusT > 650' },
      { id: 'pitch-value', label: 'Pitch', sourceExpression: 'atan2(riserHeight, treadDepth) * (180/PI)', unit: 'deg', format: 'number' },
      { id: 'total-rise-value', label: 'Total Rise', sourceExpression: 'params.numRisers * params.riserHeight', unit: 'mm', format: 'number', highlightCondition: 'totalRise > applicable maxVerticalRise' },
    ],
    extras: [],
  },

  // ===================================================================
  // GUIDED TOUR
  // GAP: No tour stops defined in stairway-configurator.ts yet.
  // The config has supportedPhases: ['guided', 'faded', 'sandbox', 'challenge']
  // but no explicit tour stop data.
  // ===================================================================
  tour: {
    totalStops: 0, // GAP: Tour not yet implemented
    skippable: true,
    stops: [],
  },

  // ===================================================================
  // TOOLBAR
  // GAP: No explicit toolbar defined — uses GenericControlPanel defaults
  // ===================================================================
  toolbar: {
    position: 'top-right',
    items: [
      { id: 'toggle-history', icon: 'BookOpen', label: 'Historical Context', type: 'toggle', behavior: 'Toggles showHistory overlay annotations', storeBinding: 'params.showHistory' },
      { id: 'toggle-tolerance', icon: 'Ruler', label: 'Tolerance Mode', type: 'toggle', behavior: 'Toggles construction tolerance mode with per-step riser variation', storeBinding: 'params.toleranceMode' },
      { id: 'toggle-compare', icon: 'GitCompare', label: 'IBC Comparison', type: 'toggle', behavior: 'Toggles IBC ghost geometry overlay', storeBinding: 'params.compareMode' },
      { id: 'toggle-nosing', icon: 'ZoomIn', label: 'Nosing Detail', type: 'toggle', behavior: 'Activates nosing detail view at midpoint tread', storeBinding: 'params.detailViewActive' },
      { id: 'toggle-handrail-detail', icon: 'Circle', label: 'Handrail Detail', type: 'toggle', behavior: 'Shows handrail cross-section at midpoint', storeBinding: 'params.handrailDetailActive' },
      { id: 'toggle-evac', icon: 'Users', label: 'Evacuation Sim', type: 'toggle', behavior: 'Activates evacuation dot simulation', storeBinding: 'params.evacuationActive' },
    ],
  },

  // ===================================================================
  // COMPUTATIONS
  // Source: stairway-computation.ts — pure functions, ZERO Three.js imports
  // ===================================================================
  computations: [
    {
      functionName: 'computeStairState',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [{ name: 'params', type: 'StairParams (Record<string, number|boolean|string>)' }],
      outputs: [{ name: 'state', type: 'ComputedStairState' }],
      description: 'Main computation function. Transforms raw parameters into complete ComputedStairState including all compliance evaluations, resolved violation colors, tolerance variations, and international comparison deltas.',
    },
    {
      functionName: 'computeBlondelComfort',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'riserHeight', type: 'number (mm)' },
        { name: 'treadDepth', type: 'number (mm)' },
      ],
      outputs: [
        { name: 'twoRPlusT', type: 'number (mm)' },
        { name: 'rPlusT', type: 'number (mm)' },
        { name: 'comfortStatus', type: "ComfortZoneStatus ('comfortable' | 'too-cramped' | 'too-stretched')" },
      ],
      description: 'Blondel comfort formula: 2R+T should be 600–650mm for comfortable stairs.',
      codeReference: "Blondel, Cours d'Architecture (1675)",
      formula: '2R+T = 2 * riserHeight + treadDepth; comfortable when 600 <= 2R+T <= 650',
    },
    {
      functionName: 'computePitch',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'riserHeight', type: 'number (mm)' },
        { name: 'treadDepth', type: 'number (mm)' },
      ],
      outputs: [
        { name: 'pitchAngle', type: 'number (degrees)' },
        { name: 'pitchStatus', type: "PitchStatus ('ramp-like' | 'comfortable' | 'steep' | 'ladder-like')" },
      ],
      description: 'Pitch angle classification. <20deg = ramp-like, <=35deg = comfortable, <=42deg = steep, >42deg = ladder-like.',
      formula: 'pitchAngle = atan2(riserHeight, treadDepth) * (180/PI)',
    },
    {
      functionName: 'computeGeometryMetrics',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'numRisers', type: 'number' },
        { name: 'riserHeight', type: 'number (mm)' },
        { name: 'treadDepth', type: 'number (mm)' },
      ],
      outputs: [
        { name: 'totalRise', type: 'number (mm)' },
        { name: 'totalRun', type: 'number (mm)' },
        { name: 'stringerLength', type: 'number (mm)' },
      ],
      description: 'Computes totalRise, totalRun, and stringer length from riser count and dimensions.',
      formula: 'totalRise = N * R; totalRun = (N-1) * T; stringerLength = sqrt(totalRise^2 + totalRun^2)',
    },
    {
      functionName: 'computeStrictestMinWidth',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'isBP220', type: 'boolean' },
        { name: 'isHighOcc', type: 'boolean' },
        { name: 'isResidential', type: 'boolean' },
        { name: 'isAccessible', type: 'boolean' },
        { name: 'isExit', type: 'boolean' },
      ],
      outputs: [{ name: 'strictestMinWidth', type: 'number (mm)' }],
      description: 'Returns the maximum of all applicable minimum width requirements. BP 220: 600mm, PD 1096 residential: 750mm, PD 1096 commercial: 900mm, PD 1096 high-occ: 1100mm, BP 344 accessible: 1200mm, RA 9514 exit: 900mm.',
    },
    {
      functionName: 'computeRiserCompliance',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'riserHeight', type: 'number (mm)' },
        { name: 'isBP220', type: 'boolean' },
        { name: 'isExit', type: 'boolean' },
      ],
      outputs: [{ name: 'result', type: 'ComplianceResult (pd1096, bp220, bp344, ra9514, conflicts)' }],
      description: 'Evaluates riser height against all 4 laws. PD 1096: <=200mm. BP 220: <=250mm. RA 9514 (exit): <=180mm. Detects BP220-vs-PD1096 and RA9514-vs-PD1096 conflicts.',
    },
    {
      functionName: 'computeTreadCompliance',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'treadDepth', type: 'number (mm)' },
        { name: 'isBP220', type: 'boolean' },
        { name: 'isExit', type: 'boolean' },
      ],
      outputs: [{ name: 'result', type: 'ComplianceResult' }],
      description: 'Evaluates tread depth against applicable laws. PD 1096: >=200mm. BP 220: >=200mm. RA 9514 (exit): >=200mm.',
    },
    {
      functionName: 'computeWidthCompliance',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'width', type: 'number (mm)' },
        { name: 'isBP220', type: 'boolean' },
        { name: 'isAccessible', type: 'boolean' },
        { name: 'isExit', type: 'boolean' },
        { name: 'isHighOcc', type: 'boolean' },
        { name: 'isResidential', type: 'boolean' },
      ],
      outputs: [{ name: 'result', type: 'ComplianceResult' }],
      description: 'Evaluates stair width against all 4 laws with context-dependent PD 1096 thresholds.',
    },
    {
      functionName: 'computeHeadroomCompliance',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [{ name: 'headroom', type: 'number (mm)' }],
      outputs: [{ name: 'result', type: 'ComplianceResult' }],
      description: 'PD 1096 only: headroom >= 2000mm.',
    },
    {
      functionName: 'computeHandrailCompliance',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'handrailHeight', type: 'number (mm)' },
        { name: 'isBP220', type: 'boolean' },
        { name: 'isAccessible', type: 'boolean' },
      ],
      outputs: [{ name: 'result', type: 'ComplianceResult' }],
      description: 'PD 1096: 800–900mm range. BP 344 (accessible): must be exactly 900mm (lower rail at 700mm shown in 3D).',
    },
    {
      functionName: 'computeVerticalRiseCompliance',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'totalRise', type: 'number (mm)' },
        { name: 'isExit', type: 'boolean' },
      ],
      outputs: [{ name: 'result', type: 'ComplianceResult' }],
      description: 'PD 1096: max 3600mm between landings. RA 9514 (exit): max 3000mm between landings.',
    },
    {
      functionName: 'computeToleranceVariations',
      filePath: 'features/3d-lab/config/modules/08-vertical/stairway-computation.ts',
      inputs: [
        { name: 'numRisers', type: 'number' },
        { name: 'toleranceRange', type: 'number (mm)' },
        { name: 'seed', type: 'number (default 1337)' },
      ],
      outputs: [
        { name: 'perStepRiserVariations', type: 'number[] (mm deviations)' },
        { name: 'uniformityViolationIndices', type: 'number[] (step indices exceeding 9.5mm tolerance)' },
      ],
      description: 'Generates seeded random per-step riser height deviations. Flags steps where flight range > 9.5mm (IBC §1011.5.4 uniformity tolerance). Uses mulberry32 PRNG for deterministic output.',
    },
  ],

  // ===================================================================
  // COMPLIANCE RULES
  // Source: stairway-configurator.ts violations array (lines 814–1163)
  // 24 total rules across 4 laws + cross-law conflicts + comfort + detail
  // ===================================================================
  compliance: [
    // ─── PD 1096 — National Building Code (8 rules) ─────────────────────
    {
      id: 'pd1096-max-riser',
      label: 'PD 1096: Max Riser Height',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'riserHeight > 200mm AND projectType is NOT bp220_socialized/bp220_economic',
      dependencies: ['params.riserHeight', 'params.projectType'],
      violationVisualization: 'Risers colored LAW_COLORS.PD_1096 (#4A7FAD). Annotation badge at riser midpoint.',
      passVisualization: 'Risers at neutral color (#a1a1aa) or material color.',
      lawGroup: 'PD 1096',
      activationCondition: 'projectType is NOT bp220_socialized or bp220_economic',
    },
    {
      id: 'pd1096-min-tread',
      label: 'PD 1096: Min Tread Depth',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'treadDepth < 200mm AND NOT isBP220',
      dependencies: ['params.treadDepth', 'params.projectType'],
      violationVisualization: 'Treads colored LAW_COLORS.PD_1096 (#4A7FAD).',
      passVisualization: 'Treads at material color.',
      lawGroup: 'PD 1096',
      activationCondition: 'projectType is NOT bp220_socialized or bp220_economic',
    },
    {
      id: 'pd1096-min-headroom',
      label: 'PD 1096: Min Headroom',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'headroom < 2000mm (applies to ALL project types)',
      dependencies: ['params.headroom'],
      violationVisualization: 'Headroom plane colored LAW_COLORS.PD_1096 (#4A7FAD) instead of pass color (#dbeafe).',
      passVisualization: 'Headroom plane at light blue (#dbeafe), opacity 0.3.',
      lawGroup: 'PD 1096',
    },
    {
      id: 'pd1096-max-vertical',
      label: 'PD 1096: Max Vertical Rise',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'numRisers * riserHeight > 3600mm',
      dependencies: ['params.numRisers', 'params.riserHeight'],
      violationVisualization: 'Annotation badge at stair midpoint showing landing requirement.',
      passVisualization: 'No annotation.',
      lawGroup: 'PD 1096',
    },
    {
      id: 'pd1096-min-width-high-occ',
      label: 'PD 1096: Min Width (High Occupancy)',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'NOT isBP220 AND isHighOccupancy AND stairWidth < 1100mm',
      dependencies: ['params.stairWidth', 'params.projectType', 'params.isHighOccupancy'],
      violationVisualization: 'Width deficit indicator planes (LAW_COLORS.PD_1096, opacity 0.15) on both sides.',
      passVisualization: 'No width deficit planes.',
      lawGroup: 'PD 1096',
      activationCondition: 'isHighOccupancy === true AND NOT isBP220',
    },
    {
      id: 'pd1096-min-width-commercial',
      label: 'PD 1096: Min Width (Commercial)',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'NOT isBP220 AND NOT isHighOccupancy AND NOT isResidential AND stairWidth < 900mm',
      dependencies: ['params.stairWidth', 'params.projectType', 'params.isHighOccupancy'],
      violationVisualization: 'Width deficit indicator planes colored LAW_COLORS.PD_1096.',
      passVisualization: 'No width deficit planes.',
      lawGroup: 'PD 1096',
      activationCondition: 'NOT isHighOccupancy AND NOT isResidential AND NOT isBP220',
    },
    {
      id: 'pd1096-min-width-residential',
      label: 'PD 1096: Min Width (Residential)',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'NOT isBP220 AND NOT isHighOccupancy AND isResidential AND stairWidth < 750mm',
      dependencies: ['params.stairWidth', 'params.projectType', 'params.isHighOccupancy'],
      violationVisualization: 'Width deficit indicator planes colored LAW_COLORS.PD_1096.',
      passVisualization: 'No width deficit planes.',
      lawGroup: 'PD 1096',
      activationCondition: 'isResidential AND NOT isHighOccupancy AND NOT isBP220',
    },
    {
      id: 'pd1096-handrail-range',
      label: 'PD 1096: Handrail Height Range',
      codeSection: 'PD 1096 IRR Rule VIII §804',
      logic: 'NOT isBP220 AND (handrailHeight < 800mm OR handrailHeight > 900mm)',
      dependencies: ['params.handrailHeight', 'params.projectType'],
      violationVisualization: 'Handrails colored LAW_COLORS.PD_1096 (#4A7FAD).',
      passVisualization: 'Handrails at neutral color (#71717a).',
      lawGroup: 'PD 1096',
      activationCondition: 'NOT isBP220',
    },

    // ─── BP 220 — Socialized/Economic Housing (3 rules) ────────────────
    {
      id: 'bp220-max-riser',
      label: 'BP 220: Max Riser Height',
      codeSection: 'BP 220 IRR · DHSUD',
      logic: 'isBP220 AND riserHeight > 250mm',
      dependencies: ['params.riserHeight', 'params.projectType'],
      violationVisualization: 'Risers colored LAW_COLORS.BP_220 (#F5A623).',
      passVisualization: 'Risers at neutral color.',
      lawGroup: 'BP 220',
      activationCondition: "projectType === 'bp220_socialized' OR 'bp220_economic'",
      conflictsWith: ['pd1096-max-riser'],
    },
    {
      id: 'bp220-min-tread',
      label: 'BP 220: Min Tread Depth',
      codeSection: 'BP 220 IRR · DHSUD',
      logic: 'isBP220 AND treadDepth < 200mm',
      dependencies: ['params.treadDepth', 'params.projectType'],
      violationVisualization: 'Treads colored LAW_COLORS.BP_220 (#F5A623).',
      passVisualization: 'Treads at material color.',
      lawGroup: 'BP 220',
      activationCondition: "projectType === 'bp220_socialized' OR 'bp220_economic'",
    },
    {
      id: 'bp220-min-width',
      label: 'BP 220: Min Width',
      codeSection: 'BP 220 IRR · DHSUD',
      logic: 'isBP220 AND stairWidth < 600mm',
      dependencies: ['params.stairWidth', 'params.projectType'],
      violationVisualization: 'Width deficit planes colored LAW_COLORS.BP_220 (#F5A623).',
      passVisualization: 'No width deficit planes.',
      lawGroup: 'BP 220',
      activationCondition: "projectType === 'bp220_socialized' OR 'bp220_economic'",
      conflictsWith: ['pd1096-min-width-residential'],
    },

    // ─── BP 344 — Accessibility Law (2 rules) ──────────────────────────
    {
      id: 'bp344-min-width',
      label: 'BP 344: Min Accessible Width',
      codeSection: 'BP 344 IRR · DPWH',
      logic: 'isAccessibleRoute AND stairWidth < 1200mm',
      dependencies: ['params.stairWidth', 'params.isAccessibleRoute'],
      violationVisualization: 'Width deficit planes colored LAW_COLORS.BP_344 (#3498DB, opacity 0.15).',
      passVisualization: 'No width deficit planes. BP 344 ghost handrails shown at correct heights.',
      lawGroup: 'BP 344',
      activationCondition: 'isAccessibleRoute === true',
    },
    {
      id: 'bp344-handrail-upper',
      label: 'BP 344: Primary Handrail at 900mm',
      codeSection: 'BP 344 IRR · DPWH',
      logic: 'isAccessibleRoute AND handrailHeight !== 900mm',
      dependencies: ['params.handrailHeight', 'params.isAccessibleRoute'],
      violationVisualization: 'Annotation showing required 900mm height. Ghost rails still shown at correct position.',
      passVisualization: 'Primary handrail aligns with BP 344 ghost rail at 900mm.',
      lawGroup: 'BP 344',
      activationCondition: 'isAccessibleRoute === true',
    },

    // ─── RA 9514 — Fire Code (4 rules) ─────────────────────────────────
    {
      id: 'ra9514-max-riser',
      label: 'RA 9514: Max Exit Riser',
      codeSection: 'RA 9514 IRR · BFP',
      logic: 'isExitStair AND riserHeight > 180mm',
      dependencies: ['params.riserHeight', 'params.isExitStair'],
      violationVisualization: 'Risers colored LAW_COLORS.RA_9514 (#E74C3C) — highest severity, overrides all others.',
      passVisualization: 'Risers at neutral or material color.',
      lawGroup: 'RA 9514',
      activationCondition: 'isExitStair === true',
      conflictsWith: ['pd1096-max-riser'],
    },
    {
      id: 'ra9514-min-width',
      label: 'RA 9514: Min Exit Width',
      codeSection: 'RA 9514 IRR · BFP',
      logic: 'isExitStair AND stairWidth < 900mm',
      dependencies: ['params.stairWidth', 'params.isExitStair'],
      violationVisualization: 'Width deficit planes colored LAW_COLORS.RA_9514 (#E74C3C).',
      passVisualization: 'No width deficit planes.',
      lawGroup: 'RA 9514',
      activationCondition: 'isExitStair === true',
    },
    {
      id: 'ra9514-min-tread',
      label: 'RA 9514: Min Exit Tread',
      codeSection: 'RA 9514 IRR · BFP',
      logic: 'isExitStair AND treadDepth < 200mm',
      dependencies: ['params.treadDepth', 'params.isExitStair'],
      violationVisualization: 'Treads colored LAW_COLORS.RA_9514 (#E74C3C).',
      passVisualization: 'Treads at material color.',
      lawGroup: 'RA 9514',
      activationCondition: 'isExitStair === true',
    },
    {
      id: 'ra9514-max-vertical',
      label: 'RA 9514: Max Exit Vertical Rise',
      codeSection: 'RA 9514 IRR · BFP',
      logic: 'isExitStair AND numRisers * riserHeight > 3000mm',
      dependencies: ['params.numRisers', 'params.riserHeight', 'params.isExitStair'],
      violationVisualization: 'Annotation badge at stair midpoint showing landing requirement.',
      passVisualization: 'No annotation.',
      lawGroup: 'RA 9514',
      activationCondition: 'isExitStair === true',
    },

    // ─── Cross-Law Conflicts (3 rules, severity: warning) ──────────────
    {
      id: 'conflict-riser-bp220-vs-pd1096',
      label: 'Conflict: BP 220 vs PD 1096 Riser',
      codeSection: 'BP 220 vs PD 1096',
      logic: 'isBP220 AND riserHeight > 200mm AND riserHeight <= 250mm (passes BP 220 but exceeds PD 1096)',
      dependencies: ['params.riserHeight', 'params.projectType'],
      violationVisualization: 'Warning badge: "Confirm DHSUD registration".',
      passVisualization: 'No warning.',
      lawGroup: 'Cross-Law',
      activationCondition: "projectType === 'bp220_socialized' OR 'bp220_economic'",
    },
    {
      id: 'conflict-width-bp220-vs-pd1096',
      label: 'Conflict: BP 220 vs PD 1096 Width',
      codeSection: 'BP 220 vs PD 1096',
      logic: 'isBP220 AND stairWidth >= 600mm AND stairWidth < 750mm (passes BP 220 but below PD 1096)',
      dependencies: ['params.stairWidth', 'params.projectType'],
      violationVisualization: 'Warning badge: "Valid only for qualifying housing projects".',
      passVisualization: 'No warning.',
      lawGroup: 'Cross-Law',
      activationCondition: "projectType === 'bp220_socialized' OR 'bp220_economic'",
    },
    {
      id: 'conflict-riser-exit-vs-pd1096',
      label: 'Conflict: RA 9514 vs PD 1096 Riser',
      codeSection: 'RA 9514 vs PD 1096',
      logic: 'isExitStair AND NOT isBP220 AND riserHeight > 180mm AND riserHeight <= 200mm (passes PD 1096 but exceeds RA 9514)',
      dependencies: ['params.riserHeight', 'params.isExitStair', 'params.projectType'],
      violationVisualization: 'Warning badge: "Redesign or declassify as exit stair".',
      passVisualization: 'No warning.',
      lawGroup: 'Cross-Law',
      activationCondition: 'isExitStair === true AND NOT isBP220',
    },

    // ─── Blondel Comfort (1 rule, severity: info) ──────────────────────
    {
      id: 'blondel-comfort',
      label: 'Blondel Comfort Formula',
      codeSection: "Blondel, Cours d'Architecture (1675) — 2R+T ergonomic formula",
      logic: '2*riserHeight + treadDepth < 600mm OR > 650mm',
      dependencies: ['params.riserHeight', 'params.treadDepth'],
      violationVisualization: 'Info annotation showing current 2R+T value and comfortable range.',
      passVisualization: 'No annotation (within 600–650mm comfort zone).',
      lawGroup: 'Ergonomic',
    },

    // ─── Uniformity Tolerance (1 rule, severity: warning) ──────────────
    {
      id: 'uniformity-tolerance',
      label: 'Dimensional Uniformity',
      codeSection: 'IBC 2024 §1011.5.4 — Dimensional uniformity',
      logic: 'toleranceMode AND any step deviation exceeds 9.5mm flight range',
      dependencies: ['params.toleranceMode', 'params.toleranceRange', 'params.numRisers'],
      violationVisualization: 'Violating risers colored LAW_COLORS.PD_1096 (#4A7FAD). Warning annotation at worst step.',
      passVisualization: 'All risers at uniform height (neutral color).',
      lawGroup: 'IBC Reference',
      activationCondition: 'toleranceMode === true',
    },

    // ─── Nosing Profile (2 rules, severity: info, detail view only) ────
    {
      id: 'nosing-projection-ada',
      label: 'ADA: Nosing Projection',
      codeSection: 'ADA/ANSI A117.1 — Nosing projection (UNVERIFIED)',
      logic: 'detailViewActive AND nosingProjection > 38mm',
      dependencies: ['params.detailViewActive', 'params.nosingProjection'],
      violationVisualization: 'Info annotation at nosing detail.',
      passVisualization: 'No annotation.',
      lawGroup: 'ADA Reference',
      activationCondition: 'detailViewActive === true',
    },
    {
      id: 'nosing-radius-ada',
      label: 'ADA: Nosing Edge Radius',
      codeSection: 'ADA/ANSI A117.1 — Nosing radius (UNVERIFIED)',
      logic: 'detailViewActive AND nosingRadius > 13mm',
      dependencies: ['params.detailViewActive', 'params.nosingRadius'],
      violationVisualization: 'Info annotation at nosing detail.',
      passVisualization: 'No annotation.',
      lawGroup: 'ADA Reference',
      activationCondition: 'detailViewActive === true',
    },

    // ─── Handrail Graspability (2 rules, severity: info, detail only) ──
    {
      id: 'handrail-diameter-ada',
      label: 'ADA: Handrail Grip Diameter',
      codeSection: 'ADA/ANSI A117.1 §505 — Handrail gripping surface (UNVERIFIED)',
      logic: 'handrailDetailActive AND (handrailDiameter < 32mm OR handrailDiameter > 38mm)',
      dependencies: ['params.handrailDetailActive', 'params.handrailDiameter'],
      violationVisualization: 'Info annotation at handrail cross-section.',
      passVisualization: 'No annotation.',
      lawGroup: 'ADA Reference',
      activationCondition: 'handrailDetailActive === true',
    },
    {
      id: 'handrail-clearance-ada',
      label: 'ADA: Wall Clearance',
      codeSection: 'ADA/ANSI A117.1 §505 — Wall clearance (UNVERIFIED)',
      logic: 'handrailDetailActive AND wallClearance < 38mm',
      dependencies: ['params.handrailDetailActive', 'params.wallClearance'],
      violationVisualization: 'Info annotation at handrail cross-section.',
      passVisualization: 'No annotation.',
      lawGroup: 'ADA Reference',
      activationCondition: 'handrailDetailActive === true',
    },
  ],

  // ===================================================================
  // LEARNING INTEGRATION
  // ===================================================================
  learning: {
    primaryObjective: 'Analyze how PD 1096, BP 220, BP 344, and RA 9514 evaluate the same stair geometry independently and detect where they conflict.',
    bloomLevel: 4, // Analyze — multi-law comparison
    keyValues: [
      'PD 1096: max riser 200mm, min tread 200mm, min headroom 2000mm, max rise 3600mm',
      'PD 1096: handrail 800–900mm, width residential 750mm / commercial 900mm / high-occ 1100mm',
      'BP 220: max riser 250mm, min tread 200mm, min width 600mm',
      'BP 344: min accessible width 1200mm, dual handrails at 700mm + 900mm',
      'RA 9514: max exit riser 180mm, min exit tread 200mm, min exit width 900mm, max rise 3000mm',
      'Blondel: 2R+T = 600–650mm comfort zone (optimal 630mm)',
      'IBC uniformity: max 9.5mm deviation between risers in a flight',
      'Color severity order: RA 9514 red > BP 344 blue > PD 1096 slate > BP 220 amber',
    ],
    prerequisites: [
      'Understanding of stair terminology (riser, tread, nosing, stringer, headroom)',
      'Basic familiarity with Philippine building code structure (PD 1096)',
      'Concept of overlapping jurisdiction (multiple laws on same element)',
    ],
    aleQuestionTypes: [
      'Code compliance — which law governs exit stair riser height?',
      'Multi-law conflict — BP 220 allows 250mm riser but PD 1096 limits to 200mm — what governs?',
      'Accessibility — what additional requirements does BP 344 impose on stairs?',
      'Fire code — RA 9514 vs PD 1096 vertical rise limits',
      'Ergonomics — Blondel 2R+T comfort formula application',
    ],
    successCriteria: 'Student can configure a stair that simultaneously satisfies all 4 laws for a given project type, and can explain why conflicts arise between BP 220/PD 1096 and RA 9514/PD 1096.',
    quizIntegration: [
      {
        type: 'in-situ',
        description: 'After exploring violation presets, student is asked to fix a multi-violation stair to satisfy all active laws.',
      },
      {
        type: 'post-exploration',
        description: 'Quiz on threshold values: max riser per law, min width per context, Blondel range.',
      },
    ],
  },

  // ===================================================================
  // BINDINGS (Control → Store → Effects)
  // ===================================================================
  bindings: [
    // ── Classification toggles → law regime activation ──
    {
      source: { type: 'dropdown', id: 'projectType' },
      storeField: 'params.projectType',
      effects: ['Switches between PD 1096 base regime and BP 220 housing regime', 'Recalculates all compliance rules', 'Updates widthDeficit and strictestMinWidth'],
      description: 'Project type determines which laws apply. BP 220 replaces PD 1096 for riser/tread/width. All others overlay.',
    },
    {
      source: { type: 'toggle', id: 'isAccessibleRoute' },
      storeField: 'params.isAccessibleRoute',
      effects: ['Activates BP 344 compliance rules', 'Shows/hides BP 344 ghost handrails (dual-height 700+900mm)', 'Shows/hides BP 344 extension rails (300mm)', 'May change strictestMinWidth to 1200mm'],
      description: 'Accessibility toggle activates BP 344 overlay rules and ghost rail visualization.',
    },
    {
      source: { type: 'toggle', id: 'isExitStair' },
      storeField: 'params.isExitStair',
      effects: ['Activates RA 9514 compliance rules', 'Tightens riser max to 180mm', 'Tightens vertical rise max to 3000mm', 'May change strictestMinWidth'],
      description: 'Exit stair toggle activates RA 9514 fire code overlay rules.',
    },
    {
      source: { type: 'toggle', id: 'isHighOccupancy' },
      storeField: 'params.isHighOccupancy',
      effects: ['Raises PD 1096 width requirement to 1100mm'],
      description: 'High occupancy flag raises PD 1096 minimum width for stairs serving >50 occupants.',
    },

    // ── Geometry sliders → scene objects + compliance ──
    {
      source: { type: 'slider', id: 'riserHeight' },
      storeField: 'params.riserHeight',
      effects: ['Updates riser geometry height', 'Recomputes 2R+T Blondel value', 'Recomputes pitch angle', 'Evaluates riser compliance across all 4 laws', 'Updates riser/tread colors', 'Recalculates totalRise and landingRequired'],
      description: 'Core dimension — affects compliance, comfort, pitch, and geometry.',
    },
    {
      source: { type: 'slider', id: 'treadDepth' },
      storeField: 'params.treadDepth',
      effects: ['Updates tread geometry depth', 'Recomputes 2R+T Blondel value', 'Recomputes pitch angle', 'Evaluates tread compliance', 'Updates tread colors'],
      description: 'Core dimension — affects compliance, comfort, pitch, and geometry.',
    },
    {
      source: { type: 'slider', id: 'stairWidth' },
      storeField: 'params.stairWidth',
      effects: ['Updates stair width in scene', 'Evaluates width compliance across all 4 laws', 'Updates widthDeficit and width indicator planes', 'Changes evacuation bottleneck status'],
      description: 'Core dimension — most law-sensitive parameter (4 different minimum thresholds).',
    },
    {
      source: { type: 'slider', id: 'headroom' },
      storeField: 'params.headroom',
      effects: ['Moves headroom plane in scene', 'Evaluates PD 1096 headroom compliance', 'Changes headroom plane color'],
      description: 'Headroom clearance — only PD 1096 specifies a minimum (2000mm).',
    },
    {
      source: { type: 'slider', id: 'handrailHeight' },
      storeField: 'params.handrailHeight',
      effects: ['Repositions handrail cylinders', 'Evaluates PD 1096 range (800–900mm)', 'Evaluates BP 344 exact (900mm)', 'Updates handrail color'],
      description: 'Handrail height — PD 1096 range check plus BP 344 exact match.',
    },
    {
      source: { type: 'slider', id: 'numRisers' },
      storeField: 'params.numRisers',
      effects: ['Adds/removes tread and riser geometry', 'Recalculates totalRise', 'Evaluates vertical rise compliance (PD 1096 + RA 9514)', 'Updates landingRequired flag'],
      description: 'Number of risers drives total rise and landing requirement.',
    },

    // ── Preset activation ──
    {
      source: { type: 'preset', id: 'preset-selector' },
      storeField: 'params (multiple fields)',
      effects: ['Batch-updates all parameter values from preset', 'Triggers full recomputation of compliance, geometry, and colors'],
      description: 'Preset selection overwrites multiple parameters at once to demonstrate specific scenarios or violations.',
    },
  ],

  // ===================================================================
  // CAMERA PRESETS
  // Source: stairway-configurator.ts camera: { position: [3,3,3], fov: 45 }
  // GAP: Only default camera defined. No explicit named presets.
  // ===================================================================
  cameraPresets: [
    { id: 'default', label: 'Default (3/4 View)', position: [3, 3, 3], lookAt: [0, 1, -1], transitionDuration: 500, orthographic: false },
    { id: 'front', label: 'Front Elevation', position: [0, 1.5, 4], lookAt: [0, 1.5, 0], transitionDuration: 500, orthographic: false },
    { id: 'side', label: 'Side Section', position: [4, 1.5, -1], lookAt: [0, 1.5, -1], transitionDuration: 500, orthographic: false },
    { id: 'top', label: 'Plan View', position: [0, 5, -1], lookAt: [0, 0, -1], transitionDuration: 500, orthographic: true },
  ],

  // ===================================================================
  // KEYBOARD SHORTCUTS
  // GAP: No explicit shortcuts defined in stairway-configurator.ts
  // ===================================================================
  shortcuts: [],

  // ===================================================================
  // PRESETS
  // Source: stairway-presets.ts — 4 scenario + 11 violation presets
  // ===================================================================
  presets: [
    // ── Scenario Presets (4) ──
    {
      id: 'standard-house',
      label: 'Standard House',
      category: 'compliant',
      parameterOverrides: {
        projectType: 'general_residential',
        isAccessibleRoute: false,
        isExitStair: false,
        isHighOccupancy: false,
        stairWidth: 900,
        riserHeight: 185,
        treadDepth: 250,
        headroom: 2100,
        handrailHeight: 860,
        numRisers: 12,
      },
      expectedViolations: [],
      teachingPoint: 'Baseline compliant residential stair under PD 1096.',
    },
    {
      id: 'bp220-housing',
      label: 'BP 220 Housing',
      category: 'compliant',
      parameterOverrides: {
        projectType: 'bp220_socialized',
        isAccessibleRoute: false,
        isExitStair: false,
        isHighOccupancy: false,
        stairWidth: 620,
        riserHeight: 240,
        treadDepth: 210,
        headroom: 2100,
        handrailHeight: 850,
        numRisers: 14,
      },
      expectedViolations: ['conflict-riser-bp220-vs-pd1096', 'pd1096-handrail-range'],
      teachingPoint: 'BP 220 housing allows relaxed dimensions (250mm riser, 600mm width) that would violate PD 1096 baseline. Demonstrates cross-law conflict.',
    },
    {
      id: 'public-hall',
      label: 'Public Hall',
      category: 'compliant',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: true,
        isExitStair: false,
        isHighOccupancy: true,
        stairWidth: 1250,
        riserHeight: 175,
        treadDepth: 280,
        headroom: 2200,
        handrailHeight: 900,
        numRisers: 12,
      },
      expectedViolations: [],
      teachingPoint: 'Accessible public stair satisfying PD 1096 + BP 344 simultaneously. Shows dual handrail ghost.',
    },
    {
      id: 'exit-stair',
      label: 'Exit Stair',
      category: 'compliant',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: false,
        isExitStair: true,
        isHighOccupancy: true,
        stairWidth: 950,
        riserHeight: 190,
        treadDepth: 260,
        headroom: 2100,
        handrailHeight: 900,
        numRisers: 14,
      },
      expectedViolations: ['conflict-riser-exit-vs-pd1096'],
      teachingPoint: 'Exit stair under RA 9514. Riser at 190mm passes PD 1096 (<=200) but triggers RA 9514 conflict warning (<=180).',
    },

    // ── Violation Presets (11) ──
    {
      id: 'violation-riser-pd1096',
      label: 'Riser Violation (PD 1096)',
      category: 'violation',
      parameterOverrides: {
        projectType: 'general_residential',
        isAccessibleRoute: false,
        isExitStair: false,
        isHighOccupancy: false,
        stairWidth: 900,
        riserHeight: 210,
        treadDepth: 250,
        headroom: 2100,
        handrailHeight: 900,
        numRisers: 12,
      },
      expectedViolations: ['pd1096-max-riser'],
      teachingPoint: 'Riser at 210mm exceeds PD 1096 maximum of 200mm.',
    },
    {
      id: 'violation-tread-pd1096',
      label: 'Tread Too Shallow (PD 1096)',
      category: 'violation',
      parameterOverrides: {
        projectType: 'general_residential',
        isAccessibleRoute: false,
        isExitStair: false,
        isHighOccupancy: false,
        stairWidth: 900,
        riserHeight: 185,
        treadDepth: 185,
        headroom: 2100,
        handrailHeight: 900,
        numRisers: 12,
      },
      expectedViolations: ['pd1096-min-tread', 'blondel-comfort'],
      teachingPoint: 'Tread at 185mm is below PD 1096 minimum of 200mm. Also outside Blondel comfort zone.',
    },
    {
      id: 'violation-width-public-pd1096',
      label: 'Too Narrow for Public (PD 1096)',
      category: 'violation',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: false,
        isExitStair: false,
        isHighOccupancy: true,
        stairWidth: 900,
        riserHeight: 185,
        treadDepth: 250,
        headroom: 2100,
        handrailHeight: 900,
        numRisers: 12,
      },
      expectedViolations: ['pd1096-min-width-high-occ'],
      teachingPoint: 'Width 900mm fails PD 1096 high-occupancy requirement of 1100mm.',
    },
    {
      id: 'violation-headroom-pd1096',
      label: 'Headroom Crush (PD 1096)',
      category: 'violation',
      parameterOverrides: {
        projectType: 'general_residential',
        isAccessibleRoute: false,
        isExitStair: false,
        isHighOccupancy: false,
        stairWidth: 900,
        riserHeight: 185,
        treadDepth: 250,
        headroom: 1900,
        handrailHeight: 900,
        numRisers: 12,
      },
      expectedViolations: ['pd1096-min-headroom'],
      teachingPoint: 'Headroom at 1900mm is below PD 1096 minimum of 2000mm.',
    },
    {
      id: 'violation-riser-ra9514',
      label: 'Exit Riser Violation (RA 9514)',
      category: 'violation',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: false,
        isExitStair: true,
        isHighOccupancy: true,
        stairWidth: 950,
        riserHeight: 195,
        treadDepth: 260,
        headroom: 2100,
        handrailHeight: 900,
        numRisers: 14,
      },
      expectedViolations: ['ra9514-max-riser', 'conflict-riser-exit-vs-pd1096'],
      teachingPoint: 'Exit stair riser at 195mm exceeds RA 9514 limit of 180mm, but passes PD 1096 (<=200mm). Classic conflict.',
    },
    {
      id: 'violation-no-landing-ra9514',
      label: 'No Landing (RA 9514)',
      category: 'violation',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: false,
        isExitStair: true,
        isHighOccupancy: true,
        stairWidth: 950,
        riserHeight: 185,
        treadDepth: 260,
        headroom: 2100,
        handrailHeight: 900,
        numRisers: 18,
      },
      expectedViolations: ['ra9514-max-vertical'],
      teachingPoint: 'Total rise 18x185=3330mm exceeds RA 9514 exit stair max of 3000mm. Landing required.',
    },
    {
      id: 'violation-width-bp344',
      label: 'Too Narrow for Wheelchair (BP 344)',
      category: 'violation',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: true,
        isExitStair: false,
        isHighOccupancy: false,
        stairWidth: 1000,
        riserHeight: 175,
        treadDepth: 280,
        headroom: 2200,
        handrailHeight: 900,
        numRisers: 12,
      },
      expectedViolations: ['bp344-min-width'],
      teachingPoint: 'Width 1000mm fails BP 344 accessible minimum of 1200mm.',
    },
    {
      id: 'conflict-bp220-vs-pd1096',
      label: 'BP 220 vs PD 1096 Conflict',
      category: 'edge-case',
      parameterOverrides: {
        projectType: 'bp220_socialized',
        isAccessibleRoute: false,
        isExitStair: false,
        isHighOccupancy: false,
        stairWidth: 650,
        riserHeight: 230,
        treadDepth: 210,
        headroom: 2100,
        handrailHeight: 850,
        numRisers: 14,
      },
      expectedViolations: ['conflict-riser-bp220-vs-pd1096', 'conflict-width-bp220-vs-pd1096', 'pd1096-handrail-range'],
      teachingPoint: 'Passes BP 220 (riser <=250, width >=600) but exceeds PD 1096 baselines. Demonstrates jurisdictional hierarchy.',
    },
    {
      id: 'conflict-ra9514-vs-pd1096',
      label: 'RA 9514 vs PD 1096 Conflict',
      category: 'edge-case',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: false,
        isExitStair: true,
        isHighOccupancy: true,
        stairWidth: 950,
        riserHeight: 195,
        treadDepth: 260,
        headroom: 2100,
        handrailHeight: 900,
        numRisers: 14,
      },
      expectedViolations: ['ra9514-max-riser', 'conflict-riser-exit-vs-pd1096'],
      teachingPoint: 'Passes PD 1096 (<=200mm) but exceeds RA 9514 exit maximum (<=180mm). Demonstrates stricter overlay.',
    },
    {
      id: 'all-laws-happy',
      label: 'All Laws Happy',
      category: 'compliant',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: true,
        isExitStair: true,
        isHighOccupancy: true,
        stairWidth: 1250,
        riserHeight: 170,
        treadDepth: 290,
        headroom: 2200,
        handrailHeight: 900,
        numRisers: 12,
      },
      expectedViolations: [],
      teachingPoint: 'Satisfies ALL laws simultaneously including BP 344 + RA 9514. The "gold standard" stair.',
    },
    {
      id: 'everything-wrong',
      label: 'Everything Wrong',
      category: 'violation',
      parameterOverrides: {
        projectType: 'commercial',
        isAccessibleRoute: true,
        isExitStair: true,
        isHighOccupancy: true,
        stairWidth: 500,
        riserHeight: 280,
        treadDepth: 155,
        headroom: 1850,
        handrailHeight: 650,
        numRisers: 20,
      },
      expectedViolations: [
        'pd1096-max-riser', 'pd1096-min-tread', 'pd1096-min-headroom', 'pd1096-max-vertical',
        'pd1096-min-width-high-occ', 'pd1096-handrail-range',
        'bp344-min-width', 'bp344-handrail-upper',
        'ra9514-max-riser', 'ra9514-min-width', 'ra9514-min-tread', 'ra9514-max-vertical',
        'blondel-comfort',
      ],
      teachingPoint: 'Triggers maximum simultaneous violations across all laws. Useful for demonstrating the full compliance panel.',
    },
  ],
}
