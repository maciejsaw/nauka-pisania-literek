import '@fontsource/grandstander/latin-600.css';
import '@fontsource/grandstander/latin-ext-600.css';
import '@fontsource/grandstander/latin-800.css';
import '@fontsource/grandstander/latin-ext-800.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-ext-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-ext-700.css';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import './styles.css';
import './paywall.css';
import { initStorage } from './storage.js';
import { initGame } from './game.js';
import { initTouchFeedback } from './touch-feedback.js';
import { isAdultYear } from './parent-gate.js';
import { paywallPrice } from './paywall-price.js';
import { openStoreRating } from './store-rating.js';
import { access, reviewAccess, storeCodes, initPurchases, native, isConfigured, loadProduct, purchase, restore, purchaseError } from './purchases';

initTouchFeedback();

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const paywall = $<HTMLDialogElement>('paywallDialog');
const parentGate = $<HTMLDialogElement>('parentGateDialog');
const buy = $<HTMLButtonElement>('buyBtn');
const restoreBtn = $<HTMLButtonElement>('restoreBtn');
const status = $('purchaseStatus');
let parentAction: (() => Promise<void>) | undefined;
let session = 0;
let busy = false;
let loadingTimer: ReturnType<typeof setTimeout> | undefined;
const storeName = Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play';
function setBusy(value: boolean, message = '') {
  busy = value;
  clearTimeout(loadingTimer);
  buy.disabled = value || !buy.dataset.ready;
  restoreBtn.disabled = value || !isConfigured();
  $('paywallClose').toggleAttribute('disabled', value);
  paywall.setAttribute('aria-busy', String(value));
  $('purchaseProgress').hidden = !value;
  $('purchaseProgressText').textContent = message;
  $('purchaseProgressHint').textContent = 'To może chwilę potrwać. Prosimy o cierpliwość.';
  if (value) {
    $('purchaseOffer').hidden = true;
    $('purchaseProgress').scrollIntoView({ block: 'nearest' });
    loadingTimer = setTimeout(() => {
      $('purchaseProgressHint').textContent = 'Sklep nadal odpowiada. Jeśli wyświetliło się okno płatności, dokończ ją lub anuluj w tym oknie.';
    }, 12000);
  }
}
function renderFullVersionButton() {
  $('fullVersionLabel').textContent = access.full ? 'Pełna wersja odblokowana' : 'Odblokuj wszystkie literki';
}
function success() {
  if (!paywall.open) return;
  if (parentGate.open) parentGate.close();
  setBusy(false);
  paywall.dataset.state = 'success';
  $('paywallTitle').textContent = access.paid ? 'Dziękujemy za zakup!' : 'Pełna wersja odblokowana!';
  $('purchaseOffer').hidden = true;
  $('purchaseSuccess').hidden = false;
  $('purchaseSuccessCopy').textContent = access.paid
    ? 'Wszystkie literki i cyferki są już dostępne. Dziękujemy za wsparcie! Życzymy udanej zabawy!'
    : 'Kod odblokował wszystkie literki i cyferki. Miłego pisania z Pajączkiem!';
  buy.hidden = true; restoreBtn.hidden = true;
  $('purchaseRetry').hidden = true;
  status.textContent = '';
  $('purchaseContinue').focus({ preventScroll: true });
  $('purchaseSuccess').scrollIntoView({ block: 'nearest' });
}
async function openPaywall() {
  const current = ++session;
  paywall.dataset.state = 'offer';
  $('paywallTitle').textContent = 'Wszystkie literki i cyferki';
  $('paywallCopy').textContent = 'Cześć, tu Maciej! Stworzyliśmy tę aplikację razem z synkiem Leonem i spędziliśmy sporo czasu na dopracowaniu szczegółów. Zapraszamy do kupna pełnej wersji za symboliczną kwotę.';
  $('purchasePrice').textContent = native ? 'Pobieramy cenę…' : '4,99 zł jednorazowo';
  $('purchaseTerms').textContent = '';
  $('purchaseOffer').hidden = false;
  $('purchaseSuccess').hidden = true;
  $('purchaseRetry').hidden = true;
  buy.textContent = 'Kup pełną wersję';
  buy.hidden = !native; restoreBtn.hidden = !native;
  restoreBtn.textContent = 'Przywróć zakup';
  delete buy.dataset.ready;
  setBusy(false);
  status.textContent = '';
  if (!paywall.open) paywall.showModal();
  if (access.full) { success(); return; }
  if (!native) {
    status.textContent = 'To pokazowa wersja w przeglądarce. Zakup jest dostępny tylko w aplikacji na iPhone’a, iPada lub Androida.';
    return;
  }
  try {
    await purchaseReady;
    const product = await loadProduct();
    if (current !== session || !paywall.open) return;
    if (access.full) { success(); return; }
    if (!product) throw new Error('unavailable');
    const price = paywallPrice(product);
    $('purchasePrice').textContent = price.price;
    $('purchaseTerms').textContent = price.note;
    buy.textContent = 'Kup pełną wersję';
    buy.dataset.ready = 'true'; setBusy(false);
  } catch {
    if (current !== session || !paywall.open) return;
    if (access.full) { success(); return; }
    $('purchasePrice').textContent = 'Nie udało się pobrać ceny';
    status.textContent = 'Sprawdź połączenie z internetem i spróbuj ponownie. Bezpłatne literki nadal działają.';
    $('purchaseRetry').hidden = false;
    setBusy(false);
  }
}
function requestPaywall() {
  void openPaywall();
}
function askParent(action: () => Promise<void>, reason = 'Ten krok jest dla rodzica lub opiekuna. Prosimy o krótką weryfikację przed przejściem dalej.') {
  if (parentGate.open) return;
  parentAction = action;
  $('parentReason').textContent = reason;
  $<HTMLInputElement>('parentAnswer').value = '';
  $('parentError').textContent = '';
  parentGate.showModal();
}
$('parentForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!isAdultYear($<HTMLInputElement>('parentAnswer').value)) {
    $('parentError').textContent = 'Ten krok jest dla osoby dorosłej. Poproś rodzica o wpisanie jego roku urodzenia.'; return;
  }
  const action = parentAction; parentAction = undefined;
  $<HTMLInputElement>('parentAnswer').value = '';
  parentGate.close();
  await action?.();
});
$('parentCancel').addEventListener('click', () => parentGate.close());
parentGate.addEventListener('close', () => {
  parentAction = undefined;
  $<HTMLInputElement>('parentAnswer').value = '';
  $('parentError').textContent = '';
});
$('paywallClose').addEventListener('click', () => paywall.close());
paywall.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
paywall.addEventListener('close', () => { session++; });
async function transact(kind: 'purchase' | 'restore') {
  if (busy || access.full) return;
  paywall.dataset.state = 'waiting';
  setBusy(true, kind === 'purchase' ? 'Otwieramy płatność. Prosimy czekać…' : 'Sprawdzamy Twój zakup…');
  status.textContent = '';
  try {
    const unlocked = await (kind === 'purchase' ? purchase() : restore());
    if (unlocked || access.full) success();
    else {
      paywall.dataset.state = 'pending';
      $('paywallTitle').textContent = kind === 'purchase' ? 'Czekamy na potwierdzenie zakupu' : 'Nie znaleźliśmy zakupu';
      status.textContent = kind === 'purchase'
        ? 'Jeśli płatność się zakończyła, nie kupuj ponownie. Wybierz „Sprawdź zakup”. Literki odblokują się po potwierdzeniu ze sklepu.'
        : 'Użyj tego samego konta Apple lub Google, na którym kupiono pełną wersję, i spróbuj ponownie.';
      buy.hidden = true;
      restoreBtn.textContent = 'Sprawdź zakup';
    }
  } catch (e) {
    if (access.full) success();
    else {
      const pending = String((e as { code?: unknown })?.code) === '20';
      paywall.dataset.state = pending ? 'pending' : 'offer';
      $('paywallTitle').textContent = pending ? 'Zakup czeka na zatwierdzenie' : 'Wszystkie literki i cyferki';
      $('purchaseOffer').hidden = pending;
      buy.hidden = pending;
      restoreBtn.textContent = pending ? 'Sprawdź zakup' : 'Przywróć zakup';
      status.textContent = purchaseError(e);
    }
  } finally { setBusy(false); }
}
buy.addEventListener('click', () => askParent(() => transact('purchase'), 'Przed zakupem chcemy upewnić się, że telefon trzyma rodzic lub opiekun. Wpisz swój rok urodzenia, aby przejść do płatności.'));
restoreBtn.addEventListener('click', () => askParent(() => transact('restore'), 'Przed sprawdzeniem wcześniejszego zakupu prosimy o potwierdzenie, że telefon trzyma rodzic lub opiekun.'));
$('purchaseRetry').addEventListener('click', () => void openPaywall());
$('purchaseContinue').addEventListener('click', () => {
  paywall.close();
  $<HTMLDialogElement>('settingsDialog').close();
  $('settingsBtn').focus({ preventScroll: true });
});
$('fullVersionBtn').addEventListener('click', requestPaywall);
$('privacyBtn').addEventListener('click', () => $<HTMLDialogElement>('privacyDialog').showModal());
$('privacyClose').addEventListener('click', () => $<HTMLDialogElement>('privacyDialog').close());
const ratingDialog = $<HTMLDialogElement>('ratingDialog');
const rateAppBtn = $<HTMLButtonElement>('rateAppBtn');
const ratingRetry = $<HTMLButtonElement>('ratingRetry');
let ratingBusy = false;
rateAppBtn.hidden = !native;
async function rateApp() {
  if (!native || ratingBusy) return;
  ratingBusy = true;
  rateAppBtn.disabled = true;
  ratingRetry.hidden = true;
  $('ratingTitle').textContent = 'Oceń aplikację';
  $('ratingStatus').textContent = `Otwieramy ${storeName}…`;
  $('ratingSpinner').hidden = false;
  if (!ratingDialog.open) ratingDialog.showModal();
  try {
    const result = await openStoreRating({ platform: Capacitor.getPlatform(), channel: __RELEASE_CHANNEL__, launcher: AppLauncher });
    if (!ratingDialog.open) return;
    if (result === 'beta') {
      $('ratingTitle').textContent = 'Dziękujemy za testowanie!';
      $('ratingStatus').textContent = 'To wersja testowa. Publiczną ocenę w sklepie będzie można dodać po premierze Pajączka.';
    } else ratingDialog.close();
  } catch {
    if (ratingDialog.open) {
      $('ratingStatus').textContent = `Nie udało się otworzyć ${storeName}. Sprawdź połączenie z internetem i spróbuj ponownie.`;
      ratingRetry.hidden = false;
    }
  } finally {
    ratingBusy = false;
    rateAppBtn.disabled = false;
    $('ratingSpinner').hidden = true;
  }
}
rateAppBtn.addEventListener('click', () => askParent(rateApp, 'Dodanie oceny w sklepie jest dla rodzica lub opiekuna. Wpisz swój rok urodzenia, aby przejść dalej.'));
ratingRetry.addEventListener('click', () => void rateApp());
$('ratingDone').addEventListener('click', () => ratingDialog.close());
ratingDialog.addEventListener('close', () => rateAppBtn.focus({ preventScroll: true }));
access.addEventListener('change', () => {
  renderFullVersionButton();
  if (access.full && paywall.open) success();
  else if (!access.full && paywall.open && paywall.dataset.state === 'success') paywall.close();
});
const reviewDialog = $<HTMLDialogElement>('reviewAccessDialog');
const reviewStatus = $('reviewAccessStatus');
const reviewForm = $<HTMLFormElement>('reviewAccessForm');
const reviewCode = $<HTMLInputElement>('reviewAccessCode');
const reviewDisable = $<HTMLButtonElement>('reviewAccessDisable');
function renderReviewAccess() {
  reviewForm.hidden = reviewAccess.active;
  reviewDisable.hidden = !reviewAccess.active;
  reviewStatus.textContent = reviewAccess.active ? 'Dostęp kodem aktywny. Wszystkie literki i cyferki są odblokowane.' : '';
}
$('reviewAccessBtn').hidden = !reviewAccess.enabled;
$('reviewAccessBtn').addEventListener('click', () => {
  if (!reviewAccess.enabled) return;
  askParent(async () => {
    renderReviewAccess();
    reviewDialog.showModal();
    if (!reviewAccess.active) reviewCode.focus();
  });
});
reviewForm.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = reviewForm.querySelector<HTMLButtonElement>('button')!;
  submit.disabled = true;
  try {
    if (await reviewAccess.activate(reviewCode.value)) { reviewCode.value = ''; renderReviewAccess(); }
    else reviewStatus.textContent = 'Ten kod nie pasuje. Sprawdź go i spróbuj ponownie.';
  } catch { reviewStatus.textContent = 'Nie udało się zapisać dostępu. Spróbuj ponownie.'; }
  finally { submit.disabled = false; }
});
reviewDisable.addEventListener('click', async () => {
  reviewDisable.disabled = true;
  try { await reviewAccess.deactivate(); renderReviewAccess(); reviewCode.focus(); }
  catch { reviewStatus.textContent = 'Nie udało się wyłączyć dostępu. Spróbuj ponownie.'; }
  finally { reviewDisable.disabled = false; }
});
$('reviewAccessClose').addEventListener('click', () => reviewDialog.close());
reviewDialog.addEventListener('close', () => { reviewCode.value = ''; });

const codeDialog = $<HTMLDialogElement>('storeCodeDialog');
const codeInput = $<HTMLInputElement>('storeCodeInput');
const codeSubmit = $<HTMLButtonElement>('storeCodeSubmit');
const codeCheck = $<HTMLButtonElement>('storeCodeCheck');
const codeStatus = $('storeCodeStatus');
const codeStore = Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play';
$('storeCodeCopy').textContent = `Masz kod od autora aplikacji, Macieja? Wpisz kod przeznaczony dla ${codeStore}. Otworzymy sklep, gdzie potwierdzisz bezpłatne odblokowanie wszystkich literek. Użyj konta sklepu zalogowanego na tym urządzeniu.`;
codeSubmit.textContent = `Aktywuj w ${codeStore}`;
function renderStoreCodes() {
  $('redeemCodeBtn').hidden = !native || access.full;
  $('storeCodeForm').hidden = access.paid;
  codeCheck.hidden = access.paid;
  if (access.paid) codeStatus.textContent = 'Gotowe! Wszystkie literki i cyferki są odblokowane. Miłego pisania!';
}
renderStoreCodes();
access.addEventListener('change', renderStoreCodes);
$('redeemCodeBtn').addEventListener('click', () => askParent(async () => {
  codeStatus.textContent = '';
  renderStoreCodes();
  codeDialog.showModal();
  codeInput.focus();
}));
async function checkStoreCode() {
  if (storeCodes.busy) return;
  codeCheck.disabled = true;
  codeSubmit.disabled = true;
  codeStatus.textContent = 'Sprawdzamy potwierdzenie ze sklepu…';
  try {
    await purchaseReady;
    if (await storeCodes.check()) renderStoreCodes();
    else codeStatus.textContent = 'Sklep nie potwierdził jeszcze odblokowania. Dokończ aktywację kodu i wróć tutaj. Jeśli kod był już użyty, wybierz „Sprawdź odblokowanie” lub „Przywróć zakup” w ustawieniach.';
  } catch {
    codeStatus.textContent = 'Nie udało się sprawdzić kodu w sklepie. Sprawdź internet i wybierz „Sprawdź odblokowanie”.';
  } finally { codeCheck.disabled = false; codeSubmit.disabled = false; }
}
$('storeCodeForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (storeCodes.busy) return;
  codeSubmit.disabled = true;
  codeStatus.textContent = `Otwieramy ${codeStore}…`;
  try {
    await purchaseReady;
    await storeCodes.open(codeInput.value);
    codeInput.value = '';
    codeStatus.textContent = 'Potwierdź kod w sklepie i wróć do Pajączka. Sprawdzimy odblokowanie po powrocie.';
  } catch (error) {
    codeStatus.textContent = error instanceof Error && error.message === 'invalid-code'
      ? 'Sprawdź kod — powinien zawierać litery i cyfry.'
      : `Nie udało się otworzyć ${codeStore}. Spróbuj ponownie lub użyj kodu bezpośrednio w sklepie, a potem wybierz „Przywróć zakup”.`;
  } finally { codeSubmit.disabled = false; }
});
codeCheck.addEventListener('click', () => void checkStoreCode());
$('storeCodeClose').addEventListener('click', () => codeDialog.close());
codeDialog.addEventListener('close', () => { codeInput.value = ''; });
if (native) void App.addListener('appStateChange', ({ isActive }) => {
  if (isActive && busy) $('purchaseProgressText').textContent = 'Czekamy na potwierdzenie sklepu…';
  if (isActive && storeCodes.pending) void checkStoreCode();
});
const purchaseReady = initPurchases().catch(() => { /* Free letters always remain usable. */ });
await reviewAccess.initialize();
await initStorage();
initGame(access, requestPaywall);
renderFullVersionButton();

if (Capacitor.getPlatform() === 'android') {
  void App.addListener('backButton', () => {
    if (busy) return;
    const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')];
    if (dialogs.length) { dialogs.at(-1)?.close(); return; }
    if (!$('game').hidden) { $('backBtn').click(); return; }
    void App.exitApp();
  });
}
