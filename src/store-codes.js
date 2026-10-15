// Codes are validated and redeemed by the store, never by a local password.
export function redemptionURL(platform, rawCode) {
  const code = rawCode.trim().replace(/[\s-]/g, '').toUpperCase();
  if (!/^[A-Z0-9]{3,64}$/.test(code)) throw new Error('invalid-code');
  if (platform === 'ios') return `https://apps.apple.com/redeem?ctx=offercodes&id=6823056260&code=${encodeURIComponent(code)}`;
  if (platform === 'android') return `https://play.google.com/redeem?code=${encodeURIComponent(code)}`;
  throw new Error('unsupported-platform');
}

export class StoreCodes {
  pending = false;
  busy = false;
  constructor(platform, launcher, billing) { this.platform = platform; this.launcher = launcher; this.billing = billing; }
  async open(code) {
    if (this.busy || !this.billing.configured) throw new Error('store-unavailable');
    const url = redemptionURL(this.platform, code);
    this.busy = true;
    this.pending = true;
    try {
      const result = await this.launcher.openUrl({ url });
      if (!result.completed) throw new Error('store-unavailable');
    } catch (error) { this.pending = false; throw error; }
    finally { this.busy = false; }
  }
  async check() {
    if (this.busy) return false;
    this.busy = true;
    try {
      const unlocked = await this.billing.syncStoreCode();
      this.pending = false;
      return unlocked;
    } finally { this.busy = false; }
  }
}
