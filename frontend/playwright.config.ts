import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the calendar booking app.
 *
 * The dev server (vite) and the Prism mock server are expected to be
 * already running on :5173 and :3000 respectively. Network responses are
 * stubbed inside each test via `page.route()` so that assertions stay
 * deterministic regardless of the mock server's behavior.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    locale: 'ru-RU',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
