// Capture actual app views at store resolutions; no fabricated device frames or prices.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, copyFile } from 'node:fs/promises';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4175'], { stdio: 'ignore' });
let browser;
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch('http://127.0.0.1:4175')).ok) break; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  browser = await chromium.launch();
  for (const device of [
    { name: 'iphone', w: 440, h: 956, scale: 3, dir: 'store/ios/screenshots/pl' },
    { name: 'ipad', w: 1032, h: 1376, scale: 2, dir: 'store/ios/screenshots/pl' },
    { name: 'android', w: 360, h: 640, scale: 3, dir: 'store/android/metadata/pl-PL/images/phoneScreenshots' },
  ]) {
    await mkdir(device.dir, { recursive: true });
    const context = await browser.newContext({ viewport: { width: device.w, height: device.h }, deviceScaleFactor: device.scale, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const shot = n => device.name === 'android' ? `${device.dir}/${n}.png` : `${device.dir}/${n}-${device.name}.png`;
    await page.goto('http://127.0.0.1:4175');
    await page.locator('.tile').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: shot(1) });
    await page.getByRole('button', { name: 'mała literka a', exact: true }).click();
    await page.waitForTimeout(1500); // Let the writing demonstration become visible for store capture.
    await page.screenshot({ path: shot(2) });
    await page.getByRole('button', { name: 'Wróć do wszystkich literek' }).click();
    await page.getByRole('button', { name: 'Ustawienia', exact: true }).click();
    await mkdir('build/previews', { recursive: true });
    await page.screenshot({ path: `build/previews/settings-${device.name}.png` });
    await page.getByRole('button', { name: 'Informacje dla rodzica', exact: true }).click();
    await page.screenshot({ path: shot(3) });
    // QA image of the web demo paywall, deliberately excluded from store uploads.
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Prywatność', exact: true }).click();
    await page.screenshot({ path: `build/previews/privacy-${device.name}.png` });
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'mała literka ę, pełna wersja', exact: true }).click();
    await mkdir('build/previews', { recursive: true });
    await page.screenshot({ path: `build/previews/paywall-${device.name}.png` });
    await context.close();
  }
} finally { await browser?.close(); server.kill(); }
