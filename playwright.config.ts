import { defineConfig, devices } from '@playwright/test';

const PORT = 3101;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command:
      'cross-env NEXT_PUBLIC_E2E_AUTH_BYPASS=true NEXT_PUBLIC_E2E_MOCK_DATA=true npm run dev -- -p 3101',
    url: `${BASE_URL}/login`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
