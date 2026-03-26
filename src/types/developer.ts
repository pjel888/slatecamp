/* ------------------------------------------------------------------ */
/*  Developer Hub — Type Definitions                                   */
/* ------------------------------------------------------------------ */

/** Single row in a component's props documentation table. */
export interface PropsTableEntry {
  name: string
  type: string
  defaultValue: string | null
  required: boolean
  description: string
}

/** Lightweight metadata used for sidebar navigation and search. */
export interface ComponentMeta {
  slug: string
  title: string
  description: string
  domain: 'wiki' | 'questions' | 'testing-path' | 'shared' | 'content-blocks' | 'widgets' | 'notifications' | 'quiz-v2' | 'dashboard' | 'analytics' | 'trails' | 'flash'
  status: 'stable' | 'beta' | 'deprecated'
  importPath: string
  filePath: string
  tags?: string[]
  lawGroup?: 'BP-344' | 'DSGN-013' | 'PD-1096'
}

/** Full data needed to render a component documentation page. */
export interface ComponentPageData extends ComponentMeta {
  propsTable: PropsTableEntry[]
  codeSnippet: string
  lastUpdated?: string
}

/* ------------------------------------------------------------------ */
/*  Status Dashboard Types                                             */
/* ------------------------------------------------------------------ */

export type ServiceStatus = 'operational' | 'degraded' | 'outage'

export interface StatusMetric {
  label: string
  value: string | number
  status: ServiceStatus
  unit?: string
}

export interface DatabaseStatus {
  connections: { active: number; idle: number; max: number }
  tables: Array<{ name: string; rowCount: number; size: string }>
  migrations: Array<{
    id: string
    name: string
    timestamp: string
    status: 'applied' | 'failed' | 'pending'
  }>
}

export interface InfrastructureStatus {
  apiLatency: { p50: number; p95: number; p99: number; unit: 'ms' }
  edgeFunctions: Array<{
    name: string
    status: ServiceStatus
    lastInvocation: string
  }>
  deployment: {
    timestamp: string
    status: 'success' | 'failed'
    commit: string
    duration: string
  }
}

/* ------------------------------------------------------------------ */
/*  Search Types                                                       */
/* ------------------------------------------------------------------ */

export interface SearchItem {
  id: string
  name: string
  description: string
  type: 'component' | 'page' | 'status'
  domain: string
  status: 'stable' | 'beta' | 'deprecated'
  tags: string[]
  keywords: string[]
  path: string
}
