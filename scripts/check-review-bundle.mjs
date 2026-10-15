import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const config = JSON.parse(readFileSync('review-access-config.json'));
const source = readdirSync('dist/assets').filter(name => name.endsWith('.js')).map(name => readFileSync(`dist/assets/${name}`, 'utf8')).join('\n');
const testCode = '0123456789ABCDEF0123456789ABCDEF01234567';
const testHash = createHash('sha256').update(testCode).digest('hex');
if (!/^[a-f0-9]{64}$/.test(config.sha256) || !source.includes(config.sha256) || source.includes(testHash) || source.includes(testCode)) {
  throw new Error('Production bundle must contain the release verifier and no E2E credential.');
}
if (existsSync('secrets/google-review-code.txt') && source.includes(readFileSync('secrets/google-review-code.txt', 'utf8').trim())) {
  throw new Error('Private review credential must never be included in the bundle.');
}
console.log('Production bundle has the release verifier; test and private credentials are absent.');
