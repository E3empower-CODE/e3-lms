import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config. Browsers are pre-installed in this environment, so we
 * point at the bundled Chromium rather than downloading one. Override the path
 * with PLAYWRIGHT_CHROMIUM_PATH if your setup differs; locally, remove
 * launchOptions.executablePath to use Playwright's managed browser.
 */
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
