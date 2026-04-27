import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3217)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`
const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'
const useBuiltApp = process.env.PLAYWRIGHT_USE_BUILT_APP === 'true'

const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    return typeof entry[1] === 'string'
  }),
)

export default defineConfig({
  testDir: '.',
  testMatch: ['perf.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  outputDir: '../playwright/test-output',
  reporter: [
    ['list'],
    ['json', { outputFile: '../results/playwright-perf-report.json' }],
    ['html', { open: 'never', outputFolder: '../playwright/html-report' }],
  ],
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun scripts/playwright-web-server.ts',
    cwd: process.cwd(),
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...webServerEnv,
      ALLOW_DEV_PORTAL_BYPASS: 'false',
      DEV_FORCE_USER_ID: '',
      DISABLE_DEV_FORCE_USER_ID: 'true',
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXT_PUBLIC_ENABLE_DEMO_MODE: demoAuthEnabled ? 'true' : 'false',
      NEXT_PUBLIC_PAYMENTS_ENABLED: 'false',
      PLAYWRIGHT_DEMO_AUTH: demoAuthEnabled ? 'true' : 'false',
      PLAYWRIGHT_USE_BUILT_APP: useBuiltApp ? 'true' : 'false',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'ci-anon-key',
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        'https://hrpdwqurngnyajuhbkdg.supabase.co',
    },
  },
})
