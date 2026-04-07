import { defineConfig, devices } from '@playwright/test'

/**
 * Production-like E2E: build + vite preview on 4173 (constitution / FR-004).
 * Excludes bootstrap.spec.ts (uses playwright.bootstrap.config.ts).
 */
export default defineConfig({
  testDir: 'e2e/project-setup',
  testIgnore: '**/bootstrap.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
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
