import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: 'public/tests',
  timeout: 30_000,
  expect: {
    timeout: 5000,
  },

  fullyParallel: true,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000/login.html',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  use: {
    actionTimeout: 0,
    screenshot: 'on',
    trace: 'on-first-retry',
    baseURL: 'http://localhost:3000',
    viewport: null,
    launchOptions: {
    args: ['--start-maximized'],
  },
  },
  projects: [
    {
    name: 'chromium',
    use: {
      browserName: 'chromium',
    },
  },

  {
    name: 'firefox',
    use: {
      browserName: 'firefox',
    },
  },

  {
    name: 'webkit',
    use: {
      browserName: 'webkit',
    },
  },

  
  ],
};

export default config;
