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
import './styles.css';
import './paywall.css';
import { initStorage } from './storage.js';
import { initGame } from './game.js';
import { access, reviewAccess, initPurchases, native, isConfigured, loadProduct, purchase, restore, purchaseError } from './purchases';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const paywall = $<HTMLDialogElement>('paywallDialog');
const parentGate = $<HTMLDialogElement>('parentGateDialog');
const buy = $<HTMLButtonElement>('buyBtn');
const restoreBtn = $<HTMLButtonElement>('restoreBtn');
const status = $('purchaseStatus');
let parentAction: (() => Promise<void>) | undefined;
let answer = '';
let session = 0;
let busy = false;
function setBusy(value: boolean) {
  busy = value;
  buy.disabled = value || !buy.dataset.ready;
  restoreBtn.disabled = value || !isConfigured();
  $('paywallClose').toggleAttribute('disabled', value);
  paywall.setAttribute('aria-busy', String(value));
}
function success() {
  $('paywallTitle').textContent = access.paid ? 'Dziękujemy za wsparcie!' : 'Dostęp kodem jest aktywny';
  $('paywallCopy').textContent = access.paid ? 'Wszystkie literki i cyferki są już dostępne. Autor i Leon dziękują — miłego pisania z Pajączkiem!' : 'Wszystkie ćwiczenia są dostępne bez płatności. Dostęp kodem możesz wyłączyć w ustawieniach, aby wrócić do pięciu darmowych par.';
  $('purchasePrice').textContent = 'Pełna wersja odblokowana';
  buy.hidden = true; restoreBtn.hidden = true;
  status.textContent = '';
}
async function openPaywall(ch?: string) {
  const current = ++session;
  $('paywallTitle').textContent = ch ? `Jeszcze więcej literek z Pajączkiem` : 'Pełna wersja z Pajączkiem';
  $('paywallCopy').textContent = 'Ta aplikacja powstała z myślą o moim synku Leonie. Dopracowywaliśmy ją wspólnie podczas wielu prób i ćwiczeń. Za niewielką, jednorazową kwotę odblokujesz wszystkie literki i cyferki, a przy okazji wesprzesz autora i Leona. Dziękujemy!';
  $('purchasePrice').textContent = native ? 'Pobieramy cenę ze sklepu…' : 'Planowana cena pełnej aplikacji: 5 zł';
  $('purchaseTerms').textContent = 'Pierwsze 5 par jest bezpłatne. Pełna wersja to jeden zakup — bez abonamentu i reklam.';
  buy.textContent = 'Odblokuj pełną wersję';
  buy.hidden = false; restoreBtn.hidden = !native;
  delete buy.dataset.ready;
  setBusy(false);
  status.textContent = '';
  if (!paywall.open) paywall.showModal();
  if (access.full) { success(); return; }
  if (!native) {
    status.textContent = 'To wersja demonstracyjna w przeglądarce. Zakup będzie dostępny w aplikacji na Androida i iOS po jej premierze w sklepach.';
    buy.hidden = true;
    return;
  }
  try {
    // Wait for SDK initialization, even if the user opens a locked tile immediately at launch.
    await purchaseReady;
    const product = await loadProduct();
    if (current !== session || !paywall.open) return;
    if (access.full) { success(); return; }
    if (!product) throw new Error('unavailable');
    $('purchasePrice').textContent = `Tylko ${product.priceString} — jednorazowo`;
    buy.textContent = `Kup pełną wersję za ${product.priceString}`;
    buy.dataset.ready = 'true'; setBusy(false);
  } catch {
    if (current !== session) return;
    $('purchasePrice').textContent = 'Cena jest chwilowo niedostępna';
    status.textContent = 'Nie można teraz pobrać oferty ze sklepu. Sprawdź połączenie i otwórz to okno ponownie. Darmowe literki nadal działają.';
    setBusy(false);
  }
}
function askParent(action: () => Promise<void>) {
  parentAction = action;
  const a = 12 + Math.floor(Math.random() * 8), b = 6 + Math.floor(Math.random() * 6);
  answer = String(a * b);
  $('parentQuestion').textContent = `Ile to ${a} × ${b}?`;
  $<HTMLInputElement>('parentAnswer').value = '';
  $('parentError').textContent = '';
  parentGate.showModal();
}
$('parentForm').addEventListener('submit', async event => {
  event.preventDefault();
  if ($<HTMLInputElement>('parentAnswer').value.trim() !== answer) {
    $('parentError').textContent = 'Spróbuj ponownie lub poproś dorosłego o pomoc.'; return;
  }
  const action = parentAction; parentAction = undefined; answer = '';
  parentGate.close();
  await action?.();
});
$('parentCancel').addEventListener('click', () => parentGate.close());
parentGate.addEventListener('close', () => { parentAction = undefined; answer = ''; });
$('paywallClose').addEventListener('click', () => paywall.close());
paywall.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
paywall.addEventListener('close', () => { session++; });
buy.addEventListener('click', () => askParent(async () => {
  setBusy(true); status.textContent = 'Otwieramy bezpieczną płatność w sklepie…';
  try {
    if (await purchase()) success();
    else status.textContent = 'Czekamy na potwierdzenie zakupu. Jeśli płatność się zakończyła, wybierz „Przywróć zakup”.';
  } catch (e) { status.textContent = purchaseError(e); }
  finally { setBusy(false); }
}));
restoreBtn.addEventListener('click', () => askParent(async () => {
  setBusy(true); status.textContent = 'Sprawdzamy wcześniejszy zakup…';
  try {
    if (await restore()) success();
    else status.textContent = 'Nie znaleźliśmy zakupu na tym koncie sklepu. Sprawdź, czy używasz konta Apple lub Google, na którym kupiono pełną wersję.';
  } catch (e) { status.textContent = purchaseError(e); }
  finally { setBusy(false); }
}));
$('fullVersionBtn').addEventListener('click', () => void openPaywall());
$('privacyBtn').addEventListener('click', () => $<HTMLDialogElement>('privacyDialog').showModal());
$('privacyClose').addEventListener('click', () => $<HTMLDialogElement>('privacyDialog').close());
access.addEventListener('change', () => { if (access.full && paywall.open) success(); });
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
const purchaseReady = initPurchases().catch(() => { /* Free letters always remain usable. */ });
await reviewAccess.initialize();
await initStorage();
initGame(access, (ch: string) => void openPaywall(ch));

if (Capacitor.getPlatform() === 'android') {
  void App.addListener('backButton', () => {
    if (busy) return;
    const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')];
    if (dialogs.length) { dialogs.at(-1)?.close(); return; }
    if (!$('game').hidden) { $('backBtn').click(); return; }
    void App.exitApp();
  });
}
