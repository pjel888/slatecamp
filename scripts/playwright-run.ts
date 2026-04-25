const mode = process.argv[2] ?? 'all'

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    return typeof entry[1] === 'string'
  }),
)

const playwrightBin =
  process.platform === 'win32'
    ? './node_modules/.bin/playwright.cmd'
    : './node_modules/.bin/playwright'

const commandByMode: Record<string, string[]> = {
  all: ['test'],
  smoke: ['test', '--project=chromium'],
  prod: ['test', 'e2e/launch-smoke.spec.ts', 'e2e/access-boundaries.spec.ts'],
  'auth-demo': ['test', 'e2e/authenticated-demo.spec.ts', '--project=chromium'],
  'auth-demo-portals': [
    'test',
    'e2e/authenticated-demo-portals.spec.ts',
    '--project=chromium',
  ],
  'auth-demo-3d-lab': [
    'test',
    'e2e/authenticated-demo-3d-lab.spec.ts',
    '--project=chromium',
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

if (mode === 'prod') {
  env.PLAYWRIGHT_USE_BUILT_APP = 'true'
}

if (
  mode === 'auth-demo' ||
  mode === 'auth-demo-portals' ||
  mode === 'auth-demo-3d-lab'
) {
  env.PLAYWRIGHT_DEMO_AUTH = 'true'
}

const testRun = Bun.spawn([playwrightBin, ...args], {
  env,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
})

process.exit(await testRun.exited)

export {}
