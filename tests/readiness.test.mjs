import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { releaseReadiness, readinessMarkdown, decodeBase64 } from '../scripts/release-readiness.mjs';

const config = { contentRightsConfirmed: true, privacyDeclarationsReviewed: true, storeListingsCompleted: true, sandboxPurchasesVerified: true, screenshotsReviewed: true, supportEmail: 'help@example.com' };
const buildEnv = {
  VITE_REVENUECAT_IOS_KEY: 'appl_example', VITE_REVENUECAT_ANDROID_KEY: 'goog_example', APPLE_TEAM_ID: 'AB12345678',
  IOS_P12_BASE64: 'Zml4dHVyZQ==', IOS_PROFILE_BASE64: 'Zml4dHVyZQ==', ANDROID_KEYSTORE_BASE64: 'Zml4dHVyZQ==',
  IOS_CERT_PASSWORD: 'example', ANDROID_KEYSTORE_PASSWORD: 'example', ANDROID_KEY_ALIAS: 'upload', ANDROID_KEY_PASSWORD: 'example',
};
const key = options => generateKeyPairSync(options.type, options.params).privateKey.export({ type: 'pkcs8', format: 'pem' });
const publishEnv = {
  ...buildEnv, ASC_KEY_ID: 'AB12345678', ASC_ISSUER_ID: '12345678-1234-1234-1234-123456789abc',
  ASC_KEY_P8_BASE64: Buffer.from(key({ type: 'ec', params: { namedCurve: 'prime256v1' } })).toString('base64'),
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify({ type: 'service_account', project_id: 'test', client_email: 'test@example.iam.gserviceaccount.com', private_key: key({ type: 'rsa', params: { modulusLength: 2048 } }) }),
  REVIEW_CONTACT_JSON: JSON.stringify({ firstName: 'Test', lastName: 'Test', email: 'test@example.com', phone: '+48123456789' }),
};
const failed = options => releaseReadiness({ config, ...options }).filter(check => !check.ok).map(check => check.id);

test('bootstrap needs signing but no store API credentials; publish checks all missing fields at once', () => {
  assert.deepEqual(failed({ env: buildEnv, stage: 'build' }), []);
  assert.deepEqual(failed({ env: buildEnv, stage: 'publish' }), ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_P8_BASE64', 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON']);
  assert.equal(failed({ env: {}, stage: 'build' }).length, 10);
  assert.deepEqual(failed({ env: publishEnv, stage: 'publish', production: true }), []);
});

test('swapped RevenueCat keys, corrupted files, invalid private keys and contact are rejected without echoing values', () => {
  const env = { ...publishEnv, VITE_REVENUECAT_IOS_KEY: 'goog_confidential', VITE_REVENUECAT_ANDROID_KEY: 'sk_confidential', IOS_P12_BASE64: 'corrupted-secret', ASC_KEY_P8_BASE64: Buffer.from('sensitive-broken-key').toString('base64'), GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '{very-secret', REVIEW_CONTACT_JSON: 'null' };
  const checks = releaseReadiness({ config, env, stage: 'publish', production: true });
  assert.equal(checks.filter(check => !check.ok).length, 6);
  const report = readinessMarkdown(checks, { stage: 'publish', production: true });
  for (const value of Object.values(env)) assert.ok(!report.includes(value), 'report must not contain a credential value');
});

test('production remains blocked until actual manual tasks are confirmed; beta does not require confirmations', () => {
  assert.equal(failed({ config: {}, env: publishEnv, stage: 'publish', production: true }).length, 6);
  assert.deepEqual(failed({ config: {}, env: publishEnv, stage: 'publish' }), []);
  assert.ok(failed({ env: { ...publishEnv, REVIEW_CONTACT_JSON: '{"firstName":"A","lastName":"B","email":"wrong","phone":"1"}' }, stage: 'publish', production: true }).includes('REVIEW_CONTACT_JSON'));
});

test('base64 tolerates wrapped files but rejects silently truncated data', () => {
  assert.equal(decodeBase64('Zml4\ndHVyZQ==\n').toString(), 'fixture');
  for (const value of ['!!!', 'Zg', 'Zh==', '', 'Zm9v====']) assert.throws(() => decodeBase64(value));
});
