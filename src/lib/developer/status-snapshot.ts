import type { ServiceStatus } from '@/types/developer'

const STATUS_COMPONENT_NAMES = {
  database: 'Database',
  api: 'API Gateway',
  auth: 'Auth',
  edge: 'Edge Functions',
} as const

interface DeveloperServiceStatusSnapshot {
  database: ServiceStatus
  api: ServiceStatus
  auth: ServiceStatus
  edge: ServiceStatus
}

const normalizeComponentStatus = (status?: string | null): ServiceStatus => {
  if (!status || status === 'operational') return 'operational'
  if (status === 'major_outage' || status === 'partial_outage') return 'outage'
  return 'degraded'
}

export const getDeveloperServiceStatusSnapshot = async (): Promise<DeveloperServiceStatusSnapshot> => {
  const summaryResponse = await fetch('https://status.supabase.com/api/v2/summary.json', {
    next: { revalidate: 60 },
  }).catch(() => null)
  const summary = summaryResponse?.ok ? await summaryResponse.json() : null

  const getComponentStatus = (name: string): ServiceStatus =>
    normalizeComponentStatus(summary?.components?.find((component: { name: string; status?: string | null }) => component.name === name)?.status)

  return {
    database: getComponentStatus(STATUS_COMPONENT_NAMES.database),
    api: getComponentStatus(STATUS_COMPONENT_NAMES.api),
    auth: getComponentStatus(STATUS_COMPONENT_NAMES.auth),
    edge: getComponentStatus(STATUS_COMPONENT_NAMES.edge),
  }
}
