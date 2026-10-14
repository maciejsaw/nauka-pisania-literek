import { createPrivateKey } from 'node:crypto';

const email = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const present = value => typeof value === 'string' && value.trim().length > 0;
export function decodeBase64(value) {
  const compact = value.replace(/\s/g, '');
  if (!compact || compact.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) throw new Error('base64');
  const data = Buffer.from(compact, 'base64');
  if (data.toString('base64') !== compact) throw new Error('base64');
  return data;
}
const privateKey = (value, type) => {
  const key = createPrivateKey(value);
  return key.asymmetricKeyType === type && (type !== 'ec' || key.asymmetricKeyDetails.namedCurve === 'prime256v1');
};

// Report only fixed labels: malformed credentials and personal details never enter logs.
export function releaseReadiness({ config, env = {}, stage = 'local', production = false }) {
  if (!['local', 'build', 'publish'].includes(stage)) throw new Error('Nieznany etap kontroli.');
  const checks = [];
  function check(id, ok, label, step) { checks.push({ id, ok: Boolean(ok), label, step }); }
  function setting(key, kind, step, valid = () => true, hint = 'wartość jest wymagana') {
    const value = env[key];
    let ok = false;
    try { ok = present(value) && valid(value); } catch { /* fixed, non-sensitive error below */ }
    check(key, ok, `${kind} ${key}: ${hint}`, step);
  }
  if (stage !== 'local') {
    setting('VITE_REVENUECAT_IOS_KEY', 'Variable', 4, value => /^appl_[A-Za-z0-9]+$/.test(value), 'publiczny klucz SDK Apple (appl_)');
    setting('VITE_REVENUECAT_ANDROID_KEY', 'Variable', 4, value => /^goog_[A-Za-z0-9]+$/.test(value), 'publiczny klucz SDK Google (goog_)');
    setting('APPLE_TEAM_ID', 'Variable', 3, value => /^[A-Z0-9]{10}$/.test(value), '10 znaków Apple Team ID');
    for (const key of ['IOS_P12_BASE64', 'IOS_PROFILE_BASE64', 'ANDROID_KEYSTORE_BASE64']) {
      setting(key, 'Secret', 5, value => decodeBase64(value).length > 0, 'pełny plik zakodowany base64');
    }
    for (const key of ['IOS_CERT_PASSWORD', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD']) setting(key, 'Secret', 5);
  }
  if (stage === 'publish') {
    setting('ASC_KEY_ID', 'Variable', 6, value => /^[A-Z0-9]{10}$/.test(value), '10 znaków identyfikatora klucza App Store Connect');
    setting('ASC_ISSUER_ID', 'Variable', 6, value => /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value), 'Issuer ID zespołowego klucza API');
    setting('ASC_KEY_P8_BASE64', 'Secret', 6, value => privateKey(decodeBase64(value), 'ec'), 'klucz prywatny .p8 App Store Connect zakodowany base64');
    setting('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', 'Secret', 6, value => {
      const account = JSON.parse(value);
      return account?.type === 'service_account' && email(account.client_email) && present(account.project_id) && privateKey(account.private_key, 'rsa');
    }, 'pełny JSON konta usługi Google z kluczem prywatnym');
  }
  if (production) {
    const flags = { contentRightsConfirmed: 2, privacyDeclarationsReviewed: 10, storeListingsCompleted: 10, sandboxPurchasesVerified: 9, screenshotsReviewed: 10 };
    for (const [key, step] of Object.entries(flags)) check(key, config[key] === true, `release-config.json → ${key}: potwierdź dopiero po wykonaniu zadania`, step);
    check('supportEmail', email(config.supportEmail), 'release-config.json → supportEmail: publiczny adres pomocy', 2);
    if (stage === 'publish') setting('REVIEW_CONTACT_JSON', 'Secret', 6, value => {
      const contact = JSON.parse(value);
      return present(contact?.firstName) && present(contact?.lastName) && email(contact?.email) && typeof contact?.phone === 'string' && contact.phone.replace(/\D/g, '').length >= 7;
    }, 'JSON kontaktu dla recenzenta: firstName, lastName, email, phone');
  }
  return checks;
}

export function readinessMarkdown(checks, { stage, production }) {
  const pending = checks.filter(check => !check.ok);
  return `# Pajączek — gotowość do wydania\n\nEtap: ${stage}. Wersja: ${production ? 'produkcyjna' : 'testowa'}.\n\n` +
    (pending.length ? `Do uzupełnienia: **${pending.length}**. Numery kroków odnoszą się do [instrukcji](https://github.com/maciejsaw/nauka-pisania-literek/blob/main/docs/RELEASE-KROK-PO-KROKU.md).\n\n` : 'Wszystkie kontrole tego etapu przeszły.\n\n') +
    checks.map(check => `- [${check.ok ? 'x' : ' '}] ${check.label} (krok ${check.step})`).join('\n') +
    '\n\nRaport sprawdza obecność i format ustawień. Podpisy sprawdzamy podczas przygotowania paczek; uprawnienia kont, aktywność produktów i prawdziwe zakupy wymagają konfiguracji i próby w sklepach. Raport nie łączy się ze sklepami i niczego nie publikuje.\n';
}
