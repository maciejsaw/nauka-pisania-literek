import { PRODUCT_ID } from './access.js';

// Store adapter separated from UI so payment failures can be tested without real charges.
export class Billing {
  configured = false;
  product;
  busy = false;
  revision = 0;
  latestRequestDate = 0;
  constructor(sdk, access) { this.sdk = sdk; this.access = access; }
  async initialize(configuration) {
    await this.sdk.configure(configuration);
    this.configured = true;
    await this.sdk.addCustomerInfoUpdateListener(info => this.update(info));
    await this.refresh();
  }
  update(info) {
    const requested = Date.parse(info?.requestDate);
    if (Number.isFinite(requested) && requested < this.latestRequestDate) return;
    if (Number.isFinite(requested)) this.latestRequestDate = requested;
    this.revision++;
    this.access.update(info);
  }
  async refresh() {
    if (!this.configured || this.busy) return;
    const revision = this.revision;
    // RevenueCat supplies its own native cache offline; never invent a paid flag.
    try {
      const { customerInfo } = await this.sdk.getCustomerInfo();
      // An earlier foreground refresh must not overwrite a completed purchase.
      if (revision === this.revision && !this.busy) this.update(customerInfo);
    }
    catch { /* A temporary network failure must not revoke a known purchase. */ }
  }
  async loadProduct() {
    if (!this.configured) return undefined;
    const { products } = await this.sdk.getProducts({ productIdentifiers: [PRODUCT_ID], type: 'NON_SUBSCRIPTION' });
    this.product = products.find(p => p.identifier === PRODUCT_ID);
    return this.product;
  }
  async purchase() {
    if (this.busy || !this.configured || !this.product) throw new Error('Purchase unavailable');
    this.busy = true;
    this.revision++;
    try {
      const { customerInfo } = await this.sdk.purchaseStoreProduct({ product: this.product });
      this.update(customerInfo);
      if (!this.access.paid) await this.checkConfirmation();
      return this.access.paid;
    } finally { this.busy = false; }
  }
  async restore() {
    if (this.busy || !this.configured) throw new Error('Restore unavailable');
    this.busy = true;
    this.revision++;
    try {
      const { customerInfo } = await this.sdk.restorePurchases();
      this.update(customerInfo);
      return this.access.paid;
    } finally { this.busy = false; }
  }
  async checkConfirmation() {
    // A successful store transaction can precede the entitlement update.
    // Fetch fresh data once; listener / foreground refresh handle later approval.
    try {
      await this.sdk.invalidateCustomerInfoCache();
      const { customerInfo } = await this.sdk.getCustomerInfo();
      this.update(customerInfo);
    } catch { /* UI offers retry; only verified store data may unlock exercises. */ }
  }
  async syncStoreCode() {
    if (this.busy || !this.configured) throw new Error('Store unavailable');
    this.busy = true;
    this.revision++;
    try {
      // Redemption happened in the store app, outside purchaseStoreProduct.
      await this.sdk.syncPurchases();
      await this.sdk.invalidateCustomerInfoCache();
      const { customerInfo } = await this.sdk.getCustomerInfo();
      this.update(customerInfo);
      return this.access.paid;
    } finally { this.busy = false; }
  }
}
export function purchaseError(error) {
  if (error?.userCancelled || String(error?.code) === '1') return 'Zakup anulowany. Możecie dalej korzystać z darmowych literek.';
  if (String(error?.code) === '20') return 'Zakup czeka na zatwierdzenie. Literki odblokują się po potwierdzeniu płatności lub zgodzie rodzica.';
  return 'Nie udało się połączyć ze sklepem. Sprawdź internet i spróbuj ponownie. Jeśli zakup został już opłacony, wybierz „Przywróć zakup”.';
}
