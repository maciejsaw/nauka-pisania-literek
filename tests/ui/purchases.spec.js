import { test, expect } from './fixtures.js';
import { billingDevice, confirmParent, openOffer } from './billing-device.js';

for (const platform of ['ios', 'android']) {
  test(`${platform}: offer first, gated purchase, visible waiting, success and paid restart`, async ({ page }, testInfo) => {
    await billingDevice(page, { platform, currency: 'USD' });
    await openOffer(page);
    await expect(page.locator('#parentGateDialog')).toBeHidden();
    await expect(page.locator('#purchasePrice')).toHaveText('4,99 zł jednorazowo');
    await expect(page.locator('#purchaseTerms')).toBeEmpty();
    await expect(page.locator('#paywallCopy')).toContainText('Cześć, tu Maciej! Stworzyliśmy tę aplikację razem z synkiem Leonem');
    await expect(page.locator('.purchase-benefits li')).toHaveCount(3);
    await expect(page.locator('#buyBtn')).toHaveText('Kup pełną wersję');
    await expect(page.locator('#buyBtn')).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath('offer.png') });
    await page.locator('#buyBtn').click();
    await expect(page.locator('#parentGateTitle')).toHaveText('Weryfikacja rodzica');
    await expect(page.locator('#parentReason')).toContainText('Przed zakupem');
    await expect(page.locator('#parentPrivacy')).toContainText('Nie zapisujemy');
    expect(await page.evaluate(() => window.billingTest.calls.includes('purchaseStoreProduct'))).toBe(false);
    await page.locator('#parentAnswer').fill(String(new Date().getFullYear() - 7));
    await page.locator('#parentForm button').click();
    await expect(page.locator('#parentError')).not.toBeEmpty();
    expect(await page.evaluate(() => window.billingTest.calls.includes('purchaseStoreProduct'))).toBe(false);
    await confirmParent(page);
    await expect(page.locator('#parentGateDialog')).toBeHidden();
    await expect(page.locator('#parentAnswer')).toHaveValue('');
    await expect(page.locator('#purchaseProgress')).toBeVisible();
    await expect(page.locator('#purchaseProgress .purchase-spinner')).toBeInViewport();
    await expect(page.locator('#buyBtn')).toBeDisabled();
    await expect(page.locator('#paywallDialog')).toHaveAttribute('aria-busy', 'true');
    // Foreground event from the payment sheet must not replace pending purchase data.
    await page.evaluate(() => window.billingTest.listeners.appStateChange.forEach(fn => fn({ isActive: true })));
    await expect(page.locator('#purchaseProgress')).toBeVisible();
    await expect(page.locator('.tile.locked')).toHaveCount(59);
    await page.screenshot({ path: testInfo.outputPath('waiting.png') });
    await page.evaluate(() => window.billingTest.finishPurchase('paid'));
    await expect(page.locator('#purchaseSuccess')).toBeVisible();
    await expect(page.locator('#purchaseProgress')).toBeHidden();
    await expect(page.locator('#purchaseOffer')).toBeHidden();
    await expect(page.locator('#buyBtn')).toBeHidden();
    await expect(page.locator('.tile.locked')).toHaveCount(0);
    await expect(page.locator('#purchaseSpider svg.big')).toBeVisible();
    await expect(page.locator('#purchaseContinue')).toHaveText('Gotowe');
    await page.screenshot({ path: testInfo.outputPath('success.png') });
    await page.locator('#purchaseContinue').click();
    await expect(page.locator('#paywallDialog')).toBeHidden();
    await page.getByRole('button', { name: 'mała literka ę', exact: true }).click();
    await expect(page.locator('#game')).toBeVisible();
    await page.reload();
    await expect(page.locator('.tile.locked')).toHaveCount(0);
    await page.locator('#settingsBtn').click();
    await expect(page.locator('#fullVersionBtn')).toContainText('Pełna wersja odblokowana');
    await expect(page.locator('#fullVersionBtn svg')).toBeVisible();
    await page.locator('#fullVersionBtn').click();
    await expect(page.locator('#purchaseSuccess')).toBeVisible();
    await expect(page.locator('#purchaseOffer')).toBeHidden();
    await expect(page.locator('#restoreBtn')).toBeHidden();
    await expect(page.locator('#parentGateDialog')).toBeHidden();
    await page.locator('#purchaseContinue').click();
    await expect(page.locator('#settingsDialog')).toBeHidden();
  });
}

test('cancelling the parent gate never starts payment', async ({ page }) => {
  await billingDevice(page); await openOffer(page);
  await page.locator('#buyBtn').click();
  await page.locator('#parentAnswer').fill('1985');
  await page.locator('#parentCancel').click();
  await expect(page.locator('#parentAnswer')).toHaveValue('');
  await expect(page.locator('#purchaseOffer')).toBeVisible();
  await expect(page.locator('#purchaseProgress')).toBeHidden();
  expect(await page.evaluate(() => window.billingTest.calls.includes('purchaseStoreProduct'))).toBe(false);
});

test('cancelled or failed payments stop the spinner and return to the offer', async ({ page }) => {
  await billingDevice(page); await openOffer(page);
  for (const outcome of ['cancel', 'error']) {
    await page.locator('#buyBtn').click(); await confirmParent(page);
    await expect(page.locator('#purchaseProgress')).toBeVisible();
    await page.evaluate(outcome => window.billingTest.finishPurchase(outcome), outcome);
    await expect(page.locator('#purchaseProgress')).toBeHidden();
    await expect(page.locator('#purchaseOffer')).toBeVisible();
    await expect(page.locator('#purchaseStatus')).toContainText(outcome === 'cancel' ? 'anulowany' : 'Nie udało się');
    await expect(page.locator('#buyBtn')).toBeEnabled();
    await expect(page.locator('.tile.locked')).toHaveCount(59);
  }
});

test('payment stays busy while fresh confirmation is fetched, then unlocks', async ({ page }) => {
  await billingDevice(page); await openOffer(page);
  await page.locator('#buyBtn').click(); await confirmParent(page);
  await expect(page.locator('#purchaseProgress')).toBeVisible();
  await page.evaluate(() => { window.billingTest.holdConfirmation = true; window.billingTest.finishPurchase('unconfirmed'); });
  await expect.poll(() => page.evaluate(() => !!window.billingTest.finishConfirmation)).toBe(true);
  await expect(page.locator('#purchaseProgress')).toBeVisible();
  await expect(page.locator('.tile.locked')).toHaveCount(59);
  await page.evaluate(() => window.billingTest.finishConfirmation(true));
  await expect(page.locator('#purchaseSuccess')).toBeVisible();
  await expect(page.locator('#purchaseProgress')).toBeHidden();
  await expect(page.locator('.tile.locked')).toHaveCount(0);
});

for (const outcome of ['unconfirmed', 'pending']) {
  test(`${outcome}: no false success, no duplicate purchase, later confirmation unlocks`, async ({ page }) => {
    await billingDevice(page); await openOffer(page);
    await page.locator('#buyBtn').click(); await confirmParent(page);
    await expect(page.locator('#purchaseProgress')).toBeVisible();
    await page.evaluate(outcome => window.billingTest.finishPurchase(outcome), outcome);
    await expect(page.locator('#purchaseProgress')).toBeHidden();
    await expect(page.locator('#buyBtn')).toBeHidden();
    await expect(page.locator('#restoreBtn')).toHaveText('Sprawdź zakup');
    await expect(page.locator('.tile.locked')).toHaveCount(59);
    await page.evaluate(() => window.billingTest.notify(true));
    await expect(page.locator('#purchaseSuccess')).toBeVisible();
    await expect(page.locator('.tile.locked')).toHaveCount(0);
  });
}

test('missing price can be retried and restores require a parent', async ({ page }) => {
  await billingDevice(page, { noProduct: true }); await openOffer(page);
  await expect(page.locator('#purchaseRetry')).toBeVisible();
  await expect(page.locator('#buyBtn')).toBeDisabled();
  await page.evaluate(() => { window.billingTest.noProduct = false; });
  await page.locator('#purchaseRetry').click();
  await expect(page.locator('#purchasePrice')).toHaveText('4,99 zł jednorazowo');
  await expect(page.locator('#buyBtn')).toBeEnabled();
  await page.locator('#restoreBtn').click();
  await expect(page.locator('#parentGateDialog')).toBeVisible();
  await page.evaluate(() => { window.billingTest.paid = true; });
  await confirmParent(page);
  await expect(page.locator('#purchaseSuccess')).toBeVisible();
  await expect(page.locator('.tile.locked')).toHaveCount(0);
});

test('early confirmation shows success and a late response does not reopen a closed dialog', async ({ page }) => {
  await billingDevice(page); await openOffer(page);
  await page.locator('#buyBtn').click(); await confirmParent(page);
  await expect(page.locator('#purchaseProgress')).toBeVisible();
  await page.evaluate(() => window.billingTest.notify(true));
  await expect(page.locator('#purchaseSuccess')).toBeVisible();
  await expect(page.locator('#purchaseProgress')).toBeHidden();
  await page.locator('#purchaseContinue').click();
  await page.evaluate(() => window.billingTest.finishPurchase('paid'));
  await expect(page.locator('#paywallDialog')).toBeHidden();
  await expect(page.locator('.tile.locked')).toHaveCount(0);
});

test('parent form, waiting and success fit between iPhone safe areas', async ({ page }) => {
  await billingDevice(page); await page.setViewportSize({ width: 390, height: 640 });
  await openOffer(page);
  await page.addStyleTag({ content: ':root { --safe-top: 59px; --safe-bottom: 34px; }' });
  async function safe(id) {
    const dialog = page.locator(id);
    const box = await dialog.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(74);
    expect(box.y + box.height).toBeLessThanOrEqual(591);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
  await safe('#paywallDialog');
  await page.locator('#buyBtn').click(); await safe('#parentGateDialog');
  await confirmParent(page);
  await expect(page.locator('#purchaseProgress')).toBeVisible();
  await safe('#paywallDialog');
  await page.evaluate(() => window.billingTest.finishPurchase('paid'));
  await expect(page.locator('#purchaseContinue')).toBeInViewport();
  await safe('#paywallDialog');
});
