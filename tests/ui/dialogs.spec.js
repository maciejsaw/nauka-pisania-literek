import { test, expect } from './fixtures.js';

test('dialogs keep top and bottom safe areas and scroll on a small iPhone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto('/');
  // Desktop WebKit has no physical notch: simulate iPhone safe-area values.
  await page.addStyleTag({ content: ':root { --safe-top: 59px; --safe-bottom: 34px; }' });
  async function insideSafeArea(id) {
    const dialog = page.locator(id);
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(59 + 16 - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height - 34 - 16 + 1);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
  await page.locator('#settingsBtn').click();
  await insideSafeArea('#settingsDialog');
  await page.locator('#parentInfoBtn').click();
  await insideSafeArea('#parentInfoDialog');
  const guide = page.locator('#parentInfoDialog');
  expect(await guide.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await guide.locator('section').last().scrollIntoViewIfNeeded();
  await expect(guide.locator('section').last()).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 400 });
  await insideSafeArea('#parentInfoDialog');
  await page.locator('#closeParentInfoBtn').click();
  await page.setViewportSize({ width: 390, height: 640 });
  await page.locator('#privacyBtn').click();
  await insideSafeArea('#privacyDialog');
  await page.locator('#privacyClose').click();
  await page.locator('#fullVersionBtn').click();
  await insideSafeArea('#paywallDialog');
  await page.locator('#paywallClose').click();
  await page.locator('#closeSettingsBtn').click();
  await expect(page.locator('#settingsDialog')).toBeHidden();
});
