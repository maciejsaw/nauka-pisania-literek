import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Purchases, ENTITLEMENT_VERIFICATION_MODE } from '@revenuecat/purchases-capacitor';
import { Access } from './access.js';
import { Billing } from './billing.js';
export { purchaseError } from './billing.js';
export const access = new Access();
export const native = Capacitor.isNativePlatform();
const billing = new Billing(Purchases, access);
export async function initPurchases() {
  if (!native) return;
  const apiKey = Capacitor.getPlatform() === 'ios' ? import.meta.env.VITE_REVENUECAT_IOS_KEY : import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
  if (!apiKey) return;
  await billing.initialize({ apiKey, entitlementVerificationMode: ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL });
  await App.addListener('appStateChange', ({ isActive }) => { if (isActive) void billing.refresh(); });
}
export const loadProduct = () => billing.loadProduct();
export const isConfigured = () => billing.configured;
export const purchase = () => billing.purchase();
export const restore = () => billing.restore();
