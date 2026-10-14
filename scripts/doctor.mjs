import { readFile, access, appendFile, writeFile } from 'node:fs/promises';
import { releaseReadiness, readinessMarkdown } from './release-readiness.mjs';
const config = JSON.parse(await readFile('release-config.json', 'utf8'));
const production = process.env.RELEASE_CHANNEL === 'production' || process.argv.includes('--production');
const stage = process.argv.includes('--publish') ? 'publish' : process.argv.includes('--ci') ? 'build' : 'local';
const checks = releaseReadiness({ config, env: process.env, stage, production });
if (production) {
  for (const file of ['store/ios/screenshots/pl/1-iphone.png','store/ios/screenshots/pl/1-ipad.png','store/android/metadata/pl-PL/images/phoneScreenshots/1.png']) {
    let exists = true; try { await access(file); } catch { exists = false; }
    checks.push({ id: file, ok: exists, label: `Zrzut ${file}`, step: 10 });
  }
}
const report = readinessMarkdown(checks, { stage, production });
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, report);
const reportIndex = process.argv.indexOf('--report');
if (reportIndex >= 0) {
  if (!process.argv[reportIndex + 1]) throw new Error('Podaj ścieżkę po --report');
  await writeFile(process.argv[reportIndex + 1], report);
}
const errors = checks.filter(check => !check.ok);
if (errors.length) {
  console.error(errors.map(check => `• ${check.label} — instrukcja, krok ${check.step}`).join('\n'));
  console.error(`\nDo uzupełnienia: ${errors.length}. docs/RELEASE-KROK-PO-KROKU.md`);
  process.exitCode = 1;
} else console.log(stage === 'local' && !production ? 'Konfiguracja kont: Actions → Release readiness. Lokalna kontrola przed produkcją: npm run doctor -- --production.' : 'Kontrole wybranego etapu przeszły. Uprawnienia kont i zakupy wymagają próby w sklepach.');
