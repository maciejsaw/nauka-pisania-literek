// Explicit, free review access on Android. Never changes store purchases or RevenueCat.
// A high-entropy code is kept private in Play Console; only its SHA-256 is bundled.
export class ReviewAccess extends EventTarget {
  #active = false;
  constructor({ enabled, hash, storage }) {
    super();
    this.enabled = enabled && /^[a-f0-9]{64}$/.test(hash);
    this.hash = hash;
    this.storage = storage;
  }
  get active() { return this.#active; }
  async valid(code) {
    if (!this.enabled || typeof code !== 'string' || code.length > 120) return false;
    const normalized = code.replace(/[\s-]/g, '').toUpperCase();
    if (!/^[A-F0-9]{40}$/.test(normalized)) return false;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('') === this.hash;
  }
  #set(value) {
    if (value === this.#active) return;
    this.#active = value;
    this.dispatchEvent(new Event('change'));
  }
  async initialize() {
    if (!this.enabled) return;
    try { this.#set(await this.valid(await this.storage.get())); }
    catch { this.#set(false); }
  }
  async activate(code) {
    if (!await this.valid(code)) return false;
    // Persist the credential, never a trusted boolean. Revalidate it on every launch.
    await this.storage.set(code.replace(/[\s-]/g, '').toUpperCase());
    this.#set(true);
    return true;
  }
  async deactivate() {
    await this.storage.remove();
    this.#set(false);
  }
}
