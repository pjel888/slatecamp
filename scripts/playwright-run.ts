const mode = process.argv[2] ?? 'all'

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    return typeof entry[1] === 'string'
  }),
)

env.PERF_DEV_SERVER_MEMORY_PROFILE ??= 'false'
delete env.NO_COLOR

const playwrightBin =
  process.platform === 'win32'
    ? './node_modules/.bin/playwright.cmd'
    : './node_modules/.bin/playwright'

const commandByMode: Record<string, string[]> = {
  all: ['test', 'e2e/launch-smoke.spec.ts', 'e2e/access-boundaries.spec.ts'],
  smoke: ['test', '--project=chromium'],
  prod: ['test', 'e2e/launch-smoke.spec.ts', 'e2e/access-boundaries.spec.ts'],
  'auth-demo': ['test', 'e2e/authenticated-demo.spec.ts', '--project=chromium'],
  'auth-demo-learning': [
    'test',
    'e2e/learning-flow.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  'auth-demo-sidebar': [
    'test',
    'e2e/sidebar-navigation.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  'auth-demo-wiki': [
    'test',
    'e2e/wiki-learning.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  'auth-demo-portals': [
    'test',
    'e2e/authenticated-demo-portals.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  'auth-demo-3d-lab': [
    'test',
    'e2e/authenticated-demo-3d-lab.spec.ts',
    '--project=chromium',
  ],
  'auth-demo-restricted': [
    'test',
    'e2e/authenticated-demo-restricted.spec.ts',
    '--project=chromium',
  ],
  'auth-demo-admin-content-admin': [
    'test',
    'e2e/admin-permissions-content-admin.spec.ts',
    '--project=chromium',
  ],
  'auth-demo-admin-sme-reviewer': [
    'test',
    'e2e/admin-permissions-sme-reviewer.spec.ts',
    '--project=chromium',
  ],
  'auth-demo-admin-developer': [
    'test',
    'e2e/admin-permissions-developer.spec.ts',
    '--project=chromium',
  ],
  dialog: [
    'test',
    'e2e/dialog-accessibility.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  'auth-demo-ceo-portal': [
    'test',
    'e2e/ceo-portal.spec.ts',
    '--project=chromium',
  ],
  'quiz-real': [
    'test',
    'e2e/quiz-real-user-flow.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  'drills-real': [
    'test',
    'e2e/quiz-real-user-flow.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  headed: ['test', '--headed'],
  ui: ['test', '--ui'],
}

const args = commandByMode[mode]

if (!args) {
  console.error(
    `Unknown Playwright mode "${mode}". Expected one of: ${Object.keys(commandByMode).join(', ')}.`,
  )
  process.exit(1)
}

if (mode === 'all' || mode === 'prod' || mode === 'smoke') {
  env.PLAYWRIGHT_USE_BUILT_APP = 'true'
}

if (
  mode === 'auth-demo' ||
  mode === 'auth-demo-learning' ||
  mode === 'auth-demo-sidebar' ||
  mode === 'auth-demo-wiki' ||
  mode === 'auth-demo-portals' ||
  mode === 'auth-demo-3d-lab' ||
  mode === 'auth-demo-restricted' ||
  mode === 'auth-demo-admin-content-admin' ||
  mode === 'auth-demo-admin-sme-reviewer' ||
  mode === 'auth-demo-admin-developer' ||
  mode === 'auth-demo-ceo-portal' ||
  mode === 'dialog'
) {
  env.PLAYWRIGHT_DEMO_AUTH = 'true'
  env.NEXT_PUBLIC_ENABLE_DEMO_MODE = 'true'
}

if (mode === 'auth-demo-learning') {
  env.PLAYWRIGHT_PORT = '3218'
}

if (mode === 'auth-demo-wiki') {
  env.PLAYWRIGHT_PORT = '3225'
}

if (mode === 'auth-demo-restricted') {
  env.PLAYWRIGHT_DEMO_ROLE = 'member'
  env.PLAYWRIGHT_DEMO_TIER = 'free'
  env.PLAYWRIGHT_DEMO_EMAIL = 'student@example.com'
}

if (mode === 'auth-demo-admin-content-admin') {
  env.PLAYWRIGHT_DEMO_ROLE = 'content_admin'
  env.PLAYWRIGHT_DEMO_EMAIL = 'content-admin@example.com'
  env.PLAYWRIGHT_PORT ??= '3221'
}

if (mode === 'auth-demo-admin-sme-reviewer') {
  env.PLAYWRIGHT_DEMO_ROLE = 'sme_reviewer'
  env.PLAYWRIGHT_DEMO_EMAIL = 'sme-reviewer@example.com'
  env.PLAYWRIGHT_PORT ??= '3222'
}

if (mode === 'auth-demo-admin-developer' || mode === 'dialog') {
  env.PLAYWRIGHT_DEMO_ROLE = 'developer'
  env.PLAYWRIGHT_DEMO_EMAIL = 'developer@example.com'
  env.PLAYWRIGHT_PORT ??= '3223'
}

if (mode === 'auth-demo-ceo-portal') {
  env.PLAYWRIGHT_DEMO_ROLE = 'ceo'
  env.PLAYWRIGHT_DEMO_EMAIL = 'ceo@example.com'
  env.PLAYWRIGHT_PORT ??= '3224'
}

if (mode === 'quiz-real' || mode === 'drills-real') {
  env.PLAYWRIGHT_QUIZ_REAL_DB = 'true'
  env.PLAYWRIGHT_DRILLS_REAL_DB = 'true'
  env.PLAYWRIGHT_ALLOW_DEV_FORCE_USER_ID = 'true'
  env.PLAYWRIGHT_QUIZ_USER_ID ??=
    env.PLAYWRIGHT_DRILLS_USER_ID ?? '00000000-0000-4000-8000-00000000d111'
  env.PLAYWRIGHT_DRILLS_USER_ID = env.PLAYWRIGHT_QUIZ_USER_ID
  env.DEV_FORCE_USER_ID = env.PLAYWRIGHT_QUIZ_USER_ID
  env.DISABLE_DEV_FORCE_USER_ID = 'false'
  env.PLAYWRIGHT_DEMO_AUTH = 'false'
  env.NEXT_PUBLIC_ENABLE_DEMO_MODE = 'false'
  env.PLAYWRIGHT_PORT ??= '3226'
}

const testRun = Bun.spawn([playwrightBin, ...args], {
  env,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
})

process.exit(await testRun.exited)

export {}
