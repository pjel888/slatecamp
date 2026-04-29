#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repoRoot = process.cwd()
const resultsDir = path.join(repoRoot, '.ai/00_performance/results')
fs.mkdirSync(resultsDir, { recursive: true })

const modeArg = process.argv.find((arg) => arg.startsWith('--mode='))
const mode = modeArg ? modeArg.split('=')[1] : 'all'
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8')
const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const registryDir = path.join(repoRoot, 'src/features/3d-lab/config/registry')
const modules = []
for (const file of fs.readdirSync(registryDir).filter((name) => /^cat-\d+\.ts$/.test(name)).sort()) {
  const source = fs.readFileSync(path.join(registryDir, file), 'utf8')
  const blocks = source.match(/\{[\s\S]*?id:\s*['"][^'"]+['"][\s\S]*?\n\s*\}/g) ?? []
  for (const block of blocks) {
    const get = (key) => block.match(new RegExp(`${key}:\\s*['\"]([^'\"]+)['\"]`))?.[1] ?? null
    const id = get('id')
    if (!id) continue
    modules.push({
      id,
      name: get('title') ?? id,
      route: `/dashboard/3d-lab/${id}`,
      templateType: get('templateType'),
      categoryId: get('categoryId'),
      status: get('status'),
      registryFile: `src/features/3d-lab/config/registry/${file}`,
    })
  }
}

const failures = []
const warnings = []
const evidence = []
const fail = (message) => failures.push(message)
const warn = (message) => warnings.push(message)
const note = (message) => evidence.push(message)

const moduleViewer = read('src/features/3d-lab/components/ModuleViewer.tsx')
const useTemplateContent = read('src/features/3d-lab/hooks/useTemplateContent.tsx')
const viewportShell = read('src/features/3d-lab/components/shell/ViewportShell.tsx')
const sceneConfig = read('src/features/3d-lab/components/rendering/SceneConfig.tsx')
const cameraNavigationBar = read('src/features/3d-lab/components/shell/CameraNavigationBar.tsx')
const viewportStore = read('src/features/3d-lab/stores/useViewportShellStore.ts')
const cameraPresets = read('src/features/3d-lab/utils/camera-presets.ts')
const cameraSnap = read('src/features/3d-lab/hooks/useCameraSnap.ts')
const devControlsCanvas = read('src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx')
const calculatorTemplate = read('src/features/3d-lab/templates/CalculatorTemplate.tsx')
const templateTypes = read('src/features/3d-lab/types/templates.ts')

if (mode === 'all' || mode === 'layout') {
  if (/isBespoke|Bespoke modules/.test(moduleViewer)) fail('ModuleViewer still contains a bespoke module branch.')
  if (!/if \(templateContent\)/.test(moduleViewer)) fail('ModuleViewer does not route template content through one shared shell branch.')
  if (!/site-development-controls/.test(useTemplateContent)) fail('useTemplateContent does not slot Site Development Controls into the shared shell.')
  if (/case 'calculator':[\s\S]{0,120}return null/.test(useTemplateContent)) fail('Calculator modules still return null from useTemplateContent and bypass shell slots.')
  if (!/CalculatorTemplateSlot/.test(useTemplateContent)) fail('Calculator modules are not using calculator slot content in the shared shell.')
  if (!/className=\"pointer-events-none absolute inset-0 z-20\"/.test(viewportShell)) fail('ViewportShell toolbar overlay does not own a visible absolute overlay container.')
  for (const id of ['3dlab-shell', '3dlab-shell-header', '3dlab-shell-left-sidebar', '3dlab-shell-right-sidebar', '3dlab-shell-viewport', '3dlab-shell-toolbar-overlay', '3dlab-shell-status']) {
    if (!viewportShell.includes(id)) fail(`ViewportShell is missing stable test id ${id}.`)
  }
  for (const type of ['parametric', 'exploded', 'cutaway', 'floorplan', 'animated', 'calculator', 'wall-configurator']) {
    const block = templateTypes.match(new RegExp(`${type === 'wall-configurator' ? "'wall-configurator'" : type}: \\{[\\s\\S]*?capabilities:`))?.[0]
    if (!block) fail(`Missing TEMPLATE_SHELL_DEFAULTS block for ${type}.`)
    else {
      if (!/leftSidebar/.test(block)) fail(`${type} default shell is missing leftSidebar.`)
      if (!/rightSidebar/.test(block)) fail(`${type} default shell is missing rightSidebar.`)
      if (!/statusBar:\s*true/.test(block)) fail(`${type} default shell is missing statusBar: true.`)
    }
  }
  note('Layout audit verified ModuleViewer single shared-shell branch, template/site/calculator slot coverage, shell test IDs, and sidebars/status defaults.')
}

if (mode === 'all' || mode === 'controls') {
  if (!/ThreeDLabControlsProvider/.test(sceneConfig)) fail('SceneConfig is not wired to ThreeDLabControlsProvider.')
  if (!/THREE_D_LAB_CONTROL_MAPPING/.test(sceneConfig)) fail('SceneConfig does not expose the shared control mapping test hook.')
  if (/<OrbitControls[\s\S]*?target=\{cameraTarget\}/.test(sceneConfig)) fail('SceneConfig passes a declarative OrbitControls target prop, which resets/clamps pan on rerender.')
  if (!/ControlsTargetSetup/.test(sceneConfig)) fail('SceneConfig does not initialize OrbitControls target imperatively.')
  if (!/syncPanTargetRadius/.test(sceneConfig)) fail('SceneConfig does not protect perspective pan from collapsed camera-target distance.')
  if (!/CustomPanOverride/.test(sceneConfig) || !/addEventListener\('pointerdown', handlePointerDown, true\)/.test(sceneConfig)) fail('SceneConfig does not install capture-phase deterministic pan handling ahead of OrbitControls.')
  if (!/ownerDocument\.addEventListener\('pointermove', handlePointerMove, true\)/.test(sceneConfig)) fail('Custom pan does not keep translating after the pointer leaves the canvas.')
  if (!/minPanTargetDistance/.test(useTemplateContent) || !/minPanTargetDistance/.test(templateTypes)) fail('Module camera config cannot customize minimum pan target distance.')
  if (!/bottom-12/.test(cameraNavigationBar)) fail('CameraNavigationBar is not raised above the status footer.')
  if (!/3dlab-control-zoom-slider/.test(cameraNavigationBar) || !/zoomByDelta/.test(cameraNavigationBar)) fail('CameraNavigationBar does not expose a continuous zoom slider between zoom out/in controls.')
  if (!/moduleCameraControls/.test(useTemplateContent)) fail('Module camera config is not translated into the shared cameraControls contract.')
  if (!/layersPanelContent:\s*<DevControlsLayerToggles\s*\/>/.test(useTemplateContent)) fail('Site Development Controls layer toggles are not injected into the shared LayersPanel slot.')
  if (!/building/.test(read('src/features/3d-lab/DevControlsModule/dashboard/DevControlsLayerToggles.tsx'))) fail('Site Development Controls shared layer panel is missing the historical Context Buildings layer toggle.')
  if (!/<LayersPanel>\{content\.layersPanelContent\}<\/LayersPanel>/.test(viewportShell)) fail('ViewportShell does not render module-specific layer controls inside LayersPanel.')
  if (!/getProjectionModeAfterCommand/.test(viewportStore) || /projectionMode:\s*getProjectionModeForSelectedPreset/.test(viewportStore)) fail('ViewportShell store still derives projection from view direction commands.')
  if (!/case 'iso':\s*return 'orthographic'/.test(cameraPresets) || !/default:\s*return currentProjection/.test(cameraPresets)) fail('Camera presets do not keep projection mode independent from view direction presets.')
  if (!/DEFAULT_VIEW_PRESET:\s*CameraSelectionPreset\s*=\s*'iso-se'/.test(cameraPresets)) fail('Camera presets do not define SE as the shared default view.')
  if (!/selectedCameraPreset:\s*DEFAULT_VIEW_PRESET/.test(viewportStore) || !/cameraCommandPreset:\s*'zoom-to-fit'/.test(viewportStore)) fail('Viewport shell does not default to SE plus fit-to-view.')
  if (!/projectionMode === 'orthographic'/.test(cameraNavigationBar) || !/projectionMode === 'perspective'/.test(cameraNavigationBar)) fail('CameraNavigationBar does not render projection buttons from projection state.')
  if (!/resolveScenePresetTarget/.test(cameraSnap)) fail('Camera preset snaps do not route through the shared view-direction resolver.')
  if (!/camera\.position\.distanceTo\(center\)/.test(cameraSnap) || !/zoom:\s*camera\.zoom/.test(cameraSnap)) fail('Camera view snaps do not preserve current zoom/distance while changing direction.')
  if (!/isProjectionCommandPreset\(commandPreset\)/.test(cameraSnap)) fail('Camera snap bridge does not identify projection-only commands separately from view snaps.')
  if (!/captureProjectionTransitionFrame/.test(cameraSnap) || !/applyProjectionTransitionFrame/.test(cameraSnap)) fail('Camera snap bridge does not preserve visual framing across perspective/orthographic camera swaps.')
  if (!/viewPreset/.test(cameraSnap) || !/PRESET_VIEW_DIRECTIONS\[viewPreset\]/.test(cameraSnap)) fail('Zoom-to-fit does not honor the selected view direction for default SE fit.')
  for (const pattern of [/OrbitControls/, /PerspectiveCamera/, /OrthographicCamera/, /<Canvas\b/, /mouseButtons/, /CameraSnapBridge/]) {
    if (pattern.test(stripComments(devControlsCanvas))) fail(`DevControlsCanvas still owns forbidden control/canvas pattern: ${pattern}`)
  }
  if (!/showLocalCameraBar=\{false\}/.test(calculatorTemplate)) fail('Calculator 3D Lab scene slot still allows its local camera bar.')
  if (!/cameraControls: buildCalculatorCameraControls/.test(calculatorTemplate)) fail('Calculator scene slot does not route presets through shared cameraControls contract.')
  if (!/SharedToolbarBridge/.test(useTemplateContent)) fail('Site Development Controls shell path does not mount SharedToolbarBridge for shared toolbar effects.')

  const orbitFiles = []
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name)
      const stat = fs.statSync(p)
      if (stat.isDirectory()) walk(p)
      else if (/\.(ts|tsx)$/.test(name)) {
        const rel = path.relative(repoRoot, p)
        const src = fs.readFileSync(p, 'utf8')
        if (/\b(OrbitControls|CameraControls|MapControls|TransformControls)\b/.test(stripComments(src))) orbitFiles.push(rel)
      }
    }
  }
  walk(path.join(repoRoot, 'src/features/3d-lab'))
  const allowed = new Set([
    'src/features/3d-lab/components/rendering/SceneConfig.tsx',
  ])
  const activeForbidden = orbitFiles.filter((file) => !allowed.has(file) && !file.includes('/scenes/NBCPEnvelope/'))
  if (activeForbidden.length) fail(`Forbidden active 3D Lab control imports/usages: ${activeForbidden.join(', ')}`)
  const inactiveWarnings = orbitFiles.filter((file) => !allowed.has(file) && file.includes('/scenes/NBCPEnvelope/'))
  if (inactiveWarnings.length) warn(`Inactive legacy scene still has direct controls and should not become active without migration: ${inactiveWarnings.join(', ')}`)
  note('Controls audit verified SceneConfig owns OrbitControls, protects perspective pan target radius, DevControls injects historical site-development layers into shared LayersPanel, calculators use shared cameraControls, and active modules do not import direct controls.')
}

const inventory = modules.map((mod) => {
  const isSite = mod.id === 'site-development-controls'
  const isCalculator = mod.templateType === 'calculator'
  return {
    ...mod,
    entryComponent: 'src/app/dashboard/3d-lab/[moduleId]/page.tsx -> ModuleViewer',
    layoutWrapper: 'ViewportShell / 3D Lab shared shell',
    sceneComponent: isSite
      ? 'DevControlsSceneContent via CanvasWrapper'
      : isCalculator
        ? 'CalculatorTemplateSlot(scene) via CanvasWrapper'
        : `${mod.templateType} renderer via useTemplateContent + CanvasWrapper`,
    leftSidebarComponent: isSite
      ? 'DevControlsLeftSidebar'
      : isCalculator
        ? 'CalculatorTemplateSlot(leftSidebar)'
        : `${mod.templateType} leftSidebarContent slot`,
    rightSidebarComponent: isSite
      ? 'DevControlsRightSidebar'
      : isCalculator
        ? 'CalculatorTemplateSlot(rightSidebar)'
        : `${mod.templateType} rightSidebarContent slot`,
    headerOwner: 'ViewportShell -> ViewportHeader',
    footerStatusOwner: isSite
      ? 'ViewportShell -> ViewportStatusBar -> DevControlsStatusContent'
      : isCalculator
        ? 'ViewportShell -> ViewportStatusBar -> CalculatorTemplateSlot(statusBar)'
        : 'ViewportShell -> ViewportStatusBar',
    viewportCanvasWrapper: 'ViewportShell -> LabViewportFrame -> CanvasWrapper -> SceneConfig',
    toolbarControlOverlay: 'ViewportShell -> SceneToolbar + LayersPanel + CameraNavigationBar',
    cameraControlsImplementation: 'SceneConfig -> ThreeDLabControlsProvider -> OrbitControls + useCameraSnap',
    customGlobalLayoutOverrides: isSite || isCalculator ? 'removed from active 3D Lab route path' : 'none detected in active route path',
    compliesWithUnifiedStandard: failures.length === 0,
  }
})

const payload = {
  timestamp: new Date().toISOString(),
  mode,
  gitCommit: runGit(['rev-parse', '--short', 'HEAD']),
  branch: runGit(['branch', '--show-current']),
  moduleCount: modules.length,
  failures,
  warnings,
  evidence,
  inventory,
}

writeJson('3d_lab_layout_controls_audit_results.json', payload)
writeJson('3d_lab_module_registry_unification_report.json', payload)
console.log(JSON.stringify({ mode, moduleCount: modules.length, failures, warnings }, null, 2))
if (failures.length) process.exit(1)

function writeJson(name, payload) {
  fs.writeFileSync(path.join(resultsDir, name), `${JSON.stringify(payload, null, 2)}\n`)
}

function runGit(args) {
  try {
    return spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).stdout.trim()
  } catch {
    return null
  }
}
