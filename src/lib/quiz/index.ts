// ─── Quiz Engine v2: Barrel Export ───────────────────────────────────────────

export { MODE_PRESETS, MODE_LABELS, mergeWithPreset, getScoreBand, getNextDifficulty } from './mode-presets'
export { createAdaptiveState, updateAdaptiveState, getDifficultyLabel, masteryToDifficulty } from './adaptive-difficulty'
export { analyzeStamina, detectFatigue } from './stamina-analysis'
export { computeCalibration } from './confidence-calibration'
export { buildQuestionSelectionQuery, stripQuestionForClient, LEA_AREA_DISTRIBUTION } from './question-selection'
