// .ai/docs/XX-3D-Modules/Unified-Wall-Configurator/UI-Audit/unified-wall-configurator.blueprint.ts
// Populated from codebase scan — every value grounded in actual source files.
// Source of truth: src/features/3d-lab/config/modules/10-materials/unified-wall-configurator.ts
// Multi-file architecture: wall-types.ts, wall-core-registry.ts, wall-computation.ts,
//   wall-constants.ts, wall-constants-performance.ts, wall-violations.ts, wall-presets.ts,
//   wall-build-steps.ts, wall-geometry.ts, wall-geometry-chb.ts, wall-geometry-drywall.ts,
//   wall-geometry-brick.ts, wall-geometry-generic.ts, wall-geometry-layers.ts,
//   wall-geometry-mep.ts, wall-geometry-connections.ts
import type { ModuleBlueprint } from '@/types/module-blueprint'

export const unifiedWallConfiguratorBlueprint: ModuleBlueprint = {
  schemaVersion: '1.2.0',

  // ===================================================================
  // MODULE IDENTITY
  // Source: unified-wall-configurator.ts export (lines 406–425)
  // ===================================================================
  meta: {
    slug: 'unified-wall-configurator',
    displayName: 'Unified Wall Configurator',
    category: 'Materials',
    routePath: '/dashboard/3d-lab/unified-wall-configurator',
    aleTaxonomy: [
      'PD 1096 IRR Rule VII §708 — Minimum Ceiling Heights',
      'NSCP 2015 §702.1 — CHB Wall Thickness Requirements',
      'NSCP 2015 §705.2 — Brick Masonry Height Limits',
      'NSCP 2015 §706 — Seismic Reinforcement',
      'RA 9514 IRR — Fire Resistance Ratings',
      'ASTM E119 — Fire Resistance Testing',
      'ASTM E90/E413 — Sound Transmission Class',
    ],
    codeReferences: [
      'PD 1096 Rule VII §708 — Minimum habitable room height 2400mm, service rooms 2100mm',
      'NSCP 2015 §702.1 — CHB bearing walls min 150mm, non-bearing min 100mm',
      'NSCP 2015 §705.2 — Brick walls exceeding 3600mm require engineering review',
      'NSCP 2015 §706 — Seismic reinforcement requirements for masonry walls',
      'NSCP structural notes — Max rebar spacing 1200mm, max stiffener spacing 4000mm',
      'RA 9514 IRR — Fire resistance rating requirements',
      'ASTM E119 — Standard fire test for building materials',
      'ASTM E90/E413 — Sound transmission class measurement and classification',
    ],
    description:
      'Architectural wall cross-section showing layered material build-up for all 7 Philippine construction wall types. Visualize core, plaster, skim coat, primer, and paint layers in correct sequence with code-compliance feedback.',
    status: 'production',
  },

  // ===================================================================
  // ZUSTAND STORE SHAPE
  // Uses createModuleStore (parametric template store), NOT a custom store.
  // Store shape: { params: Record<string, number|boolean|string>, ... }
  // Source: unified-wall-configurator.ts parameters array (lines 30–349)
  // ===================================================================
  store: {
    storeName: 'createModuleStore',
    filePath: 'features/3d-lab/stores/createModuleStore.ts',
    fields: [
      // ── Dimensions ──
      { name: 'params.wallLength', type: 'number', defaultValue: '5000', description: 'Wall length in mm (1000–10000, step 100)', computed: false },
      { name: 'params.wallHeight', type: 'number', defaultValue: '3000', description: 'Wall height in mm (2400–4000, step 50)', computed: false },

      // ── Wall Type ──
      { name: 'params.coreType', type: "string ('chb' | 'drywall' | 'plywood' | 'cement-board' | 'brick' | 'solid-concrete' | 'existing-wall')", defaultValue: "'chb'", description: 'Wall core type — determines structural system, performance baselines, and available parameters', computed: false },

      // ── Treatment Sides ──
      { name: 'params.sides', type: "string ('1 Side' | 'Both Sides')", defaultValue: "'1 Side'", description: 'Number of finished sides — affects BOM, layer geometry, and performance calculations', computed: false },

      // ── Structure — Masonry (CHB only) ──
      { name: 'params.rebarSpacing', type: 'number', defaultValue: '800', description: 'Rebar spacing in mm (600–1200, step 200). Visible when coreType === chb.', computed: false },
      { name: 'params.rebarDiameter', type: "string ('10' | '12' | '16')", defaultValue: "'12'", description: 'Rebar diameter in mm. Visible when coreType === chb.', computed: false },
      { name: 'params.bondBeamInterval', type: "string ('Every 3rd course' | 'Every 4th course')", defaultValue: "'Every 3rd course'", description: 'Bond beam horizontal rebar interval (600mm or 800mm). Visible when coreType === chb.', computed: false },
      { name: 'params.chbSize', type: "string ('150' | '100')", defaultValue: "'150'", description: 'CHB block width — 150mm (6" bearing) or 100mm (4" non-bearing). Visible when coreType === chb.', computed: false },
      { name: 'params.showReinforcement', type: 'boolean', defaultValue: 'true', description: 'Show vertical rebar, grout fill, and bond beams in 3D. Visible when coreType === chb.', computed: false },

      // ── Structure — Framing (Drywall, Plywood, Cement Board) ──
      { name: 'params.studSpacing', type: "string ('400' | '600')", defaultValue: "'600'", description: 'Stud spacing — 400mm (16" o.c.) or 600mm (24" o.c.). Visible when coreType in [drywall, plywood, cement-board].', computed: false },
      { name: 'params.studDepth', type: "string ('64' | '92' | '150')", defaultValue: "'92'", description: 'Stud depth in mm. Visible when coreType in [drywall, plywood, cement-board].', computed: false },
      { name: 'params.gypsumThickness', type: "string ('12.5' | '15.9')", defaultValue: "'12.5'", description: 'Gypsum board thickness — 12.5mm (1/2") or 15.9mm (5/8" Type X). Visible when coreType === drywall.', computed: false },
      { name: 'params.gypsumLayers', type: "string ('Single layer' | 'Double layer')", defaultValue: "'Single layer'", description: 'Number of gypsum layers per side. Visible when coreType === drywall.', computed: false },
      { name: 'params.showInsulation', type: 'boolean', defaultValue: 'false', description: 'Show fiberglass batt insulation between studs. Visible when coreType in [drywall, plywood, cement-board].', computed: false },
      { name: 'params.showBridging', type: 'boolean', defaultValue: 'false', description: 'Show horizontal bridging straps. Visible when coreType in [drywall, plywood, cement-board].', computed: false },

      // ── View ──
      { name: 'params.viewMode', type: "string ('overview' | 'section-cut' | 'exploded' | 'build-sequence' | 'compare')", defaultValue: "'overview'", description: 'Visualization mode — hidden from GenericControlPanel, driven by ViewModeButtonStrip', computed: false },
      { name: 'params.compareWith', type: "string ('chb' | 'drywall' | 'plywood' | 'cement-board' | 'brick' | 'solid-concrete' | 'existing-wall')", defaultValue: "'drywall'", description: 'Second wall type for comparison mode. Visible when viewMode === compare.', computed: false },
      { name: 'params.explodeAmount', type: 'number', defaultValue: '0', description: 'Explode amount 0–100%. Visible when viewMode === exploded.', computed: false },
      { name: 'params.buildStep', type: 'number', defaultValue: '8', description: 'Current build step (1–8). Visible when viewMode === build-sequence.', computed: false },

      // ── Finish Layers ──
      { name: 'params.showPlaster', type: 'boolean', defaultValue: 'true', description: 'Show plaster layer (12.7mm). Hidden for framed types (drywall, plywood, cement-board).', computed: false },
      { name: 'params.showSkimCoat', type: 'boolean', defaultValue: 'false', description: 'Show skim coat layer (3mm)', computed: false },
      { name: 'params.showPrimer', type: 'boolean', defaultValue: 'true', description: 'Show primer layer (1mm)', computed: false },
      { name: 'params.showPaint', type: 'boolean', defaultValue: 'true', description: 'Show paint layer (1mm)', computed: false },
      { name: 'params.paintColor', type: "string ('White' | 'Cream' | 'Light Gray' | 'Sky Blue' | 'Sage Green' | 'Warm Beige')", defaultValue: "'White'", description: 'Paint color selection', computed: false },

      // ── Advanced Features ──
      { name: 'params.showMEP', type: 'boolean', defaultValue: 'false', description: 'Show MEP elements (conduit, outlet, switch, plumbing). Visible when coreType in [drywall, plywood, cement-board].', computed: false },
      { name: 'params.wallLocation', type: "string ('interior' | 'exterior' | 'bathroom' | 'below-grade')", defaultValue: "'interior'", description: 'Wall location — determines waterproofing requirements', computed: false },
      { name: 'params.showWaterproofing', type: 'boolean', defaultValue: 'false', description: 'Show waterproofing membrane. Visible when wallLocation !== interior.', computed: false },
      { name: 'params.showConnections', type: 'boolean', defaultValue: 'false', description: 'Show connection details (dowels, fasteners, deflection gaps)', computed: false },

      // ── Computed (from computeWallState) ──
      { name: 'computed.coreThickness', type: 'number', defaultValue: '0.150', description: 'Core thickness in meters — resolved from WALL_CORE_REGISTRY[coreType].thickness', computed: true, dependencies: ['params.coreType'] },
      { name: 'computed.totalThickness', type: 'number', defaultValue: '0.150', description: 'Total wall thickness including all finish layers (meters)', computed: true, dependencies: ['params.coreType', 'params.showPlaster', 'params.showSkimCoat', 'params.showPrimer', 'params.showPaint', 'params.sides'] },
      { name: 'computed.wallAreaSqm', type: 'number', defaultValue: '15', description: 'Wall area in sqm = (wallLength/1000) * (wallHeight/1000)', computed: true, dependencies: ['params.wallLength', 'params.wallHeight'] },
      { name: 'computed.fireRatingMinutes', type: 'number', defaultValue: '60', description: 'Fire resistance rating in minutes — computed from base + bonuses', computed: true, dependencies: ['params.coreType', 'params.showPlaster', 'params.sides', 'params.gypsumThickness', 'params.gypsumLayers', 'params.showReinforcement'] },
      { name: 'computed.stcRating', type: 'number', defaultValue: '45', description: 'Sound Transmission Class — computed from base + bonuses', computed: true, dependencies: ['params.coreType', 'params.showPlaster', 'params.sides', 'params.showInsulation', 'params.gypsumLayers'] },
      { name: 'computed.rValue', type: 'number', defaultValue: '1.8', description: 'Thermal resistance R-value — computed from base + insulation bonus', computed: true, dependencies: ['params.coreType', 'params.showInsulation', 'params.studDepth'] },
      { name: 'computed.costPerSqm', type: 'number', defaultValue: '3200', description: 'Base cost per sqm in PHP from registry', computed: true, dependencies: ['params.coreType'] },
      { name: 'computed.bomTotal', type: 'number', defaultValue: '0', description: 'Total BOM cost in PHP', computed: true, dependencies: ['params.coreType', 'params.wallLength', 'params.wallHeight', 'params.sides', 'params.showPlaster', 'params.showSkimCoat', 'params.showPrimer', 'params.showPaint', 'params.showReinforcement', 'params.showInsulation'] },
    ],
  },

  // ===================================================================
  // LEFT SIDEBAR: CONTROL PANELS
  // Source: GenericControlPanel.tsx renders parameter groups as sections.
  // Custom WallConfiguratorLeftPanel adds CoreTypeCardStrip + ViewModeButtonStrip
  // above the GenericControlPanel.
  // No tabs — single scrollable panel.
  // ===================================================================
  sidebar: {
    width: '320px',
    tabs: null, // Single panel — no tabs. Custom left panel + GenericControlPanel.
  },

  // ===================================================================
  // CENTER: 3D VIEWPORT
  // Source: unified-wall-configurator.ts camera config + wall-geometry.ts dispatcher
  // ===================================================================
  scene: {
    canvas: {
      camera: { position: [7, 2.5, 5.5], fov: 48 },
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
      type: 'plane',
      config: { size: [6, 3], color: '#e4e4e7', opacity: 0.6, yOffset: -0.05 },
    },
    controls: {
      type: 'orbit',
      config: { enableDamping: true, dampingFactor: 0.05 },
    },
    objects: [
      // ── Ground plane ──
      // Source: wall-geometry.ts lines 26–34
      {
        id: 'ground',
        semanticRole: 'Ground plane / floor slab beneath wall assembly',
        geometrySource: 'parametric',
        reactivity: 'Size driven by wallLength + 1.0m padding (X) and coreThickness + 2.0m padding (Z). Fixed at y=-0.05.',
        material: { type: 'meshStandard', props: { color: '#e4e4e7', transparent: true, opacity: 0.6 } },
        visibilityCondition: 'always',
      },

      // ── CHB: Simplified body ──
      // Source: wall-geometry-chb.ts lines 29–36
      {
        id: 'core-chb-simplified',
        semanticRole: 'Simplified CHB wall body (left ~80% of wall length)',
        geometrySource: 'parametric',
        reactivity: 'Width = wallLength - repWidth. Height = wallHeight. Depth = coreThickness. Color from WALL_CORE_REGISTRY.chb.color (#a8a29e).',
        material: { type: 'meshStandard', props: { color: '#a8a29e' } },
        visibilityCondition: "when coreType === 'chb'",
      },
      // ── CHB: Instanced blocks (representative section) ──
      // Source: wall-geometry-chb.ts lines 91–121
      {
        id: 'core-chb-blocks',
        semanticRole: 'Instanced CHB blocks in representative section (rightmost ~1200mm)',
        geometrySource: 'parametric',
        reactivity: 'Block dimensions: 400x200x150mm minus mortar (10mm). Running bond pattern. Max 45 instances. Position computed from repStartX.',
        material: { type: 'meshStandard', props: { color: '#b5ada7' } },
        visibilityCondition: "when coreType === 'chb'",
      },
      // ── CHB: Section boundary edge ──
      // Source: wall-geometry-chb.ts lines 124–132
      {
        id: 'core-chb-boundary',
        semanticRole: 'White edge line separating simplified body from representative section',
        geometrySource: 'parametric',
        reactivity: 'Position at repStartX. Full wall height. 5mm wide.',
        material: { type: 'meshStandard', props: { color: '#ffffff', transparent: true, opacity: 0.8 } },
        visibilityCondition: "when coreType === 'chb'",
      },
      // ── CHB: Vertical rebar (instanced cylinders) ──
      // Source: wall-geometry-chb.ts lines 139–159
      {
        id: 'struct-chb-rebar-v',
        semanticRole: 'Vertical reinforcement bars at rebarSpacing intervals in representative section',
        geometrySource: 'parametric',
        reactivity: 'Cylinder radius = rebarDiameter/2000. Height = wallHeight - 0.1m. Spacing = rebarSpacingMm/1000. Max 12 instances. Color: #374151.',
        material: { type: 'meshStandard', props: { color: '#374151' } },
        visibilityCondition: "when coreType === 'chb' AND showReinforcement === true",
      },
      // ── CHB: Horizontal rebar in bond beams (instanced cylinders) ──
      // Source: wall-geometry-chb.ts lines 162–185
      {
        id: 'struct-chb-rebar-h',
        semanticRole: 'Horizontal reinforcement bars in bond beam courses',
        geometrySource: 'parametric',
        reactivity: 'Cylinder length = repWidth. Y interval = bondBeamIntervalCourses * 200mm. Max 5 instances. Rotated 90deg Z. Color: #374151.',
        material: { type: 'meshStandard', props: { color: '#374151' } },
        visibilityCondition: "when coreType === 'chb' AND showReinforcement === true",
      },
      // ── CHB: Grout fill (instanced boxes at rebar positions) ──
      // Source: wall-geometry-chb.ts lines 188–200
      {
        id: 'struct-chb-grout',
        semanticRole: 'Grout fill in hollow cells containing vertical rebar',
        geometrySource: 'parametric',
        reactivity: 'Box at each vertical rebar position. Size: 60% of block width/depth. Color: #6b7280. Opacity: 0.8.',
        material: { type: 'meshStandard', props: { color: '#6b7280', transparent: true, opacity: 0.8 } },
        visibilityCondition: "when coreType === 'chb' AND showReinforcement === true",
      },
      // ── CHB: Bond beam course indicators ──
      // Source: wall-geometry-chb.ts lines 203–218
      {
        id: 'struct-chb-bond-beam-[i]',
        semanticRole: 'Visual highlight of grouted bond beam courses',
        geometrySource: 'parametric',
        reactivity: 'Full repWidth boxes at bond beam heights. Color: #9ca3af. Opacity: 0.4. Max 5 instances.',
        material: { type: 'meshStandard', props: { color: '#9ca3af', transparent: true, opacity: 0.4 } },
        visibilityCondition: "when coreType === 'chb' AND showReinforcement === true",
      },
      // ── CHB: Mortar face lines ──
      // Source: wall-geometry-chb.ts lines 39–87
      {
        id: 'mortar-h-f-[i] / mortar-v-even-[i] / mortar-v-odd-[i]',
        semanticRole: 'Horizontal bed joints and vertical head joints in running bond on simplified body',
        geometrySource: 'parametric',
        reactivity: 'Horizontal: 6mm high, spacing 200mm, max 20. Vertical: 6mm wide, running bond spacing 400mm, max 40. Color: #8d8680.',
        material: { type: 'meshStandard', props: { color: '#8d8680', transparent: true, opacity: 0.5 } },
        visibilityCondition: "when coreType === 'chb'",
      },

      // ── Drywall: Bottom U-track ──
      // Source: wall-geometry-drywall.ts lines 27–32
      {
        id: 'struct-drywall-bottom-track',
        semanticRole: 'Bottom floor-mounted U-track for metal stud framing',
        geometrySource: 'parametric',
        reactivity: 'Width = wallLength. Height = 32mm. Depth = studDepth. Color: #64748b (metalTrack).',
        material: { type: 'meshStandard', props: { color: '#64748b' } },
        visibilityCondition: "when coreType in ['drywall', 'plywood', 'cement-board'] (dispatched as drywall builder)",
      },
      // ── Drywall: Top U-track ──
      // Source: wall-geometry-drywall.ts lines 34–40
      {
        id: 'struct-drywall-top-track',
        semanticRole: 'Top ceiling-mounted U-track for metal stud framing',
        geometrySource: 'parametric',
        reactivity: 'Same as bottom track but at y = wallHeight - 16mm.',
        material: { type: 'meshStandard', props: { color: '#64748b' } },
        visibilityCondition: "when coreType === 'drywall'",
      },
      // ── Drywall: C-studs (instanced) ──
      // Source: wall-geometry-drywall.ts lines 43–60
      {
        id: 'struct-drywall-studs',
        semanticRole: 'Instanced vertical metal C-studs at studSpacing intervals',
        geometrySource: 'parametric',
        reactivity: 'Count = floor(wallLength/studSpacing) + 1, max 16. Height = wallHeight - 64mm. Thickness = 1mm. Color: #94a3b8 (metalStud).',
        material: { type: 'meshStandard', props: { color: '#94a3b8' } },
        visibilityCondition: "when coreType === 'drywall'",
      },
      // ── Drywall: Gypsum board front ──
      // Source: wall-geometry-drywall.ts lines 62–70
      {
        id: 'struct-drywall-board-front',
        semanticRole: 'Front gypsum board face',
        geometrySource: 'parametric',
        reactivity: 'Position at z = studDepth/2 + gypsumThickness/2. Size: wallLength x wallHeight x gypsumThickness. Opacity: 0.7.',
        material: { type: 'meshStandard', props: { color: '#f5f5f4', transparent: true, opacity: 0.7 } },
        visibilityCondition: "when coreType === 'drywall'",
      },
      // ── Drywall: Gypsum board back ──
      // Source: wall-geometry-drywall.ts lines 73–84
      {
        id: 'struct-drywall-board-back',
        semanticRole: 'Back gypsum board face (only when both sides finished)',
        geometrySource: 'parametric',
        reactivity: 'Mirror of front board at negative Z. Only rendered when sides === Both Sides.',
        material: { type: 'meshStandard', props: { color: '#f5f5f4', transparent: true, opacity: 0.7 } },
        visibilityCondition: "when coreType === 'drywall' AND sides === 'Both Sides'",
      },
      // ── Drywall: Insulation batts (instanced) ──
      // Source: wall-geometry-drywall.ts lines 87–113
      {
        id: 'struct-drywall-insulation',
        semanticRole: 'Fiberglass batt insulation between studs',
        geometrySource: 'parametric',
        reactivity: 'Instanced boxes between stud bays. Color: #fda4af (fiberglass pink). Opacity: 0.6. Max 16 instances.',
        material: { type: 'meshStandard', props: { color: '#fda4af', transparent: true, opacity: 0.6 } },
        visibilityCondition: "when coreType === 'drywall' AND showInsulation === true",
      },
      // ── Drywall: Horizontal bridging (instanced) ──
      // Source: wall-geometry-drywall.ts lines 116–135
      {
        id: 'struct-drywall-bridging',
        semanticRole: 'Flat strap bridging running through stud knockouts at 1200mm vertical intervals',
        geometrySource: 'parametric',
        reactivity: 'Count = floor(wallHeight/1.2) - 1, max 5. Full wallLength. 3mm thick, 25mm deep. Color: #94a3b8.',
        material: { type: 'meshStandard', props: { color: '#94a3b8' } },
        visibilityCondition: "when coreType === 'drywall' AND showBridging === true",
      },

      // ── Brick: Simplified body ──
      // Source: wall-geometry-brick.ts lines 24–31
      {
        id: 'core-brick-simplified',
        semanticRole: 'Simplified brick wall body (left ~70% of wall length)',
        geometrySource: 'parametric',
        reactivity: 'Width = wallLength - repWidth (~600mm). Color from registry (#b45309).',
        material: { type: 'meshStandard', props: { color: '#b45309' } },
        visibilityCondition: "when coreType === 'brick'",
      },
      // ── Brick: Instanced bricks (representative section) ──
      // Source: wall-geometry-brick.ts lines 87–115
      {
        id: 'core-brick-blocks',
        semanticRole: 'Instanced individual bricks in representative section (rightmost ~600mm)',
        geometrySource: 'parametric',
        reactivity: 'Brick dimensions: 200x65mm minus mortar. Running bond pattern. Max 100 instances.',
        material: { type: 'meshStandard', props: { color: '#b45309' } },
        visibilityCondition: "when coreType === 'brick'",
      },
      // ── Brick: Mortar face lines ──
      // Source: wall-geometry-brick.ts lines 34–84
      {
        id: 'mortar-brick-h-[i] / mortar-brick-v-even-[i] / mortar-brick-v-odd-[i]',
        semanticRole: 'Brick mortar pattern — bed joints and head joints in running bond on simplified body',
        geometrySource: 'parametric',
        reactivity: 'Course height = 75mm (65mm brick + 10mm mortar). Max 20 horizontal, 40 vertical. Color: #92400e.',
        material: { type: 'meshStandard', props: { color: '#92400e', transparent: true, opacity: 0.5 } },
        visibilityCondition: "when coreType === 'brick'",
      },
      // ── Brick: Section boundary ──
      // Source: wall-geometry-brick.ts lines 117–126
      {
        id: 'core-brick-boundary',
        semanticRole: 'White edge line separating simplified body from representative brick section',
        geometrySource: 'parametric',
        reactivity: 'Same pattern as CHB boundary.',
        material: { type: 'meshStandard', props: { color: '#ffffff', transparent: true, opacity: 0.8 } },
        visibilityCondition: "when coreType === 'brick'",
      },

      // ── Generic: Core wall body ──
      // Source: wall-geometry-generic.ts lines 15–23
      {
        id: 'wall-core',
        semanticRole: 'Simple box rendering for plywood, cement-board, solid-concrete, existing-wall',
        geometrySource: 'parametric',
        reactivity: 'Size: wallLength x wallHeight x coreThickness. Color from WALL_CORE_REGISTRY[coreType].color. Label from registry.label.',
        material: { type: 'meshStandard', props: { color: 'registry.color' } },
        visibilityCondition: "when coreType in ['plywood', 'cement-board', 'solid-concrete', 'existing-wall']",
      },

      // ── Shared: Finish layers (plaster, skim, primer, paint) ──
      // Source: wall-geometry-layers.ts — addLayer helper
      {
        id: 'layer-front-plaster',
        semanticRole: 'Plaster finish layer on front face',
        geometrySource: 'parametric',
        reactivity: 'Thickness: 12.7mm. Offset cumulates from core face outward. Color: #d4d0ca. Opacity: 0.85. Only for masonry types (supportsPlaster).',
        material: { type: 'meshStandard', props: { color: '#d4d0ca', transparent: true, opacity: 0.85 } },
        visibilityCondition: 'when showPlaster === true AND registryEntry.supportsPlaster === true',
      },
      {
        id: 'layer-front-skim',
        semanticRole: 'Skim coat layer on front face',
        geometrySource: 'parametric',
        reactivity: 'Thickness: 3mm. Color: #f5f5f0. Opacity: 0.9.',
        material: { type: 'meshStandard', props: { color: '#f5f5f0', transparent: true, opacity: 0.9 } },
        visibilityCondition: 'when showSkimCoat === true',
      },
      {
        id: 'layer-front-primer',
        semanticRole: 'Primer layer on front face',
        geometrySource: 'parametric',
        reactivity: 'Thickness: 1mm. Color: #e8e8e8. Opacity: 0.8.',
        material: { type: 'meshStandard', props: { color: '#e8e8e8', transparent: true, opacity: 0.8 } },
        visibilityCondition: 'when showPrimer === true',
      },
      {
        id: 'layer-front-paint',
        semanticRole: 'Paint layer on front face',
        geometrySource: 'parametric',
        reactivity: 'Thickness: 1mm. Color from PAINT_COLORS[paintColor] (default #ffffff). Opacity: 0.9.',
        material: { type: 'meshStandard', props: { color: 'PAINT_COLORS[paintColor]', transparent: true, opacity: 0.9 } },
        visibilityCondition: 'when showPaint === true',
      },
      {
        id: 'layer-back-plaster / layer-back-skim / layer-back-primer / layer-back-paint',
        semanticRole: 'Mirror finish layers on back face',
        geometrySource: 'parametric',
        reactivity: 'Same as front layers but at negative Z offset. Only rendered when sides === Both Sides.',
        material: { type: 'meshStandard', props: {} },
        visibilityCondition: "when sides === 'Both Sides' AND respective layer toggle is true",
      },

      // ── MEP: Electrical conduit ──
      // Source: wall-geometry-mep.ts lines 20–38
      {
        id: 'mep-conduit',
        semanticRole: 'Horizontal EMT conduit runs through stud knockouts at switch and outlet heights',
        geometrySource: 'parametric',
        reactivity: 'Two instanced cylinders: y=1.2m (switch height) and y=0.3m (convenience outlet). 20mm diameter. Color: #6b7280.',
        material: { type: 'meshStandard', props: { color: '#6b7280', transparent: true, opacity: 0.9 } },
        visibilityCondition: "when showMEP === true AND coreType supports MEP (framed types)",
      },
      // ── MEP: Outlet box ──
      // Source: wall-geometry-mep.ts lines 41–50
      {
        id: 'mep-outlet-convenience',
        semanticRole: 'Standard electrical outlet box at 300mm from floor',
        geometrySource: 'parametric',
        reactivity: 'Position at x=25% wallLength, y=0.3m. Label: "Outlet (300mm)". Color: #3b82f6.',
        material: { type: 'meshStandard', props: { color: '#3b82f6', transparent: true, opacity: 0.85 } },
        visibilityCondition: "when showMEP === true AND coreType supports MEP",
      },
      // ── MEP: Switch box ──
      // Source: wall-geometry-mep.ts lines 53–62
      {
        id: 'mep-switch-box',
        semanticRole: 'Light switch box at 1200mm from floor',
        geometrySource: 'parametric',
        reactivity: 'Position at x=-30% wallLength, y=1.2m. Label: "Switch (1200mm)". Color: #3b82f6.',
        material: { type: 'meshStandard', props: { color: '#3b82f6', transparent: true, opacity: 0.85 } },
        visibilityCondition: "when showMEP === true AND coreType supports MEP",
      },
      // ── MEP: Plumbing supply lines (hot/cold) ──
      // Source: wall-geometry-mep.ts lines 65–91
      {
        id: 'mep-plumbing-hot / mep-plumbing-cold',
        semanticRole: 'Hot and cold water supply lines (only for 150mm+ stud depth — bathroom walls)',
        geometrySource: 'parametric',
        reactivity: '1/2" supply lines, 70% of wall height. Hot: #ef4444 (red), Cold: #3b82f6 (blue). Only when studDepth >= 140mm.',
        material: { type: 'meshStandard', props: {} },
        visibilityCondition: "when showMEP === true AND studDepth >= 140mm",
      },

      // ── Connections: CHB slab dowels ──
      // Source: wall-geometry-connections.ts lines 18–37
      {
        id: 'conn-chb-slab-dowels',
        semanticRole: 'Vertical rebar dowels extending from floor slab into wall base',
        geometrySource: 'parametric',
        reactivity: 'Instanced cylinders at 600mm spacing. 12mm diameter, 400mm long. Max 10. Color: #374151.',
        material: { type: 'meshStandard', props: { color: '#374151' } },
        visibilityCondition: "when showConnections === true AND coreType === 'chb'",
      },
      // ── Connections: CHB column L-bars ──
      // Source: wall-geometry-connections.ts lines 40–63
      {
        id: 'conn-chb-column-lbars',
        semanticRole: 'L-bar dowels at wall-to-column connections every 3rd course',
        geometrySource: 'parametric',
        reactivity: 'Instanced cylinders at wall ends. Horizontal 300mm legs. Max 12. Color: #374151.',
        material: { type: 'meshStandard', props: { color: '#374151', transparent: true, opacity: 0.9 } },
        visibilityCondition: "when showConnections === true AND coreType === 'chb'",
      },
      // ── Connections: Drywall floor fasteners ──
      // Source: wall-geometry-connections.ts lines 67–81
      {
        id: 'conn-drywall-floor-fasteners',
        semanticRole: 'Power-actuated fastener indicators at floor track',
        geometrySource: 'parametric',
        reactivity: 'Instanced cylinders at 600mm spacing. Small 3mm radius, 50mm long. Max 10. Color: #ef4444 (red).',
        material: { type: 'meshStandard', props: { color: '#ef4444' } },
        visibilityCondition: "when showConnections === true AND coreType === 'drywall'",
      },
      // ── Connections: Drywall deflection gap ──
      // Source: wall-geometry-connections.ts lines 84–99
      {
        id: 'conn-drywall-deflection-gap',
        semanticRole: 'Deflection gap at ceiling for structural movement',
        geometrySource: 'parametric',
        reactivity: 'Box at y = wallHeight + 5mm. Height = 10mm. Color: #fbbf24 (amber). Label: "Deflection gap (10mm)".',
        material: { type: 'meshStandard', props: { color: '#fbbf24', transparent: true, opacity: 0.6 } },
        visibilityCondition: "when showConnections === true AND coreType === 'drywall'",
      },

      // ── Waterproofing membrane ──
      // Source: wall-geometry.ts lines 106–128
      {
        id: 'waterproofing-membrane',
        semanticRole: 'Waterproofing membrane overlay on exterior/wet-area walls',
        geometrySource: 'parametric',
        reactivity: 'Height: full wall for exterior/below-grade, max 1.8m for bathroom. Position: earth-facing side for below-grade, after finish layers for others. Color: #06b6d4 (cyan). Opacity: 0.5.',
        material: { type: 'meshStandard', props: { color: '#06b6d4', transparent: true, opacity: 0.5 } },
        visibilityCondition: "when showWaterproofing === true AND wallLocation !== 'interior'",
      },

      // ── Total thickness edge indicator ──
      // Source: wall-geometry.ts lines 131–150
      {
        id: 'thickness-edge',
        semanticRole: 'Visual indicator showing total wall build-out thickness at right edge',
        geometrySource: 'parametric',
        reactivity: 'Position at right edge of wall (wallLength/2 + 15mm). Height = 60% of wallHeight. Depth = totalThickness. Color: #1B3FC4 (Camp Cobalt). Opacity: 0.25. Label: "Total: {totalT}mm".',
        material: { type: 'meshStandard', props: { color: '#1B3FC4', transparent: true, opacity: 0.25 } },
        visibilityCondition: 'always',
      },
    ],
    overlays: [
      {
        id: 'ann-wall-height',
        semanticRole: 'Wall height dimension annotation',
        overlayType: 'dimension-line',
        reactivity: 'Position at left edge of wall. Shows wallHeight value. References PD 1096 Rule VII §708.',
        visibilityCondition: 'always (as annotation)',
      },
      {
        id: 'ann-wall-thickness',
        semanticRole: 'Core thickness annotation at top of wall',
        overlayType: 'label',
        reactivity: 'Position at top center. Shows core thickness. References NSCP 2015 §702.1.',
        visibilityCondition: 'always (as annotation)',
      },
      {
        id: 'ann-layer-callout',
        semanticRole: 'Finish layer stack callout annotation',
        overlayType: 'label',
        reactivity: 'Position at right edge. Describes Core > Plaster > Skim > Primer > Paint sequence.',
        visibilityCondition: 'when any finish layer toggle is true',
      },
      {
        id: 'ann-total-buildout',
        semanticRole: 'Total build-out thickness annotation at bottom',
        overlayType: 'label',
        reactivity: 'Position below wall. Warns about net room dimension impact.',
        visibilityCondition: 'always (as annotation)',
      },
    ],
  },

  // ===================================================================
  // RIGHT SIDEBAR: COMPLIANCE / INFO PANELS
  // Source: Custom WallConfiguratorRightPanel with PerformanceDashboard,
  //   ComplianceReportPanel, BOMPanel, ComparisonDashboard
  // ===================================================================
  infoPanel: {
    width: '360px',
    collapsible: true,
    sections: [
      {
        id: 'performance-dashboard',
        title: 'Performance',
        collapsible: false,
        defaultCollapsed: false,
        contentType: 'scorecard',
        content: '2x2 grid of performance metrics: Fire Rating (minutes/label, colored by >=120 good / >=60 warning / <60 danger), Acoustic STC (>=50 good / >=35 warning / <35 danger), Cost/sqm PHP (<=2000 good / <=3500 warning / >3500 danger), Thermal R-value (>=3.0 good / >=1.5 warning / <1.5 danger). Each cell shows progress bar, status color, and code reference. Source: PerformanceDashboard.tsx + PerformanceMetricCell.tsx.',
        dependencies: ['params.coreType', 'params.showPlaster', 'params.sides', 'params.gypsumThickness', 'params.gypsumLayers', 'params.showReinforcement', 'params.showInsulation'],
      },
      {
        id: 'active-violations',
        title: 'Compliance Report',
        collapsible: true,
        defaultCollapsed: false,
        contentType: 'scorecard',
        content: 'Lists all currently active violation rules. Each violation shows: severity icon (error/warning/info), message, code citation. Grouped by law (PD 1096, NSCP, RA 9514, ASTM, Construction practice). Source: ComplianceReportPanel.tsx.',
        dependencies: ['params.coreType', 'params.wallHeight', 'params.wallLength', 'params.rebarSpacing', 'params.showReinforcement', 'params.chbSize', 'params.showPlaster', 'params.gypsumThickness', 'params.gypsumLayers', 'params.showInsulation'],
      },
      {
        id: 'bom-panel',
        title: 'Bill of Materials',
        collapsible: true,
        defaultCollapsed: true,
        contentType: 'custom',
        content: 'Collapsible BOM panel. Collapsed: shows total cost (PHP). Expanded: grouped table (Core Materials, Structural, Finish Layers, Labor, Waste Allowance) with material, quantity, unit, unit cost, subtotal. Total row at bottom. Price disclaimer: "Prices are approximate Metro Manila rates as of 2026-04." Source: BOMPanel.tsx.',
        dependencies: ['params.coreType', 'params.wallLength', 'params.wallHeight', 'params.sides', 'params.showPlaster', 'params.showSkimCoat', 'params.showPrimer', 'params.showPaint', 'params.showReinforcement', 'params.showInsulation', 'params.rebarDiameter', 'params.chbSize', 'params.gypsumThickness', 'params.gypsumLayers'],
      },
      {
        id: 'comparison-dashboard',
        title: 'Compare',
        collapsible: false,
        defaultCollapsed: false,
        contentType: 'custom',
        content: 'Side-by-side comparison table. Shows active coreType vs compareWith type. Metric rows: Fire, Acoustic, Cost/sqm, Thermal. Each row highlights winner (green check) vs loser (amber warning). Summary row shows win counts. Source: ComparisonDashboard.tsx.',
        dependencies: ['params.coreType', 'params.compareWith', 'params.viewMode'],
      },
    ],
  },

  // ===================================================================
  // BOTTOM HUD
  // ===================================================================
  hud: {
    position: 'bottom-center',
    metrics: [
      {
        id: 'total-thickness',
        label: 'Total Thickness',
        sourceExpression: 'Math.round(computedWallState.totalThickness * 1000)',
        unit: 'mm',
        format: 'number',
      },
      {
        id: 'wall-area',
        label: 'Wall Area',
        sourceExpression: 'computedWallState.wallAreaSqm.toFixed(1)',
        unit: 'sqm',
        format: 'number',
      },
      {
        id: 'bom-total',
        label: 'Est. Cost',
        sourceExpression: 'computedWallState.bomTotal',
        unit: 'PHP',
        format: 'number',
      },
    ],
    extras: [],
  },

  // ===================================================================
  // GUIDED TOUR
  // GAP: No guided tour implemented yet for the wall configurator
  // ===================================================================
  tour: {
    totalStops: 0, // GAP: Tour not implemented
    skippable: true,
    stops: [], // GAP: Tour stops not defined
  },

  // ===================================================================
  // TOOLBAR
  // ===================================================================
  toolbar: {
    position: 'top-right',
    items: [
      {
        id: 'toggle-grid',
        icon: 'Grid3X3',
        label: 'Toggle Grid',
        type: 'toggle',
        behavior: 'Toggle ground grid visibility',
        shortcut: 'G',
      },
    ],
  },

  // ===================================================================
  // COMPUTATION ENGINE
  // Source: wall-computation.ts — computeWallState pure function
  // ===================================================================
  computations: [
    {
      functionName: 'computeWallState',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-computation.ts',
      inputs: [
        { name: 'params', type: 'Record<string, number | boolean | string>' },
      ],
      outputs: [
        { name: 'coreType', type: 'CoreType' },
        { name: 'wallLengthMm', type: 'number' },
        { name: 'wallHeightMm', type: 'number' },
        { name: 'bothSides', type: 'boolean' },
        { name: 'coreThickness', type: 'number (meters)' },
        { name: 'layerStack', type: 'LayerStackEntry[]' },
        { name: 'totalThickness', type: 'number (meters)' },
        { name: 'wallAreaSqm', type: 'number' },
        { name: 'structural', type: 'StructuralData (discriminated union)' },
        { name: 'performance', type: 'PerformanceMetrics' },
        { name: 'bom', type: 'BOMEntry[]' },
        { name: 'bomTotal', type: 'number (PHP)' },
        { name: 'violations', type: 'Array<{id, message, codeCitation, severity}>' },
        { name: 'registryEntry', type: 'CoreTypeRegistryEntry' },
      ],
      description: 'Central pure computation function. Takes raw parameter map, resolves core type from WALL_CORE_REGISTRY, builds layer stack, resolves structural data (CHB/drywall/concrete/generic discriminated union), computes performance metrics (fire/STC/R-value/cost), calculates full BOM with Philippine material costs, and evaluates code violations. Returns immutable ComputedWallState.',
    },
    {
      functionName: 'computePerformance',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-computation.ts',
      inputs: [
        { name: 'coreType', type: 'CoreType' },
        { name: 'structural', type: 'StructuralData' },
        { name: 'showPlaster', type: 'boolean' },
        { name: 'bothSides', type: 'boolean' },
        { name: 'wallAreaSqm', type: 'number' },
      ],
      outputs: [
        { name: 'fireRatingMinutes', type: 'number' },
        { name: 'fireRatingLabel', type: 'string' },
        { name: 'stcRating', type: 'number' },
        { name: 'rValue', type: 'number' },
        { name: 'costPerSqm', type: 'number' },
        { name: 'totalCost', type: 'number' },
      ],
      description: 'Computes 4 performance metrics. Fire: FIRE_RATING_BASE[coreType] + gypsum layer bonus + grouting bonus + plaster bonus. STC: STC_BASE[coreType] + insulation bonus + surface seal bonus + double gypsum bonus. R-value: R_VALUE_BASE[coreType] + insulation per mm * studDepth. Cost: registry baseCostPerSqm * wallArea.',
      formula: 'Fire = base + (gypsumBonus * layers * sides) + groutBonus + (plasterBonus * sides). STC = base + insulationBonus + (surfaceSealBonus * sides) + doubleGypsumBonus. R = base + (0.035 * studDepthMm). Cost = baseCostPerSqm * wallAreaSqm.',
    },
    {
      functionName: 'computeBOM',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-computation.ts',
      inputs: [
        { name: 'coreType', type: 'CoreType' },
        { name: 'wallAreaSqm', type: 'number' },
        { name: 'structural', type: 'StructuralData' },
        { name: 'showPlaster', type: 'boolean' },
        { name: 'showSkim', type: 'boolean' },
        { name: 'showPrimer', type: 'boolean' },
        { name: 'showPaint', type: 'boolean' },
        { name: 'bothSides', type: 'boolean' },
      ],
      outputs: [
        { name: 'bom', type: 'BOMEntry[]' },
      ],
      description: 'Computes full Bill of Materials. Groups: core (CHB blocks, mortar, bricks, gypsum, studs, tracks, screws, concrete), structural (rebar, insulation), finish (plaster, skim coat, primer, paint — 2 coats), labor (mason, helper, drywaller, painter — man-days based on output rates), waste (applied via WASTE_FACTORS). All prices from MATERIAL_COSTS_PHP (Metro Manila 2026-04 rates).',
    },
    {
      functionName: 'buildWallGeometry',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry.ts',
      inputs: [
        { name: 'state', type: 'ComputedWallState' },
        { name: 'params', type: 'Record<string, number | boolean | string>' },
      ],
      outputs: [
        { name: 'instructions', type: 'GeometryInstruction[]' },
      ],
      description: 'Main geometry dispatcher. Produces ground plane, then routes to core-type-specific sub-builder (CHB/drywall/brick/generic). Appends shared finish layers (with view-mode transforms: section-cut reduces opacity to 0.4, exploded offsets Z by gap * index * explodePercent). Appends MEP elements, connection details, waterproofing membrane, and thickness edge indicator. In build-sequence mode, filters to only IDs visible at current step.',
    },
    {
      functionName: 'buildCHBGeometry',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry-chb.ts',
      inputs: [{ name: 'state', type: 'ComputedWallState' }],
      outputs: [{ name: 'instructions', type: 'GeometryInstruction[]' }],
      description: 'CHB sub-builder. Strategy: ~80% simplified solid body + ~20% representative section with instanced blocks (max 45). Produces: simplified body, mortar face lines (running bond on simplified), instanced CHB blocks, section boundary edge, and if showReinforcement: vertical rebar (instanced cylinders, max 12), horizontal rebar in bond beams (instanced, max 5), grout fill boxes, bond beam course indicators.',
    },
    {
      functionName: 'buildDrywallGeometry',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry-drywall.ts',
      inputs: [{ name: 'state', type: 'ComputedWallState' }],
      outputs: [{ name: 'instructions', type: 'GeometryInstruction[]' }],
      description: 'Drywall sub-builder. Produces: bottom U-track, top U-track, instanced C-studs (max 16), gypsum board front, gypsum board back (if bothSides), instanced insulation batts (if showInsulation), instanced horizontal bridging (if showBridging, at 1200mm intervals).',
    },
    {
      functionName: 'buildBrickGeometry',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry-brick.ts',
      inputs: [{ name: 'state', type: 'ComputedWallState' }],
      outputs: [{ name: 'instructions', type: 'GeometryInstruction[]' }],
      description: 'Brick sub-builder. Strategy: ~70% simplified body + ~30% representative section with instanced bricks (max 100). Running bond pattern. Course height: 75mm (65mm brick + 10mm mortar). Section boundary edge at split point.',
    },
    {
      functionName: 'buildGenericGeometry',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry-generic.ts',
      inputs: [{ name: 'state', type: 'ComputedWallState' }],
      outputs: [{ name: 'instructions', type: 'GeometryInstruction[]' }],
      description: 'Generic sub-builder for plywood, cement-board, solid-concrete, existing-wall. Simple box with optional mortar pattern (if hasMortarPattern from registry).',
    },
    {
      functionName: 'buildFinishLayers',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry-layers.ts',
      inputs: [
        { name: 'state', type: 'ComputedWallState' },
        { name: 'params', type: 'Record<string, number | boolean | string>' },
      ],
      outputs: [{ name: 'instructions', type: 'GeometryInstruction[]' }],
      description: 'Shared finish layer builder used by ALL core types. Produces offset boxes for plaster (12.7mm), skim coat (3mm), primer (1mm), paint (1mm). Each layer offset cumulates outward from core face. Mirrors to back side if bothSides. Uses LAYER_THICKNESSES, PAINT_COLORS, LAYER_COLORS, LAYER_OPACITIES constants.',
    },
    {
      functionName: 'buildMEPGeometry',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry-mep.ts',
      inputs: [
        { name: 'state', type: 'ComputedWallState' },
        { name: 'params', type: 'Record<string, number | boolean | string>' },
      ],
      outputs: [{ name: 'instructions', type: 'GeometryInstruction[]' }],
      description: 'MEP integration layer. Only for framed types with internal cavity (supportsMEP). Produces: EMT conduit runs at switch (1200mm) and outlet (300mm) heights, outlet box, switch box. If studDepth >= 140mm: hot/cold plumbing supply lines.',
    },
    {
      functionName: 'buildConnectionGeometry',
      filePath: 'features/3d-lab/config/modules/10-materials/wall-geometry-connections.ts',
      inputs: [
        { name: 'state', type: 'ComputedWallState' },
        { name: 'params', type: 'Record<string, number | boolean | string>' },
      ],
      outputs: [{ name: 'instructions', type: 'GeometryInstruction[]' }],
      description: 'Connection detail builder. CHB: slab dowels (instanced at 600mm, max 10) + column L-bars (every 3rd course at wall ends, max 12). Drywall: floor track fasteners (instanced at 600mm, max 10) + deflection gap at ceiling (10mm amber box).',
    },
  ],

  // ===================================================================
  // CODE COMPLIANCE RULES
  // Source: wall-violations.ts — 12 violation rules (3 original + 9 new)
  // ===================================================================
  compliance: [
    {
      id: 'height-below-min',
      label: 'Minimum Habitable Height',
      codeSection: 'PD 1096 Rule VII §708',
      logic: 'wallHeight < 2400mm',
      dependencies: ['params.wallHeight'],
      violationVisualization: 'Warning annotation at wall top',
      passVisualization: 'No annotation',
      lawGroup: 'PD 1096',
      activationCondition: 'always',
    },
    {
      id: 'chb-thickness-min',
      label: 'CHB Wall Thickness Info',
      codeSection: 'NSCP 2015 §702.1',
      logic: 'coreType === chb (informational — always triggers for CHB)',
      dependencies: ['params.coreType'],
      violationVisualization: 'Info annotation showing min thickness requirements',
      passVisualization: 'N/A — info severity',
      lawGroup: 'NSCP',
      activationCondition: "coreType === 'chb'",
    },
    {
      id: 'brick-load-bearing',
      label: 'Brick Height Engineering Review',
      codeSection: 'NSCP 2015 §705.2',
      logic: 'coreType === brick AND wallHeight > 3600mm',
      dependencies: ['params.coreType', 'params.wallHeight'],
      violationVisualization: 'Warning annotation at wall top',
      passVisualization: 'No annotation',
      lawGroup: 'NSCP',
      activationCondition: "coreType === 'brick'",
    },
    {
      id: 'chb-rebar-spacing-max',
      label: 'CHB Maximum Rebar Spacing',
      codeSection: 'NSCP 2015 structural notes',
      logic: 'coreType === chb AND rebarSpacing > 1200mm',
      dependencies: ['params.coreType', 'params.rebarSpacing'],
      violationVisualization: 'Warning annotation',
      passVisualization: 'No annotation',
      lawGroup: 'NSCP',
      activationCondition: "coreType === 'chb'",
    },
    {
      id: 'chb-no-reinforcement',
      label: 'CHB Seismic Reinforcement Required',
      codeSection: 'NSCP 2015 §706',
      logic: 'coreType === chb AND showReinforcement === false',
      dependencies: ['params.coreType', 'params.showReinforcement'],
      violationVisualization: 'Error annotation — non-compliant in Philippine seismic zones',
      passVisualization: 'No annotation',
      lawGroup: 'NSCP',
      activationCondition: "coreType === 'chb'",
    },
    {
      id: 'chb-length-no-stiffener',
      label: 'CHB Stiffener Column Required',
      codeSection: 'NSCP structural notes',
      logic: 'coreType === chb AND wallLength > 4000mm',
      dependencies: ['params.coreType', 'params.wallLength'],
      violationVisualization: 'Warning annotation — add stiffener columns',
      passVisualization: 'No annotation',
      lawGroup: 'NSCP',
      activationCondition: "coreType === 'chb'",
    },
    {
      id: 'plaster-on-drywall',
      label: 'Plaster Not Standard on Framed Walls',
      codeSection: 'Construction practice',
      logic: 'coreType in [drywall, plywood, cement-board] AND showPlaster === true',
      dependencies: ['params.coreType', 'params.showPlaster'],
      violationVisualization: 'Info annotation — use joint compound instead',
      passVisualization: 'No annotation',
      lawGroup: 'Construction practice',
      activationCondition: "coreType in ['drywall', 'plywood', 'cement-board']",
    },
    {
      id: 'chb-bearing-below-150',
      label: 'CHB Non-Bearing vs Bearing',
      codeSection: 'NSCP 2015 §702.1',
      logic: 'coreType === chb AND chbSize === 100',
      dependencies: ['params.coreType', 'params.chbSize'],
      violationVisualization: 'Warning annotation — 100mm is non-bearing only',
      passVisualization: 'No annotation',
      lawGroup: 'NSCP',
      activationCondition: "coreType === 'chb'",
    },
    {
      id: 'single-gypsum-fire-1hr',
      label: 'Single Gypsum Fire Rating',
      codeSection: 'ASTM E119',
      logic: 'coreType === drywall AND gypsumThickness === 12.5 AND gypsumLayers === Single layer',
      dependencies: ['params.coreType', 'params.gypsumThickness', 'params.gypsumLayers'],
      violationVisualization: 'Info annotation — use 5/8" Type X for 1-hour rating',
      passVisualization: 'No annotation',
      lawGroup: 'ASTM',
      activationCondition: "coreType === 'drywall'",
    },
    {
      id: 'height-below-service-min',
      label: 'Minimum Service Room Height',
      codeSection: 'PD 1096 Rule VII §708',
      logic: 'wallHeight < 2100mm',
      dependencies: ['params.wallHeight'],
      violationVisualization: 'Error annotation',
      passVisualization: 'No annotation',
      lawGroup: 'PD 1096',
      activationCondition: 'always',
    },
    {
      id: 'no-insulation-acoustic',
      label: 'Drywall Acoustic Without Insulation',
      codeSection: 'IBC practice (reference)',
      logic: 'coreType === drywall AND showInsulation === false',
      dependencies: ['params.coreType', 'params.showInsulation'],
      violationVisualization: 'Info annotation — STC ~35 without insulation',
      passVisualization: 'No annotation',
      lawGroup: 'IBC (reference)',
      activationCondition: "coreType === 'drywall'",
    },
    {
      id: 'plywood-no-fire-rating',
      label: 'Plywood Combustible — No Fire Rating',
      codeSection: 'RA 9514 IRR',
      logic: 'coreType === plywood',
      dependencies: ['params.coreType'],
      violationVisualization: 'Warning annotation — not suitable for fire-rated assemblies',
      passVisualization: 'N/A — always triggers for plywood',
      lawGroup: 'RA 9514',
      activationCondition: "coreType === 'plywood'",
    },
  ],

  // ===================================================================
  // LEARNING INTEGRATION
  // ===================================================================
  learning: {
    primaryObjective: 'Construct Philippine wall assemblies for 7 core types and estimate material quantities, costs, and performance metrics (fire rating, STC, R-value) using parametric 3D visualization.',
    bloomLevel: 3, // Apply — construct assemblies and estimate costs
    keyValues: [
      'CHB bearing wall minimum 150mm, non-bearing minimum 100mm (NSCP 2015 §702.1)',
      'Minimum habitable room height 2400mm, service rooms 2100mm (PD 1096 Rule VII §708)',
      'Brick wall height exceeding 3600mm requires engineering review (NSCP 2015 §705.2)',
      'CHB blocks per sqm: 12.5 (150x200x400mm)',
      'Standard Philippine finish sequence: Core > Plaster (12.7mm) > Skim Coat (3mm) > Primer (1mm) > Paint (1mm)',
      'CHB max rebar spacing 1200mm, max stiffener spacing 4000mm (NSCP)',
      'Single 1/2" gypsum = 30min fire rating; 5/8" Type X = 1hr (ASTM E119)',
      'Double gypsum adds ~5 STC points; insulation adds ~8 STC points',
      'Plywood partitions have zero fire rating — combustible assembly',
      'Fire rating base: CHB 60min, Drywall 30min, Brick 120min, Solid Concrete 120min',
    ],
    prerequisites: [
      'Basic understanding of Philippine construction materials',
      'Familiarity with wall framing vs masonry construction',
      'Basic understanding of building code compliance concepts',
    ],
    aleQuestionTypes: [
      'dimensional recall — wall thickness, layer thicknesses, material quantities',
      'code compliance — minimum heights, bearing wall requirements',
      'material comparison — performance trade-offs between wall types',
      'cost estimation — material takeoff and BOM calculation',
      'construction sequence — correct layer application order',
    ],
    successCriteria: 'Student can select appropriate wall type for a given scenario, configure structural parameters, identify code violations, estimate material quantities per sqm, and compare performance metrics across wall types.',
    quizIntegration: [
      {
        type: 'post-exploration',
        description: 'After exploring all 7 core types, quiz on which type is appropriate for a given building scenario (bearing vs non-bearing, fire-rated corridor, budget partition, etc.)',
      },
      {
        type: 'in-situ',
        description: 'While viewing a CHB wall, ask about rebar spacing requirements for seismic zones and minimum thickness for bearing walls.',
      },
      {
        type: 'checkpoint',
        description: 'After configuring a drywall partition, ask about fire rating improvement options (Type X gypsum, double layer, insulation) and their STC impacts.',
      },
    ],
  },

  // ===================================================================
  // INTERACTION MAP (BINDINGS)
  // ===================================================================
  bindings: [
    {
      source: { type: 'dropdown', id: 'coreType' },
      storeField: 'params.coreType',
      effects: [
        'WALL_CORE_REGISTRY lookup — resolves thickness, color, structural system, performance baselines',
        'computeWallState() full recomputation — performance, BOM, violations',
        'buildWallGeometry() core dispatch — CHB/drywall/brick/generic sub-builder selection',
        'Parameter visibility change — masonry params show/hide, framing params show/hide',
        'PerformanceDashboard update',
        'BOMPanel update',
        'ComplianceReportPanel update',
      ],
      description: 'Central polymorphic dispatch — coreType change triggers complete state recalculation, geometry rebuild, and UI update. The most impactful single control.',
    },
    {
      source: { type: 'dropdown', id: 'viewMode' },
      storeField: 'params.viewMode',
      effects: [
        'section-cut: finish layer opacity reduced to 0.4',
        'exploded: finish layers offset in Z by explodePercent * index * 0.15m gap',
        'build-sequence: geometry filtered to visible IDs at current step',
        'compare: ComparisonDashboard shown in right panel',
      ],
      description: 'View mode changes geometry presentation without recomputing wall state. Driven by ViewModeButtonStrip (not GenericControlPanel dropdown).',
    },
    {
      source: { type: 'slider', id: 'wallLength' },
      storeField: 'params.wallLength',
      effects: ['wallAreaSqm recalc', 'BOM recalc', 'geometry resize (all objects scaled in X)', 'violation check: chb-length-no-stiffener'],
      description: 'Wall length affects area, cost, BOM quantities, and stiffener column requirement.',
    },
    {
      source: { type: 'slider', id: 'wallHeight' },
      storeField: 'params.wallHeight',
      effects: ['wallAreaSqm recalc', 'BOM recalc', 'geometry resize (all objects scaled in Y)', 'violation check: height-below-min, height-below-service-min, brick-load-bearing'],
      description: 'Wall height affects area, cost, and multiple height-related code violations.',
    },
    {
      source: { type: 'dropdown', id: 'sides' },
      storeField: 'params.sides',
      effects: ['Layer mirroring (back face layers added/removed)', 'BOM finishSideMultiplier', 'Performance: plaster/gypsum bonuses doubled', 'totalThickness recalc'],
      description: 'Finished sides toggle doubles finish layer quantities and performance bonuses.',
    },
    {
      source: { type: 'toggle', id: 'showPlaster' },
      storeField: 'params.showPlaster',
      effects: ['layer-front-plaster visibility', 'layer-back-plaster visibility (if bothSides)', 'Fire rating: +15min per side', 'STC: +2 per side', 'BOM: plaster volume', 'totalThickness recalc'],
      description: 'Plaster layer affects all 4 performance metrics and BOM.',
    },
    {
      source: { type: 'toggle', id: 'showSkimCoat' },
      storeField: 'params.showSkimCoat',
      effects: ['layer-front-skim visibility', 'BOM: skim coat bags', 'totalThickness recalc'],
      description: 'Skim coat adds 3mm thickness and BOM cost.',
    },
    {
      source: { type: 'toggle', id: 'showPrimer' },
      storeField: 'params.showPrimer',
      effects: ['layer-front-primer visibility', 'BOM: primer liters', 'Painter labor days'],
      description: 'Primer layer adds BOM cost and contributes to painter labor calculation.',
    },
    {
      source: { type: 'toggle', id: 'showPaint' },
      storeField: 'params.showPaint',
      effects: ['layer-front-paint visibility', 'BOM: paint liters (2 coats)', 'Painter labor days'],
      description: 'Paint layer adds BOM cost (2 coats at 9 sqm/liter/coat).',
    },
    {
      source: { type: 'dropdown', id: 'paintColor' },
      storeField: 'params.paintColor',
      effects: ['Paint layer color change (PAINT_COLORS lookup)'],
      description: 'Changes paint layer color. No structural or cost impact.',
    },
    {
      source: { type: 'toggle', id: 'showReinforcement' },
      storeField: 'params.showReinforcement',
      effects: ['struct-chb-rebar-v visibility', 'struct-chb-rebar-h visibility', 'struct-chb-grout visibility', 'struct-chb-bond-beam-[i] visibility', 'Fire rating: grouting bonus (+60min partial)', 'BOM: rebar pieces', 'violation: chb-no-reinforcement'],
      description: 'CHB reinforcement toggle controls structural element visibility, fire rating grouting bonus, and seismic compliance.',
    },
    {
      source: { type: 'toggle', id: 'showInsulation' },
      storeField: 'params.showInsulation',
      effects: ['struct-drywall-insulation visibility', 'STC: +8 points', 'R-value: +0.035 * studDepthMm', 'BOM: insulation sqm', 'violation: no-insulation-acoustic'],
      description: 'Insulation toggle affects acoustic performance, thermal resistance, and BOM cost.',
    },
    {
      source: { type: 'toggle', id: 'showMEP' },
      storeField: 'params.showMEP',
      effects: ['mep-conduit visibility', 'mep-outlet-convenience visibility', 'mep-switch-box visibility', 'mep-plumbing-hot/cold visibility (if studDepth >= 140mm)'],
      description: 'MEP toggle shows electrical and plumbing elements within framed wall cavity.',
    },
    {
      source: { type: 'toggle', id: 'showConnections' },
      storeField: 'params.showConnections',
      effects: ['conn-chb-slab-dowels visibility (CHB)', 'conn-chb-column-lbars visibility (CHB)', 'conn-drywall-floor-fasteners visibility (drywall)', 'conn-drywall-deflection-gap visibility (drywall)'],
      description: 'Connection details toggle shows wall-to-structure interface elements.',
    },
    {
      source: { type: 'slider', id: 'explodeAmount' },
      storeField: 'params.explodeAmount',
      effects: ['Finish layer Z offsets scaled by explodePercent * index * 0.15m', 'Labels appear when explodePercent > 30%'],
      description: 'Explode slider separates finish layers in Z axis for visualization.',
    },
    {
      source: { type: 'slider', id: 'buildStep' },
      storeField: 'params.buildStep',
      effects: ['Geometry filtered to IDs in getBuildSteps(coreType)[step-1].visibleIds'],
      description: 'Build step slider progressively reveals construction sequence (CHB: 8 steps, Drywall: 8 steps, Generic: 6 steps).',
    },
    {
      source: { type: 'preset', id: 'preset-selector' },
      storeField: 'params.*',
      effects: ['All parameter overrides applied atomically', 'Full recomputation triggered'],
      description: 'Preset selection applies all parameter values from the preset definition, triggering complete state rebuild.',
    },
  ],

  // ===================================================================
  // CAMERA PRESETS
  // ===================================================================
  cameraPresets: [
    {
      id: 'default-perspective',
      label: 'Default',
      position: [7, 2.5, 5.5],
      lookAt: [0, 1.5, 0],
      transitionDuration: 500,
      orthographic: false,
    },
    {
      id: 'front-elevation',
      label: 'Front',
      position: [0, 1.5, 8],
      lookAt: [0, 1.5, 0],
      transitionDuration: 500,
      orthographic: false,
    },
    {
      id: 'section-view',
      label: 'Section',
      position: [5, 1.5, 0],
      lookAt: [0, 1.5, 0],
      transitionDuration: 500,
      orthographic: false,
    },
    {
      id: 'top-down',
      label: 'Top',
      position: [0, 8, 0.1],
      lookAt: [0, 0, 0],
      transitionDuration: 500,
      orthographic: false,
    },
  ],

  // ===================================================================
  // KEYBOARD SHORTCUTS
  // ===================================================================
  shortcuts: [
    { key: '1', action: 'Set viewMode to overview', description: 'Overview mode' },
    { key: '2', action: 'Set viewMode to section-cut', description: 'Section cut mode' },
    { key: '3', action: 'Set viewMode to exploded', description: 'Exploded view mode' },
    { key: '4', action: 'Set viewMode to build-sequence', description: 'Build sequence mode' },
    { key: '5', action: 'Set viewMode to compare', description: 'Compare mode' },
    { key: 'G', action: 'Toggle grid overlay', description: 'Toggle grid' },
  ],

  // ===================================================================
  // PRESETS
  // Source: wall-presets.ts — 12 presets (7 original + 5 structural)
  // ===================================================================
  presets: [
    {
      id: 'standard-chb-room',
      label: 'Standard CHB Room',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'chb', wallLength: 5000, wallHeight: 3000, sides: '1 Side',
        showPlaster: true, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
        rebarSpacing: 800, rebarDiameter: '12', bondBeamInterval: 'Every 3rd course', chbSize: '150', showReinforcement: true,
      },
      teachingPoint: 'Standard Philippine CHB residential wall — 150mm bearing wall with 12mm rebar at 800mm, bond beams every 3rd course, full plaster + paint finish.',
    },
    {
      id: 'drywall-office-partition',
      label: 'Drywall Office Partition',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'drywall', wallLength: 3000, wallHeight: 2700, sides: 'Both Sides',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Light Gray',
        studSpacing: '600', studDepth: '92', gypsumThickness: '12.5', gypsumLayers: 'Single layer', showInsulation: false, showBridging: false,
      },
      expectedViolations: ['no-insulation-acoustic', 'single-gypsum-fire-1hr'],
      teachingPoint: 'Basic office drywall — note the low STC (~35) without insulation and 30-minute fire rating with single 1/2" gypsum.',
    },
    {
      id: 'plywood-temp-partition',
      label: 'Plywood Temp Partition',
      category: 'edge-case',
      parameterOverrides: {
        coreType: 'plywood', wallLength: 2400, wallHeight: 2700, sides: '1 Side',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Cream',
        studSpacing: '600', studDepth: '64', showInsulation: false, showBridging: false,
      },
      expectedViolations: ['plywood-no-fire-rating'],
      teachingPoint: 'Combustible plywood partition — zero fire rating, lowest STC, lowest cost. Not suitable for fire-rated assemblies.',
    },
    {
      id: 'hardieflex-exterior',
      label: 'HardieFlex Exterior',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'cement-board', wallLength: 4000, wallHeight: 3000, sides: 'Both Sides',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Warm Beige',
        studSpacing: '600', studDepth: '92', showInsulation: false, showBridging: false,
      },
      teachingPoint: 'HardieFlex cement board — good moisture resistance, 1-hour fire rating with Type X backing, common for Philippine exterior walls.',
    },
    {
      id: 'brick-feature-wall',
      label: 'Brick Feature Wall',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'brick', wallLength: 3000, wallHeight: 3000, sides: '1 Side',
        showPlaster: true, showSkimCoat: true, showPrimer: true, showPaint: true, paintColor: 'Sage Green',
      },
      teachingPoint: 'Brick feature wall — 2-hour fire rating, STC 50, full finish sequence with skim coat for smooth paint surface.',
    },
    {
      id: 'concrete-basement',
      label: 'Concrete Basement',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'solid-concrete', wallLength: 5000, wallHeight: 3000, sides: 'Both Sides',
        showPlaster: true, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
      },
      teachingPoint: 'Solid concrete basement wall — 2-hour fire rating, highest cost per sqm, used for structural/below-grade applications.',
    },
    {
      id: 'quick-repaint',
      label: 'Quick Repaint',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'existing-wall', wallLength: 4000, wallHeight: 3000, sides: '1 Side',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Sky Blue',
      },
      teachingPoint: 'Existing wall repaint scenario — no core material cost, only primer + paint finish. Useful for renovation estimating.',
    },
    {
      id: 'chb-with-reinforcement',
      label: 'CHB with Reinforcement',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'chb', wallLength: 5000, wallHeight: 3000, sides: 'Both Sides',
        showPlaster: true, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
        rebarSpacing: 800, rebarDiameter: '12', bondBeamInterval: 'Every 3rd course', chbSize: '150', showReinforcement: true,
      },
      teachingPoint: 'Both-sides CHB with full reinforcement visible — demonstrates complete seismic-compliant wall assembly.',
    },
    {
      id: 'drywall-with-framing',
      label: 'Drywall with Framing',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'drywall', wallLength: 4000, wallHeight: 2700, sides: 'Both Sides',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
        studSpacing: '600', studDepth: '92', gypsumThickness: '12.5', gypsumLayers: 'Single layer', showInsulation: true, showBridging: true,
      },
      expectedViolations: ['single-gypsum-fire-1hr'],
      teachingPoint: 'Drywall with insulation and bridging — improved STC (~43) and thermal performance. Bridging prevents stud rotation.',
    },
    {
      id: 'fire-rated-corridor',
      label: 'Fire-Rated Corridor',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'drywall', wallLength: 5000, wallHeight: 3000, sides: 'Both Sides',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Light Gray',
        studSpacing: '600', studDepth: '92', gypsumThickness: '15.9', gypsumLayers: 'Double layer', showInsulation: true, showBridging: true,
      },
      teachingPoint: 'Fire-rated corridor wall — double 5/8" Type X gypsum + insulation. 2-hour fire rating, STC ~48. Meets RA 9514 corridor separation requirements.',
    },
    {
      id: 'bathroom-wall',
      label: 'Bathroom Wall (6" studs)',
      category: 'compliant',
      parameterOverrides: {
        coreType: 'drywall', wallLength: 3000, wallHeight: 2700, sides: 'Both Sides',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'White',
        studSpacing: '400', studDepth: '150', gypsumThickness: '15.9', gypsumLayers: 'Single layer', showInsulation: true, showBridging: false,
      },
      teachingPoint: 'Bathroom wall with 6" studs — deeper cavity accommodates plumbing supply lines. 400mm stud spacing for added stiffness.',
    },
    {
      id: 'budget-partition',
      label: 'Budget Partition',
      category: 'edge-case',
      parameterOverrides: {
        coreType: 'plywood', wallLength: 3000, wallHeight: 2700, sides: '1 Side',
        showPlaster: false, showSkimCoat: false, showPrimer: true, showPaint: true, paintColor: 'Cream',
        studSpacing: '600', studDepth: '64', showInsulation: false, showBridging: false,
      },
      expectedViolations: ['plywood-no-fire-rating'],
      teachingPoint: 'Lowest-cost partition option — plywood on 2.5" studs. No fire rating, poor acoustics, but fast installation and minimal material cost.',
    },
  ],

  // ===================================================================
  // PERFORMANCE METRICS (schema extension v1.2.0)
  // Source: PerformanceDashboard.tsx + wall-constants-performance.ts
  // ===================================================================
  performanceMetrics: [
    {
      id: 'fire-rating',
      label: 'Fire Rating',
      unit: 'minutes',
      computationSource: 'computePerformance() -> fireRatingMinutes. Base from FIRE_RATING_BASE[coreType] + FIRE_RATING_BONUSES (gypsum, grouting, plaster).',
      colorScale: [
        { threshold: 120, status: 'good' },
        { threshold: 60, status: 'warning' },
        { threshold: 0, status: 'danger' },
      ],
    },
    {
      id: 'stc-rating',
      label: 'Acoustic (STC)',
      unit: 'STC points',
      computationSource: 'computePerformance() -> stcRating. Base from STC_BASE[coreType] + STC_BONUSES (insulation +8, surface seal +2/side, double gypsum +5).',
      colorScale: [
        { threshold: 50, status: 'good' },
        { threshold: 35, status: 'warning' },
        { threshold: 0, status: 'danger' },
      ],
    },
    {
      id: 'cost-per-sqm',
      label: 'Cost/sqm',
      unit: 'PHP',
      computationSource: 'WALL_CORE_REGISTRY[coreType].baseCostPerSqm. Full detail from computeBOM().',
      colorScale: [
        { threshold: 2000, status: 'good' },
        { threshold: 3500, status: 'warning' },
        { threshold: 99999, status: 'danger' },
      ],
    },
    {
      id: 'r-value',
      label: 'Thermal (R-value)',
      unit: 'R',
      computationSource: 'computePerformance() -> rValue. Base from R_VALUE_BASE[coreType] + insulation bonus (0.035 * studDepthMm).',
      colorScale: [
        { threshold: 3.0, status: 'good' },
        { threshold: 1.5, status: 'warning' },
        { threshold: 0, status: 'danger' },
      ],
    },
  ],

  // ===================================================================
  // BILL OF MATERIALS (schema extension v1.2.0)
  // Source: BOMPanel.tsx + wall-computation.ts computeBOM()
  // ===================================================================
  billOfMaterials: {
    computationSource: 'features/3d-lab/config/modules/10-materials/wall-computation.ts -> computeBOM()',
    groups: ['core', 'structural', 'finish', 'labor', 'waste'],
    priceDisclaimer: 'Prices are approximate Metro Manila rates as of 2026-04. Actual prices vary by region and supplier.',
    priceRegion: 'Metro Manila',
    priceLastUpdated: '2026-04',
  },

  // ===================================================================
  // VIEW MODES (schema extension v1.2.0)
  // Source: wall-geometry.ts view mode handling + ViewModeButtonStrip.tsx
  // ===================================================================
  viewModes: [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Default view showing complete wall assembly with all enabled layers and structural elements.',
      geometryEffect: 'No transformation — all geometry rendered at computed positions.',
    },
    {
      id: 'section-cut',
      label: 'Section Cut',
      description: 'Transparent section view to see internal structure through finish layers.',
      geometryEffect: 'Finish layer opacity reduced to 0.4. Core and structural elements remain fully opaque.',
    },
    {
      id: 'exploded',
      label: 'Exploded',
      description: 'Finish layers separated in Z-axis to visualize layer-by-layer build-up.',
      geometryEffect: 'Each finish layer offset in Z by explodePercent * (index + 1) * 0.15m. Labels appear when explodePercent > 30%. Controlled by explodeAmount slider (0–100%).',
    },
    {
      id: 'build-sequence',
      label: 'Build Sequence',
      description: 'Step-by-step construction sequence showing progressive assembly (CHB: 8 steps, Drywall: 8 steps, Generic: 6 steps).',
      geometryEffect: 'Geometry filtered to only IDs in getBuildSteps(coreType)[currentStep-1].visibleIds. Controlled by buildStep slider (1–8).',
    },
    {
      id: 'compare',
      label: 'Compare',
      description: 'Side-by-side performance comparison between active core type and a selected comparison type.',
      geometryEffect: 'No geometry change — comparison is shown in ComparisonDashboard in right panel.',
      // GAP: Compare mode does not render a second wall geometry side-by-side in 3D viewport
    },
  ],
}
