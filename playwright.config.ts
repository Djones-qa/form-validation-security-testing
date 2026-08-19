import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    headless: true,
    video: 'on',
    screenshot: 'on',
    viewport: { width: 1280, height: 720 },
    launchOptions: { slowMo: 300 },
    ignoreHTTPSErrors: true,
  },
  outputDir: 'D:/test-evidence',
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
