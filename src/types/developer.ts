/* ------------------------------------------------------------------ */
/*  Status Dashboard Types                                             */
/* ------------------------------------------------------------------ */

export type ServiceStatus = 'operational' | 'degraded' | 'outage'

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
