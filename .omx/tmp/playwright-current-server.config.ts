import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: '../tmp',
  fullyParallel: false,
  reporter: [['list']],
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001', trace: 'off', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
