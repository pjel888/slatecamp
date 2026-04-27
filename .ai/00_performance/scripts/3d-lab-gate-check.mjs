import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const resultsDir = path.join(root, '.ai/00_performance/results')
const resultFile = path.join(resultsDir, '3d_lab_gate_check_results.json')
const mode = process.env.PERF_3D_GATE_MODE === 'hard' ? 'hard' : 'warning'

const readJson = (file) => {
  const full = path.isAbsolute(file) ? file : path.join(root, file)
  return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : null
}

const repeat = readJson(path.join(resultsDir, '3d_lab_built_auth_repeat_results.json'))
const smoke = readJson(path.join(resultsDir, '3d_lab_module_smoke_results.json'))
const mobile = readJson(path.join(resultsDir, '3d_lab_mobile_webgl_results.json'))
const onboarding = readJson(path.join(resultsDir, '3d_lab_onboarding_overlay_results.json'))
const consolePolicy = readJson(path.join(resultsDir, '3d_lab_console_policy_results.json'))
const fallbacks = readJson(path.join(resultsDir, '3d_lab_fallback_results.json'))

const warnings = []
const failures = []
const assertGate = (condition, message) => {
  if (condition) return
  if (mode === 'hard') failures.push(message)
  else warnings.push(message)
}

assertGate(Boolean(repeat), 'Missing 3d_lab_built_auth_repeat_results.json')
assertGate((repeat?.summary?.completedPasses ?? 0) >= 3, 'Fewer than three built-auth 3D passes completed')
assertGate(!repeat?.summary?.warningOnlyRegression, 'Built-auth repeated pass regression exceeded warning threshold')
assertGate(Boolean(smoke), 'Missing 3d_lab_module_smoke_results.json')
assertGate((smoke?.measurements ?? []).length > 0, 'Module smoke did not measure any modules')
assertGate(!(smoke?.measurements ?? []).some((run) => run.ok === false), 'Module smoke recorded failed route measurements')
assertGate(!(smoke?.measurements ?? []).some((run) => run.criticalErrors?.length), 'Module smoke recorded critical console/runtime errors')
assertGate(Boolean(mobile), 'Missing 3d_lab_mobile_webgl_results.json')
assertGate(!(mobile?.measurements ?? []).some((run) => run.ok === false), 'Mobile WebGL pass recorded failed route measurements')
assertGate(!(mobile?.measurements ?? []).some((run) => run.criticalErrors?.length), 'Mobile WebGL pass recorded critical console/runtime errors')
assertGate(Boolean(onboarding), 'Missing 3d_lab_onboarding_overlay_results.json')
assertGate(!(onboarding?.measurements ?? []).some((run) => run.ok === false), 'Onboarding pass recorded failed route measurements')
assertGate(!(onboarding?.measurements ?? []).some((run) => (run.browserMetrics?.onboarding?.activeTutorialSurfaces ?? 0) > 1), 'Onboarding displayed more than one active tutorial surface')
assertGate(!(consolePolicy?.summary?.measurementsWithCriticalErrors > 0), '3D console policy recorded critical errors')
assertGate(Boolean(fallbacks), 'Missing 3d_lab_fallback_results.json')
assertGate((fallbacks?.measurements ?? []).length >= 3, 'Fallback pass did not cover unsupported WebGL, context loss, and slow-scene states')
assertGate((fallbacks?.measurements ?? []).some((run) => (run.browserMetrics?.webglUnavailableVisible ?? 0) > 0), 'Unsupported WebGL fallback was not observed')
assertGate((fallbacks?.measurements ?? []).some((run) => (run.browserMetrics?.webglRecoveryVisible ?? 0) > 0), 'WebGL context-loss recovery fallback was not observed')
assertGate((fallbacks?.measurements ?? []).some((run) => (run.browserMetrics?.slowSceneNoticeVisible ?? 0) > 0), 'Slow-scene fallback was not observed')

const payload = {
  timestamp: new Date().toISOString(),
  mode,
  success: failures.length === 0,
  warnings,
  failures,
  inputs: {
    repeat: Boolean(repeat),
    smoke: Boolean(smoke),
    mobile: Boolean(mobile),
    onboarding: Boolean(onboarding),
    consolePolicy: Boolean(consolePolicy),
    fallbacks: Boolean(fallbacks),
  },
  notes: [
    'Default mode is warning-only. Set PERF_3D_GATE_MODE=hard only after at least three comparable stable CI baselines.',
    'This check reads existing JSON artifacts and does not run browser tests by itself.',
  ],
}

fs.writeFileSync(resultFile, `${JSON.stringify(payload, null, 2)}\n`)
console.log(JSON.stringify(payload, null, 2))
process.exit(failures.length ? 1 : 0)
