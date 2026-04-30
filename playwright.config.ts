import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3217)
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`
const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'
const useBuiltApp = process.env.PLAYWRIGHT_USE_BUILT_APP === 'true'
const allowDevForceUser = process.env.PLAYWRIGHT_ALLOW_DEV_FORCE_USER_ID === 'true'

const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    return typeof entry[1] === 'string'
  }),
)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'bun scripts/playwright-web-server.ts',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...webServerEnv,
      ALLOW_DEV_PORTAL_BYPASS: 'false',
      DEV_FORCE_USER_ID: allowDevForceUser
        ? (process.env.DEV_FORCE_USER_ID ?? process.env.PLAYWRIGHT_DRILLS_USER_ID ?? '')
        : '',
      DISABLE_DEV_FORCE_USER_ID: allowDevForceUser ? 'false' : 'true',
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
