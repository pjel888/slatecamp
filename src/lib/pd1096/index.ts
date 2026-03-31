// src/lib/pd1096/index.ts
// ─── Barrel export for PD 1096 computation engine ──────────────────────────

export { computeDevControls } from './computationEngine'
export { computeSetbacks } from './computeSetbacks'
export { ClosureIdentityViolationError } from './errors'

export {
  ZONING_TABLE,
  RESIDENTIAL_SETBACKS,
  COMMERCIAL_SETBACK_BANDS,
  RROW_BHL_BANDS,
  TGFA_MULTIPLIER,
  CITATIONS,
  getZoningEntry,
  isResidentialZone,
  lookupRrowBhl,
  lookupCommercialSetbacks,
  lookupPSO,
  lookupFLAR,
  lookupTGFAMultiplier,
  getAllZoneClasses,
} from './zoningTables'

export type {
  ZoneClass,
  LotType,
  LabMode,
  CameraPreset,
  LayerKey,
  FirewallSide,
  LotParams,
  ZoningParams,
  BuildingParams,
  RROWParams,
  DevControlsInput,
  PerSideSetbacks,
  SetbackResult,
  AMBFCandidates,
  ComplianceCheck,
  DevControlsResult,
  ExamProblem,
} from './types'
