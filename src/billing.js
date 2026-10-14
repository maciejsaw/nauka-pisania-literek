import { PRODUCT_ID } from './access.js';

// Store adapter separated from UI so payment failures can be tested without real charges.
export class Billing {
  configured = false;
  product;
  busy = false;
  constructor(sdk, access) { this.sdk = sdk; this.access = access; }
  async initialize(configuration) {
    await this.sdk.configure(configuration);
    this.configured = true;
    await this.sdk.addCustomerInfoUpdateListener(info => this.access.update(info));
    await this.refresh();
  }
  async refresh() {
    if (!this.configured) return;
    // RevenueCat supplies its own native cache offline; never invent a paid flag.
    try { const { customerInfo } = await this.sdk.getCustomerInfo(); this.access.update(customerInfo); }
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
    try {
      const { customerInfo } = await this.sdk.purchaseStoreProduct({ product: this.product });
      this.access.update(customerInfo);
      return this.access.full;
    } finally { this.busy = false; }
  }
  async restore() {
    if (this.busy || !this.configured) throw new Error('Restore unavailable');
    this.busy = true;
    try {
      const { customerInfo } = await this.sdk.restorePurchases();
      this.access.update(customerInfo);
      return this.access.full;
    } finally { this.busy = false; }
  }
}
export function purchaseError(error) {
  if (error?.userCancelled || String(error?.code) === '1') return 'Zakup anulowany. Możecie dalej korzystać z darmowych literek.';
  if (String(error?.code) === '20') return 'Zakup czeka na zatwierdzenie. Literki odblokują się po potwierdzeniu płatności lub zgodzie rodzica.';
  return 'Nie udało się połączyć ze sklepem. Sprawdź internet i spróbuj ponownie. Jeśli zakup został już opłacony, wybierz „Przywróć zakup”.';
}
