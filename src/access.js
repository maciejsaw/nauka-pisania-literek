// All entry points use the same rule. Never trust a flag in localStorage for purchases.
export const FREE_PAIRS = Object.freeze(['a', 'ą', 'b', 'c', 'ć', 'd', 'e']);
export const PRODUCT_ID = 'full_version';
export const ENTITLEMENT_ID = 'full_version';
export function hasFullVersion(info) {
  const entitlement = info?.entitlements?.active?.[ENTITLEMENT_ID];
  return Boolean(entitlement?.isActive && entitlement.productIdentifier === PRODUCT_ID
    && entitlement.verification !== 'FAILED' && info?.entitlements?.verification !== 'FAILED');
}
export class Access extends EventTarget {
  #full = false;
  constructor(reviewAccess) {
    super();
    this.reviewAccess = reviewAccess;
    reviewAccess?.addEventListener('change', () => this.dispatchEvent(new Event('change')));
  }
  get paid() { return this.#full; }
  get full() { return this.#full || Boolean(this.reviewAccess?.active); }
  canPlay(ch) { return this.full || FREE_PAIRS.includes(ch.toLocaleLowerCase('pl')); }
  update(info) {
    const next = hasFullVersion(info);
    if (next !== this.#full) { this.#full = next; this.dispatchEvent(new Event('change')); }
  }
}
