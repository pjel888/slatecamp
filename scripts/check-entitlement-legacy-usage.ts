import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()

const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.sql', '.md'])

const BANNED_PATTERNS = [
  {
    name: 'raw-tier-free-comparison',
    pattern: /\b(?:sub|subscription|userSub|tier|actualTier|currentTier|effectiveTier)[\w?.]*\s*(?:===|!==)\s*['"]free['"]/,
    message: 'Direct free-tier comparison in product code is banned. Use canonical entitlement decisions.',
    allowlist: [
      'src/lib/entitlements/normalize-tier.ts',
      'src/lib/entitlements/resolve-entitlements.ts',
      'src/lib/entitlements/__tests__/',
      'scripts/check-entitlement-legacy-usage.ts',
      'src/components/testing/hub/ReviewHub.tsx',
    ],
  },
  {
    name: 'direct-target-tier-usage',
    pattern: /\btarget_tier\b/,
    message: 'Direct target_tier runtime usage is banned outside normalization and migration files.',
    allowlist: [
      'src/lib/entitlements/normalize-feature-flag.ts',
      'src/lib/entitlements/get-viewer-entitlements.ts',
      'src/lib/entitlements/__tests__/',
      'src/types/',
      'supabase/migrations/',
      'DATABASE_SCHEMA.sql',
      'scripts/check-entitlement-legacy-usage.ts',
      'src/lib/entitlements/normalize-feature-flag.test.ts',
      'scripts/check-auth-cleanup-readiness.ts',
    ],
  },
  {
    name: 'direct-dev-force-usage',
    pattern: /\b(?:DEV_FORCE_USER_ID|DEV_FORCE_TIER|ALLOW_DEV_PORTAL_BYPASS)\b/,
    message: 'Direct entitlement-affecting env usage is banned outside the canonical boundary.',
    allowlist: [
      'src/lib/entitlements/dev-overrides.ts',
      'src/lib/entitlements/dev-overrides.test.ts',
      'src/lib/entitlements/get-viewer-entitlements.ts',
      'src/lib/entitlements/resolve-role.ts',
      'src/lib/entitlements/resolve-role.test.ts',
      'src/lib/demo/config.ts',
      'src/lib/supabase/server.ts',
      'src/lib/supabase/client.ts',
      'src/lib/supabase/middleware.ts',
      'src/lib/supabase/middleware.test.ts',
      // Playwright harnesses may set deterministic dev-force env for real-DB E2E only.
      'scripts/playwright-run.ts',
      'scripts/playwright-web-server.ts',
      'scripts/check-entitlement-legacy-usage.ts',
      'src/lib/admin/roles.test.ts',
    ],
  },
  {
    name: 'get-user-role-truthiness-gate',
    pattern: /if\s*\(\s*!?\s*(?:await\s+)?getUserRole\(\)\s*\)/,
    message: 'Privileged gating by getUserRole() truthiness is banned. Use policy helpers.',
    allowlist: [
      'src/lib/entitlements/policy.ts',
      'src/lib/entitlements/__tests__/',
      'scripts/check-entitlement-legacy-usage.ts',
    ],
  },
]

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  'node_modules',
  'storybook-static',
  '.omx',
])

const collectFiles = (dir: string): string[] => {
  const results: string[] = []

  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) {
      continue
    }

    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      results.push(...collectFiles(fullPath))
      continue
    }

    if (!TEXT_EXTENSIONS.has(fullPath.slice(fullPath.lastIndexOf('.')))) {
      continue
    }

    if (fullPath.endsWith('AGENTS.md')) {
      continue
    }

    results.push(fullPath)
  }

  return results
}

const isAllowed = (filePath: string, allowlist: string[]): boolean =>
  allowlist.some((entry) => filePath === entry || filePath.startsWith(entry))

const failures: string[] = []

const scanRoots = ['src', 'scripts']
  .map((entry) => join(ROOT, entry))
  .filter((entry) => {
    try {
      return statSync(entry).isDirectory()
    } catch {
      return false
    }
  })

for (const absolutePath of scanRoots.flatMap((dir) => collectFiles(dir))) {
  const filePath = relative(ROOT, absolutePath).replaceAll('\\', '/')
  const content = readFileSync(absolutePath, 'utf8')

  for (const rule of BANNED_PATTERNS) {
    if (isAllowed(filePath, rule.allowlist)) {
      continue
    }

    const lines = content.split('\n')
    lines.forEach((line, index) => {
      if (rule.pattern.test(line)) {
        failures.push(`${filePath}:${index + 1} [${rule.name}] ${rule.message}`)
      }
    })
  }
}

if (failures.length > 0) {
  console.error('Entitlement legacy usage check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Entitlement legacy usage check passed.')
