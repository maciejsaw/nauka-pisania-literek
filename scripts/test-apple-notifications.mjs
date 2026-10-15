// Sends Apple's TEST notification, never a purchase, refund, or entitlement change.
import { readFileSync } from 'node:fs';
import { sign } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const config = JSON.parse(readFileSync(new URL('../release-config.json', import.meta.url)));
const keyPath = process.env.APPLE_IAP_KEY_PATH;
const keyId = process.env.APPLE_IAP_KEY_ID;
const issuer = process.env.ASC_ISSUER_ID;
if (!keyPath || !keyId || !issuer) throw new Error('Set APPLE_IAP_KEY_PATH, APPLE_IAP_KEY_ID and ASC_ISSUER_ID. Use the In-App Purchase key.');
const key = readFileSync(keyPath);
const encode = object => Buffer.from(JSON.stringify(object)).toString('base64url');
function request(base, method, path) {
  const now = Math.floor(Date.now() / 1000);
  const payload = `${encode({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${encode({ iss: issuer, iat: now, exp: now + 300, aud: 'appstoreconnect-v1', bid: config.bundleId })}`;
  const jwt = `${payload}.${sign('sha256', Buffer.from(payload), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
  // Pass the authorization header over stdin, never in process arguments or logs.
  const result = execFileSync('/usr/bin/curl', ['--silent', '--show-error', '--max-time', '30', '--config', '-', '--request', method, '--write-out', '\n%{http_code}', `${base}/inApps/v1/notifications/test${path}`], { input: `header = "Authorization: Bearer ${jwt}"\n`, encoding: 'utf8' });
  const split = result.lastIndexOf('\n');
  const status = Number(result.slice(split + 1));
  if (status !== 200) throw new Error(`Apple HTTP ${status}: ${result.slice(0, split)}`);
  return JSON.parse(result.slice(0, split));
}
const environments = process.argv.includes('--production') ? [['production', 'https://api.storekit.apple.com']] : [['sandbox', 'https://api.storekit-sandbox.apple.com']];
for (const [environment, base] of environments) {
  const sent = request(base, 'POST', '');
  const status = request(base, 'GET', `/${encodeURIComponent(sent.testNotificationToken)}`);
  console.log(JSON.stringify({ environment, sendAttempts: status.sendAttempts || [], note: 'This checks notification delivery, not a real purchase.' }));
}
