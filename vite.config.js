import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const config = JSON.parse(readFileSync(new URL('./review-access-config.json', import.meta.url)));
export default defineConfig(({ mode }) => ({
  base: './',
  // The known test credential exists only in build/e2e, never in dist or store packages.
  define: { ...(mode === 'e2e' ? {
    'import.meta.env.VITE_REVENUECAT_IOS_KEY': JSON.stringify('appl_e2e_mock'),
    'import.meta.env.VITE_REVENUECAT_ANDROID_KEY': JSON.stringify('goog_e2e_mock'),
  } : {}), __REVIEW_ACCESS_HASH__: JSON.stringify(mode === 'e2e'
    ? createHash('sha256').update('0123456789ABCDEF0123456789ABCDEF01234567').digest('hex')
    : config.sha256) },
  build: { target: 'es2022', outDir: mode === 'e2e' ? 'build/e2e' : 'dist' },
}));
