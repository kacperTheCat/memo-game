import { defineConfig, devices } from '@playwright/test'

/**
 * Production-like E2E: build + vite preview on 4173 (constitution / FR-004).
 * Excludes bootstrap.spec.ts (uses playwright.bootstrap.config.ts).
 */
export default defineConfig({
  testDir: 'e2e',
  /** One baseline per screenshot name (regenerate on Linux for CI via Docker; see quickstart). */
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  testIgnore: '**/bootstrap.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.04,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm vite build && pnpm vite preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
