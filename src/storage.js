import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
const KEY = 'pajak-dwulinia-v3';
let progress = {};
let queue = Promise.resolve();
export async function initStorage() {
  try {
    const value = Capacitor.isNativePlatform() ? (await Preferences.get({ key: KEY })).value : localStorage.getItem(KEY);
    progress = value ? JSON.parse(value) : {};
  } catch { progress = {}; }
}
export function loadProgress() { return progress; }
export function saveProgress(value) {
  progress = value;
  const serialized = JSON.stringify(value);
  if (Capacitor.isNativePlatform()) {
    queue = queue.then(() => Preferences.set({ key: KEY, value: serialized })).catch(() => {});
  } else {
    try { localStorage.setItem(KEY, serialized); } catch { /* Private browsing / full storage. */ }
  }
}
