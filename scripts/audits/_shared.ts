import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type RouteAccess = 'public' | 'auth' | 'admin_login' | 'protected'
export type AuditTarget = 'public-smoke' | 'auth-browser' | 'protected-browser-probe'
export type AuditAccountReason =
  | 'dynamic-fixture-missing'
  | 'protected-not-probed-by-default'
  | 'non-public-route'

export interface RouteManifestEntry {
  access: RouteAccess
  auditTargets: AuditTarget[]
  path: string
  probeByDefault: boolean
  relativePageFile: string
  requiresFixture: boolean
  sourceSegments: string[]
}

export interface RouteManifest {
  generatedAt: string
  routeManifestShape: {
    version: string
    entryFields: string[]
    inferredAccessRules: string[]
  }
  routes: RouteManifestEntry[]
  summary: {
    byAccess: Record<RouteAccess, number>
    dynamicRoutes: number
    totalRoutes: number
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const REPO_ROOT = resolve(__dirname, '..', '..')
export const APP_ROOT = join(REPO_ROOT, 'src', 'app')
export const EVIDENCE_ROOT = join(REPO_ROOT, '.ai', '02_audits', 'evidence')
const ROUTE_MANIFEST_FILENAME = 'route-manifest.json'

const PUBLIC_PREFIXES = ['/', '/about', '/contact', '/pricing', '/try', '/tools', '/calculators', '/test-3d']
const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/onboarding']
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/developer', '/ceo', '/quiz']
const DEFAULT_PROTECTED_PROBES = new Set(['/dashboard', '/admin', '/developer', '/ceo'])

const normalizeSlashes = (value: string) => value.replaceAll('\\', '/')

const toRoutePath = (segments: string[]) => {
  const visibleSegments = segments.filter((segment) => !/^\(.+\)$/.test(segment))
  if (visibleSegments.length === 0) {
    return '/'
  }

  return `/${visibleSegments.join('/')}`
}

const classifyRouteAccess = (routePath: string): RouteAccess => {
  if (routePath === '/admin/login') {
    return 'admin_login'
  }

  if (AUTH_PREFIXES.some((prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`))) {
    return 'auth'
  }

  if (
    PROTECTED_PREFIXES.some(
      (prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`)
    )
  ) {
    return 'protected'
  }

  if (PUBLIC_PREFIXES.some((prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`))) {
    return 'public'
  }

  return 'public'
}

const inferAuditTargets = (entry: Omit<RouteManifestEntry, 'auditTargets' | 'probeByDefault'>) => {
  const auditTargets: AuditTarget[] = []

  if (!entry.requiresFixture && entry.access === 'public') {
    auditTargets.push('public-smoke')
  }

  if (!entry.requiresFixture && (entry.access === 'auth' || entry.access === 'admin_login')) {
    auditTargets.push('auth-browser')
  }

  if (!entry.requiresFixture && entry.access === 'protected' && DEFAULT_PROTECTED_PROBES.has(entry.path)) {
    auditTargets.push('protected-browser-probe')
  }

  return auditTargets
}

const readPageEntries = async (directory: string): Promise<RouteManifestEntry[]> => {
  const dirEntries = await readdir(directory, { withFileTypes: true })
  const routes: RouteManifestEntry[] = []

  for (const dirEntry of dirEntries) {
    const absolutePath = join(directory, dirEntry.name)

    if (dirEntry.isDirectory()) {
      routes.push(...(await readPageEntries(absolutePath)))
      continue
    }

    if (!dirEntry.isFile() || !/^page\.(?:tsx|ts|jsx|js)$/.test(dirEntry.name)) {
      continue
    }

    const relativePageFile = normalizeSlashes(relative(REPO_ROOT, absolutePath))
    const relativeDir = normalizeSlashes(relative(APP_ROOT, dirname(absolutePath)))
    const sourceSegments = relativeDir === '.' ? [] : relativeDir.split('/')
    const path = toRoutePath(sourceSegments)
    const requiresFixture = sourceSegments.some((segment) => segment.includes('['))
    const access = classifyRouteAccess(path)

    const partialEntry = {
      access,
      path,
      relativePageFile,
      requiresFixture,
      sourceSegments,
    }

    routes.push({
      ...partialEntry,
      auditTargets: inferAuditTargets(partialEntry),
      probeByDefault: !requiresFixture && DEFAULT_PROTECTED_PROBES.has(path),
    })
  }

  return routes
}

export const buildRouteManifest = async (): Promise<RouteManifest> => {
  const routes = (await readPageEntries(APP_ROOT)).sort((left, right) => {
    if (left.path === right.path) {
      return left.relativePageFile.localeCompare(right.relativePageFile)
    }

    return left.path.localeCompare(right.path)
  })

  const byAccess: Record<RouteAccess, number> = {
    public: 0,
    auth: 0,
    admin_login: 0,
    protected: 0,
  }

  for (const route of routes) {
    byAccess[route.access] += 1
  }

  return {
    generatedAt: new Date().toISOString(),
    routeManifestShape: {
      version: '2026-04-25',
      entryFields: [
        'path',
        'relativePageFile',
        'sourceSegments',
        'access',
        'requiresFixture',
        'auditTargets',
        'probeByDefault',
      ],
      inferredAccessRules: [
        '/admin/login is treated as public login entry',
        '/login, /register, /forgot-password, /onboarding* are treated as auth pages',
        '/dashboard*, /admin* (except /admin/login), /developer*, /ceo*, and /quiz* are treated as protected',
        'All remaining page routes are treated as public for smoke coverage until a narrower guard is encoded',
      ],
    },
    routes,
    summary: {
      byAccess,
      dynamicRoutes: routes.filter((route) => route.requiresFixture).length,
      totalRoutes: routes.length,
    },
  }
}

export const ensureEvidenceRoot = async () => {
  await mkdir(EVIDENCE_ROOT, { recursive: true })
}

export const writeEvidence = async (filename: string, payload: unknown) => {
  await ensureEvidenceRoot()
  const absolutePath = join(EVIDENCE_ROOT, filename)
  await writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  return normalizeSlashes(relative(REPO_ROOT, absolutePath))
}

export const writeRouteManifestEvidence = async (manifest: RouteManifest) =>
  writeEvidence(ROUTE_MANIFEST_FILENAME, manifest)

export const parseFlag = (name: string) => process.argv.includes(name)

export const parseOption = (name: string) => {
  const index = process.argv.indexOf(name)
  if (index === -1) {
    return null
  }

  return process.argv[index + 1] ?? null
}

export const parseNumberOption = (name: string, fallback: number) => {
  const value = parseOption(name)

  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const resolveBaseUrl = () => {
  const explicitBaseUrl = parseOption('--base-url')
  const baseUrl = explicitBaseUrl || process.env.AUDIT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'

  return baseUrl.replace(/\/$/, '')
}

export const absoluteUrl = (baseUrl: string, routePath: string) => `${baseUrl}${routePath === '/' ? '' : routePath}`

export const summarizeAccounting = <T extends { reason: AuditAccountReason }>(entries: T[]) =>
  entries.reduce<Record<AuditAccountReason, number>>(
    (accumulator, entry) => {
      accumulator[entry.reason] += 1
      return accumulator
    },
    {
      'dynamic-fixture-missing': 0,
      'protected-not-probed-by-default': 0,
      'non-public-route': 0,
    }
  )

export const collectPublicAccounting = (manifest: RouteManifest) =>
  manifest.routes
    .filter((route) => !route.auditTargets.includes('public-smoke'))
    .map((route) => ({
      path: route.path,
      reason: route.requiresFixture
        ? 'dynamic-fixture-missing'
        : 'non-public-route',
      relativePageFile: route.relativePageFile,
    }))

export const collectBrowserAccounting = (manifest: RouteManifest) =>
  manifest.routes
    .filter(
      (route) =>
        !route.auditTargets.includes('auth-browser') &&
        !route.auditTargets.includes('protected-browser-probe')
    )
    .map((route) => ({
      path: route.path,
      reason: route.requiresFixture
        ? 'dynamic-fixture-missing'
        : route.access === 'protected'
          ? 'protected-not-probed-by-default'
          : 'non-public-route',
      relativePageFile: route.relativePageFile,
    }))
