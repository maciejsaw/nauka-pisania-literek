import { readFile, access } from 'node:fs/promises';
const config = JSON.parse(await readFile('release-config.json', 'utf8'));
const production = process.env.RELEASE_CHANNEL === 'production' || process.argv.includes('--production');
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
if (process.argv.includes('--ci')) {
  for (const key of ['VITE_REVENUECAT_IOS_KEY','VITE_REVENUECAT_ANDROID_KEY']) {
    check(Boolean(process.env[key]), `Brak zmiennej ${key}`);
    check(!process.env[key]?.startsWith('test_') && !process.env[key]?.startsWith('sk_'), `${key}: wymagany publiczny klucz platformy, nie testowy ani sekretny`);
  }
}
if (production) {
  for (const key of ['contentRightsConfirmed','privacyDeclarationsReviewed','storeListingsCompleted','sandboxPurchasesVerified','screenshotsReviewed']) check(config[key] === true, `Potwierdź ${key} w release-config.json po wykonaniu zadania z docs/RELEASE-KROK-PO-KROKU.md`);
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail), 'Uzupełnij supportEmail');
  if (process.argv.includes('--ci')) {
    let contact = {}; try { contact = JSON.parse(process.env.REVIEW_CONTACT_JSON || '{}'); } catch {}
    for (const field of ['firstName','lastName','email','phone']) check(Boolean(contact[field]), `Uzupełnij sekret REVIEW_CONTACT_JSON: ${field}`);
  }
  for (const file of ['store/ios/screenshots/pl/1-iphone.png','store/ios/screenshots/pl/1-ipad.png','store/android/metadata/pl-PL/images/phoneScreenshots/1.png']) {
    try { await access(file); } catch { errors.push(`Brak zrzutu ${file}`); }
  }
}
if (errors.length) { console.error(errors.map(x => `• ${x}`).join('\n')); process.exitCode = 1; }
else console.log(production ? 'Konfiguracja produkcyjna kompletna.' : 'Projekt gotowy do budowania. Przed produkcją uruchom npm run doctor -- --production.');
