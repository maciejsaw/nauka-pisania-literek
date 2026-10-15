import { test, expect } from './fixtures.js';
test.use({ hasTouch: true, isMobile: true });

test('single taps open and close dialogs, change settings once and select letters', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(74);
  for (let i = 0; i < 3; i++) {
    await page.locator('#settingsBtn').tap();
    await expect(page.locator('#settingsDialog')).toBeVisible();
    const oldSound = await page.locator('#soundMenuBtn').getAttribute('aria-pressed');
    await page.locator('#soundMenuBtn').tap();
    await expect(page.locator('#soundMenuBtn')).toHaveAttribute('aria-pressed', String(oldSound !== 'true'));
    await page.locator('#privacyBtn').tap();
    await expect(page.locator('#privacyDialog')).toBeVisible();
    await page.locator('#privacyClose').tap();
    await page.locator('#parentInfoBtn').tap();
    await expect(page.locator('#parentInfoDialog')).toBeVisible();
    await page.locator('#closeParentInfoBtn').tap();
    await page.locator('#closeSettingsBtn').tap();
    await expect(page.locator('#settingsDialog')).toBeHidden();
  }
  await page.getByRole('button', { name: 'wielka literka A', exact: true }).tap();
  await expect(page.locator('#game')).toBeVisible();
  await page.locator('#backBtn').tap();
  await expect(page.locator('#menu')).toBeVisible();
  await page.getByRole('button', { name: 'wielka literka D, pełna wersja', exact: true }).tap();
  await expect(page.locator('#paywallDialog')).toBeVisible();
  await page.locator('#paywallClose').tap();
  await expect(page.locator('#paywallDialog')).toBeHidden();
});

test('pressed feedback does not move hit targets and clears on cancel or release', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(74);
  for (const id of ['settingsBtn', 'heroBtn', 'tile-32']) {
    const button = page.locator(`#${id}`);
    const box = await button.boundingBox();
    const before = await button.evaluate(el => getComputedStyle(el).filter);
    await page.mouse.move(box.x + box.width / 2, box.y + 1);
    await page.mouse.down();
    expect(await button.boundingBox()).toEqual(box);
    await expect(button).toHaveClass(/is-pressed/);
    expect(await button.evaluate(el => getComputedStyle(el).filter)).not.toBe(before);
    await page.mouse.up();
    await expect(button).not.toHaveClass(/is-pressed/);
    if (id === 'settingsBtn') await page.locator('#closeSettingsBtn').tap();
    if (id === 'tile-32') await page.locator('#backBtn').tap();
  }
  const button = page.locator('#settingsBtn');
  await button.dispatchEvent('pointerdown', { pointerId: 5, isPrimary: true, button: 0 });
  await expect(button).toHaveClass(/is-pressed/);
  await button.dispatchEvent('pointercancel', { pointerId: 5 });
  await expect(button).not.toHaveClass(/is-pressed/);
  await expect(page.locator('#settingsDialog')).toBeHidden();
});

test('pinch is disabled while one-finger menu scrolling remains available', async ({ page, browserName }) => {
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(74);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).touchAction)).toBe('pan-x pan-y');
  expect(await page.evaluate(() => {
    const event = new Event('gesturestart', { cancelable: true });
    document.dispatchEvent(event); return event.defaultPrevented;
  })).toBe(true);
  if (browserName === 'chromium') {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.synthesizePinchGesture', { x: 190, y: 430, scaleFactor: 2, gestureSourceType: 'touch' });
    expect(await page.evaluate(() => visualViewport.scale)).toBe(1);
    // Send an actual contact/move/release sequence. synthesizeScrollGesture is
    // a no-op in some Linux headless builds even with touch emulation enabled.
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 650 }] });
    for (let y = 625; y >= 250; y -= 25) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  }
});
