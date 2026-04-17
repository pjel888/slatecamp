import type { DatabaseStatus, InfrastructureStatus } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Mock Status Data                                                   */
/*  Each function is async and returns a typed response matching the   */
/*  shape of the real API. Swap the body for a fetch() call later.     */
/* ------------------------------------------------------------------ */

export const getDatabaseStatus = async (): Promise<DatabaseStatus> => {
  await new Promise((r) => setTimeout(r, 200))

  return {
    connections: { active: 12, idle: 8, max: 20 },
    tables: [
      { name: 'profiles',           rowCount: 2847,   size: '14.2 MB' },
      { name: 'user_interactions',   rowCount: 184302, size: '892.1 MB' },
      { name: 'quiz_sessions',      rowCount: 12453,  size: '67.8 MB' },
      { name: 'user_node_mastery',   rowCount: 89234,  size: '234.5 MB' },
      { name: 'wiki_articles',      rowCount: 412,    size: '28.9 MB' },
      { name: 'taxonomy_tree',      rowCount: 1847,   size: '8.3 MB' },
      { name: 'questions',          rowCount: 6723,   size: '156.2 MB' },
      { name: 'user_trail_enrollments', rowCount: 934, size: '4.1 MB' },
      { name: 'feature_flags',      rowCount: 23,     size: '0.1 MB' },
      { name: 'audit_logs',         rowCount: 45678,  size: '112.4 MB' },
    ],
    migrations: [
      { id: '20260318_001', name: 'add_mastery_decay_column',          timestamp: '2026-03-18T14:23:00Z', status: 'applied' },
      { id: '20260315_001', name: 'create_trail_milestones_table',     timestamp: '2026-03-15T09:12:00Z', status: 'applied' },
      { id: '20260312_002', name: 'add_question_difficulty_index',     timestamp: '2026-03-12T16:45:00Z', status: 'applied' },
      { id: '20260312_001', name: 'update_rls_policies_quiz_sessions', timestamp: '2026-03-12T10:30:00Z', status: 'applied' },
      { id: '20260308_001', name: 'add_analytics_materialized_views',  timestamp: '2026-03-08T11:00:00Z', status: 'applied' },
    ],
  }
}

export const getInfrastructureStatus = async (): Promise<InfrastructureStatus> => {
  await new Promise((r) => setTimeout(r, 200))

  return {
    apiLatency: { p50: 45, p95: 189, p99: 342, unit: 'ms' },
    edgeFunctions: [
      { name: 'compute-readiness-score',  status: 'operational', lastInvocation: '2026-03-25T08:14:22Z' },
      { name: 'process-quiz-submission',  status: 'operational', lastInvocation: '2026-03-25T08:12:45Z' },
      { name: 'generate-study-plan',      status: 'operational', lastInvocation: '2026-03-25T07:58:10Z' },
      { name: 'sync-taxonomy-cache',      status: 'degraded',    lastInvocation: '2026-03-25T06:00:00Z' },
      { name: 'send-notification',        status: 'operational', lastInvocation: '2026-03-25T08:10:33Z' },
    ],
    deployment: {
      timestamp: '2026-03-24T22:15:00Z',
      status: 'success',
      commit: 'a3f8b2c',
      duration: '2m 34s',
    },
  }
}
