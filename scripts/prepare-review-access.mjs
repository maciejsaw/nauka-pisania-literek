import { randomBytes, createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
const codePath = new URL('../secrets/google-review-code.txt', import.meta.url);
const configPath = new URL('../review-access-config.json', import.meta.url);
mkdirSync(new URL('../secrets/', import.meta.url), { recursive: true, mode: 0o700 });
if (existsSync(configPath) && !existsSync(codePath)) {
  throw new Error('Verifier already exists. Restore the private code from your backup; do not silently rotate it.');
}
const code = existsSync(codePath) ? readFileSync(codePath, 'utf8').trim() : randomBytes(20).toString('hex').toUpperCase();
const sha256 = createHash('sha256').update(code).digest('hex');
if (existsSync(configPath) && JSON.parse(readFileSync(configPath)).sha256 !== sha256) {
  throw new Error('Private code does not match the bundled verifier. Restore the matching backup.');
}
writeFileSync(codePath, `${code}\n`, { mode: 0o600 });
chmodSync(codePath, 0o600);
writeFileSync(configPath, `${JSON.stringify({ sha256 }, null, 2)}\n`);
console.log('Private code: secrets/google-review-code.txt. Public verifier: review-access-config.json. Code not printed.');
