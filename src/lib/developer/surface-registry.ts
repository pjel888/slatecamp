import { ROUTES } from '@/lib/routes'

export type DeveloperSurfaceGroup = 'Portal' | 'Documentation' | 'Status' | 'Tools'

export type DeveloperSurfaceIconKey =
  | 'overview'
  | 'apiReference'
  | 'architecture'
  | 'status'
  | 'database'
  | 'infrastructure'
  | 'tools'
  | 'console'
  | 'logs'
  | 'testData'

type DeveloperSurfaceId =
  | 'overview'
  | 'api-reference'
  | 'architecture'
  | 'status-overview'
  | 'status-database'
  | 'status-infrastructure'
  | 'tools-overview'
  | 'tools-console'
  | 'tools-db'
  | 'tools-logs'
  | 'tools-test-data'

interface DeveloperSurfaceDefinition {
  id: DeveloperSurfaceId
  title: string
  href: string
  group: DeveloperSurfaceGroup
  description: string
  keywords: string
  iconKey: DeveloperSurfaceIconKey
  actionLabel?: string
}

interface DeveloperSurfaceTruthNote {
  badge: string
  variant: 'default' | 'success' | 'warning' | 'info'
  description: string
}

const GROUP_ORDER: DeveloperSurfaceGroup[] = ['Portal', 'Documentation', 'Status', 'Tools']

const DEVELOPER_SURFACES: DeveloperSurfaceDefinition[] = [
  {
    id: 'overview',
    title: 'Overview',
    href: ROUTES.developer.root,
    group: 'Portal',
    description: 'Documentation, API reference, architecture guides, and engineering tools.',
    keywords: 'home portal dashboard overview docs engineering',
    iconKey: 'overview',
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    href: ROUTES.developer.apiReference,
    group: 'Documentation',
    description: 'Server actions, internal endpoints, payload contracts, and integration notes.',
    keywords: 'api reference endpoints routes actions payload contracts webhooks',
    iconKey: 'apiReference',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    href: ROUTES.developer.architecture,
    group: 'Documentation',
    description: 'Schema, auth, deployment, and platform boundaries.',
    keywords: 'architecture schema database auth deployment boundaries infra',
    iconKey: 'architecture',
  },
  {
    id: 'status-overview',
    title: 'Status Overview',
    href: ROUTES.developer.status,
    group: 'Status',
    description: 'Database health, API latency, edge functions, and deployment status.',
    keywords: 'status overview health uptime services operational latency',
    iconKey: 'status',
  },
  {
    id: 'status-database',
    title: 'Database Status',
    href: ROUTES.developer.statusDatabase,
    group: 'Status',
    description: 'Postgres health, migrations, and storage-backed service status.',
    keywords: 'database postgres connections migrations rls storage',
    iconKey: 'database',
  },
  {
    id: 'status-infrastructure',
    title: 'Infrastructure Status',
    href: ROUTES.developer.statusInfrastructure,
    group: 'Status',
    description: 'API, auth, and edge infrastructure status details.',
    keywords: 'infrastructure api auth edge deployment status',
    iconKey: 'infrastructure',
  },
  {
    id: 'tools-overview',
    title: 'Dev Tools',
    href: ROUTES.developer.tools,
    group: 'Tools',
    description: 'Internal tools for debugging, testing, and inspecting the platform.',
    keywords: 'dev tools debugging testing inspect utilities',
    iconKey: 'tools',
  },
  {
    id: 'tools-console',
    title: 'Console',
    href: ROUTES.developer.console,
    group: 'Tools',
    description: 'Feature flags, impersonation, and system info.',
    keywords: 'console feature flags impersonation system info',
    iconKey: 'console',
    actionLabel: 'Toggle Feature Flag',
  },
  {
    id: 'tools-db',
    title: 'Database Browser',
    href: ROUTES.developer.db,
    group: 'Tools',
    description: 'Table explorer with row counts and RLS status.',
    keywords: 'database browser tables rows rls browse',
    iconKey: 'database',
    actionLabel: 'Check DB Status',
  },
  {
    id: 'tools-logs',
    title: 'Audit Logs',
    href: ROUTES.developer.logs,
    group: 'Tools',
    description: 'Audit history and application-error inspection.',
    keywords: 'audit logs application errors events history operations',
    iconKey: 'logs',
  },
  {
    id: 'tools-test-data',
    title: 'Test Data',
    href: ROUTES.developer.testData,
    group: 'Tools',
    description: 'Generate mock sessions, users, and organizations.',
    keywords: 'test data mock generator sessions users organizations',
    iconKey: 'testData',
    actionLabel: 'Generate Test Data',
  },
]

const surfacesById = Object.fromEntries(
  DEVELOPER_SURFACES.map((surface) => [surface.id, surface]),
) as Record<DeveloperSurfaceId, DeveloperSurfaceDefinition>

const pickSurfaces = (ids: DeveloperSurfaceId[]) => ids.map((id) => surfacesById[id])

export const developerSurfaceGroups = GROUP_ORDER.map((group) => ({
  label: group,
  items: DEVELOPER_SURFACES.filter((surface) => surface.group === group).map((surface) => ({
    id: surface.id,
    label: surface.title,
    href: surface.href,
    iconKey: surface.iconKey,
  })),
}))

export const developerSurfaceSearchPages = DEVELOPER_SURFACES.map((surface) => ({
  title: surface.title,
  href: surface.href,
  group: surface.group,
  keywords: surface.keywords,
}))

export const developerOverviewCards = pickSurfaces([
  'api-reference',
  'status-overview',
  'tools-overview',
]).map((surface) => ({
  id: surface.id,
  title: surface.title,
  description: surface.description,
  href: surface.href,
  iconKey: surface.iconKey,
}))

export const developerQuickActions = pickSurfaces([
  'tools-db',
  'tools-console',
  'tools-test-data',
]).map((surface) => ({
  id: surface.id,
  label: surface.actionLabel ?? surface.title,
  href: surface.href,
  iconKey: surface.iconKey,
}))

export const developerToolSurfaces = pickSurfaces([
  'tools-console',
  'tools-db',
  'tools-logs',
  'tools-test-data',
]).map((surface) => ({
  id: surface.id,
  title: surface.title,
  description: surface.description,
  href: surface.href,
  iconKey: surface.iconKey,
}))

export const developerStatusServices = [
  { key: 'database', label: 'Database', href: ROUTES.developer.statusDatabase },
  { key: 'api', label: 'API', href: ROUTES.developer.statusInfrastructure },
  { key: 'auth', label: 'Auth', href: ROUTES.developer.statusInfrastructure },
  { key: 'edge', label: 'Edge Functions', href: ROUTES.developer.statusInfrastructure },
] as const

export const developerToolCount = developerToolSurfaces.length

export const developerSurfaceTruthNotes = {
  'status-overview': {
    badge: 'Mixed sources',
    variant: 'info',
    description:
      'This page combines live Supabase status checks with deterministic availability bars until persisted status history exists.',
  },
  'status-database': {
    badge: 'Fallback data',
    variant: 'warning',
    description:
      'Database detail cards currently come from the mock status provider and should be treated as representative rather than live operational telemetry.',
  },
  'status-infrastructure': {
    badge: 'Fallback data',
    variant: 'warning',
    description:
      'Infrastructure detail cards currently use the mock status provider, so latency and deployment values are illustrative rather than runtime-backed.',
  },
  'tools-logs': {
    badge: 'Runtime-backed',
    variant: 'success',
    description:
      'This page reads live audit and application-error records from the current environment; empty states reflect missing events or unavailable backends.',
  },
} satisfies Partial<Record<DeveloperSurfaceId, DeveloperSurfaceTruthNote>>
