import { test, expect } from './fixtures.js';
test('seven free pairs, locks, friendly paywall, no fake web payment', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tile:not(.locked)')).toHaveCount(14);
  await expect(page.locator('.tile.locked')).toHaveCount(60);
  for (const letter of ['D', 'd', 'E', 'e']) {
    await page.getByRole('button', { name: `${letter === letter.toUpperCase() ? 'wielka' : 'mała'} literka ${letter}`, exact: true }).click();
    await expect(page.locator('#game')).toBeVisible();
    await expect(page.locator('#paywallDialog')).toBeHidden();
    await page.locator('#backBtn').click();
  }
  await page.getByRole('button', { name: 'wielka literka Ę, pełna wersja', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Wszystkie literki i cyferki' })).toBeVisible();
  await expect(page.locator('#paywallCopy')).toContainText('Leon');
  await expect(page.locator('#purchasePrice')).toContainText('4,99 zł');
  await expect(page.locator('.purchase-benefits li')).toHaveCount(3);
  await expect(page.locator('#parentGateDialog')).toBeHidden();
  await expect(page.locator('#buyBtn')).toBeHidden();
  await page.getByRole('button', { name: 'Zamknij pełną wersję' }).click();
  await page.getByRole('button', { name: 'mała literka a', exact: true }).click();
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.locator('#soundBtn')).toHaveCount(0);
});
test('settings, parent guide, direct privacy access and focus restoration', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ustawienia', exact: true }).click();
  await page.getByRole('button', { name: 'Informacje dla rodzica', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Od czego zacząć?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#parentInfoBtn')).toBeFocused();
  await page.getByRole('button', { name: 'Prywatność', exact: true }).click();
  await expect(page.locator('#privacyDialog')).toBeVisible();
  await expect(page.locator('#parentGateDialog')).toBeHidden();
  await page.getByRole('button', { name: 'Zamknij prywatność', exact: true }).click();
  await expect(page.locator('#privacyBtn')).toBeFocused();
  await page.getByRole('button', { name: 'Prywatność', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#privacyDialog')).toBeHidden();
  await expect(page.locator('#privacyBtn')).toBeFocused();
});
test('small-screen layout and offline game', async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(74);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'wielka literka Ą', exact: true }).click();
  await expect(page.locator('#game')).toBeVisible();
  await page.getByRole('button', { name: 'Wróć do wszystkich literek' }).click();
  await page.getByRole('button', { name: 'cyferka 0, pełna wersja' }).click();
  await expect(page.locator('#paywallDialog')).toBeVisible();
});
