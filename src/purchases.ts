import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Purchases, PRODUCT_CATEGORY, ENTITLEMENT_VERIFICATION_MODE, type PurchasesStoreProduct } from '@revenuecat/purchases-capacitor';
import { Access, PRODUCT_ID } from './access.js';
export const access = new Access();
export const native = Capacitor.isNativePlatform();
let configured = false;
let product: PurchasesStoreProduct | undefined;
let operation = false;
export async function initPurchases() {
  if (!native) return;
  const apiKey = Capacitor.getPlatform() === 'ios' ? import.meta.env.VITE_REVENUECAT_IOS_KEY : import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
  if (!apiKey) return;
  await Purchases.configure({ apiKey, entitlementVerificationMode: ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL });
  configured = true;
  await Purchases.addCustomerInfoUpdateListener(info => access.update(info));
  await refreshAccess();
  await App.addListener('appStateChange', ({ isActive }) => { if (isActive) void refreshAccess(); });
}
export async function refreshAccess() {
  if (!configured) return;
  // The native SDK supplies verified cached CustomerInfo offline. Network errors never revoke a known purchase.
  try { const { customerInfo } = await Purchases.getCustomerInfo(); access.update(customerInfo); } catch { /* Retry on foreground / restore. */ }
}
export async function loadProduct() {
  if (!configured) return undefined;
  const { products } = await Purchases.getProducts({ productIdentifiers: [PRODUCT_ID], type: PRODUCT_CATEGORY.NON_SUBSCRIPTION });
  product = products.find(p => p.identifier === PRODUCT_ID);
  return product;
}
export function isConfigured() { return configured; }
export async function purchase() {
  if (operation || !configured || !product) throw new Error('Zakup jest teraz niedostępny. Spróbuj ponownie.');
  operation = true;
  try {
    const result = await Purchases.purchaseStoreProduct({ product });
    access.update(result.customerInfo);
    return access.full;
  } finally { operation = false; }
}
export async function restore() {
  if (operation || !configured) throw new Error('Przywracanie jest teraz niedostępne.');
  operation = true;
  try { const { customerInfo } = await Purchases.restorePurchases(); access.update(customerInfo); return access.full; }
  finally { operation = false; }
}
export function purchaseError(error: unknown): string {
  const e = error as { code?: string | number; userCancelled?: boolean };
  if (e?.userCancelled || String(e?.code) === '1') return 'Zakup anulowany. Możecie dalej korzystać z darmowych literek.';
  if (String(e?.code) === '20') return 'Zakup czeka na zatwierdzenie. Literki odblokują się po potwierdzeniu płatności lub zgodzie rodzica.';
  return 'Nie udało się połączyć ze sklepem. Sprawdź internet i spróbuj ponownie. Jeśli zakup został już opłacony, wybierz „Przywróć zakup”.';
}
