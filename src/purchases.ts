import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { Purchases, ENTITLEMENT_VERIFICATION_MODE } from '@revenuecat/purchases-capacitor';
import { Access } from './access.js';
import { Billing } from './billing.js';
import { ReviewAccess } from './review-access.js';
export { purchaseError } from './billing.js';
export const native = Capacitor.isNativePlatform();
const reviewKey = 'pajaczek-review-credential-v1';
export const reviewAccess = new ReviewAccess({
  enabled: native && Capacitor.getPlatform() === 'android',
  hash: __REVIEW_ACCESS_HASH__,
  storage: {
    get: async () => (await Preferences.get({ key: reviewKey })).value,
    set: (value: string) => Preferences.set({ key: reviewKey, value }),
    remove: () => Preferences.remove({ key: reviewKey }),
  },
});
export const access = new Access(reviewAccess);
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
