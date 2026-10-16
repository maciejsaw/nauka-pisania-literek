import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/ui', fullyParallel: true, workers: 2, retries: process.env.CI ? 1 : 0,
  projects: [
    { name: 'chromium' },
    { name: 'webkit-touch', testMatch: /(?:touch|store-codes|dialogs)\.spec\.js/, use: { browserName: 'webkit', isMobile: true, hasTouch: true } },
  ],
  use: { baseURL: 'http://127.0.0.1:4175', viewport: { width: 390, height: 844 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview -- --outDir build/e2e --port 4175', url: 'http://127.0.0.1:4175', reuseExistingServer: false },
});
