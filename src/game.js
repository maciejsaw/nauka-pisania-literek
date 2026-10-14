import { buildLetter, resample } from './geometry.js';
import { LETTERS } from './letters.js';
import { saveProgress, loadProgress } from './storage.js';

export function initGame(access, openPaywall) {
const LOWER = ['a','ą','b','c','ć','d','e','ę','f','g','h','i','j','k','l','ł','m','n','ń','o','ó','p','r','s','ś','t','u','w','y','z','ź','ż'];
const UPPER = LOWER.map((c) => c.toUpperCase());
const DIGITS = ['0','1','2','3','4','5','6','7','8','9'];
const ORDER = LOWER.concat(UPPER, DIGITS);
const isDigit = (c) => c >= '0' && c <= '9';
const thing = (c) => (isDigit(c) ? 'cyferkę' : 'literkę'); // biernik do komunikatów
const lab = (lv) => (G && isDigit(G.ch) ? lv.label.replace('literka', 'cyferka') : lv.label);
const BUILT = {};
ORDER.forEach((ch) => { BUILT[ch] = buildLetter(LETTERS[ch]); });
const SPIDER_COLORS = ['#3d2b56', '#1d6c78', '#a8432c'];
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const C = {};
['--ink','--wzor-cmp','--line-top','--line-mid','--line-base','--wzor','--silk','--hole','--paper-2','--good','--warn','--bad','--gold','--gold-dark','--cup-empty','--muted','--paper'].forEach((k) => { C[k.slice(2)] = css(k); });

/* ---------- ścieżka ćwiczeń jednej literki ---------- */
const LEVELS = [
  { mode: 'spider', demo: 'normal', scale: 1, icon: 'spider', label: 'Z pająkiem' },
  { mode: 'free', demo: 'normal', scale: 1, icon: 'pencil', label: 'Bez pająka' },
  { mode: 'free', demo: 'fast', scale: 1, icon: 'fast', label: 'Szybszy pokaz' },
  { mode: 'free', demo: 'flash', scale: 1, icon: 'flash', label: 'Tylko mignięcie wzoru' },
  { mode: 'free', demo: 'none', scale: 1, icon: 'eyeclosed', label: 'Bez wzoru' },
  { mode: 'free', demo: 'none', scale: 0.48, icon: 'small1', label: 'Mniejsza literka' },
  { mode: 'free', demo: 'none', scale: 0.35, icon: 'small2', label: 'Jeszcze mniejsza' },
  { mode: 'free', demo: 'none', scale: 0.25, icon: 'small3', label: 'Malutka literka' },
  { mode: 'race', demo: 'none', scale: 0.48, icon: 'race1', label: 'Wyścig z pająkiem', speed: 0.34 },
  { mode: 'race', demo: 'none', scale: 0.48, icon: 'race2', label: 'Szybszy wyścig', speed: 0.26 },
  { mode: 'race', demo: 'none', scale: 0.25, icon: 'race3', label: 'Najszybszy wyścig', speed: 0.2 },
];

/* ---------- zapis postępów ---------- */
const KEY = 'pajak-dwulinia-v3';
let store = { prog: {}, badges: {}, best: {}, muted: false, penOnly: false, penSeen: false };
store = Object.assign(store, loadProgress());
const save = () => saveProgress(store);
const resumeLevel = (ch) => { const p = store.prog[ch] || 0; return p >= LEVELS.length ? 0 : p; };

/* ---------- dźwięk ---------- */
let AC = null;
function audio() {
  if (store.muted) return null;
  try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; }
  return AC;
}
function tone(f, at, dur, type = 'triangle', vol = 0.12) {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol) {
  const a = audio(); if (!a) return;
  const b = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const s = a.createBufferSource(), g = a.createGain(); g.gain.value = vol; s.buffer = b; s.connect(g).connect(a.destination); s.start();
}
const sfx = {
  tick: () => tone(880, 0, 0.12, 'sine', 0.05),
  pop: () => { tone(330, 0, 0.08, 'sine', 0.1); tone(660, 0.05, 0.12); },
  catch: () => { tone(660, 0, 0.12); tone(880, 0.08, 0.14); tone(1320, 0.16, 0.2, 'sine', 0.08); },
  lift: () => tone(240, 0, 0.18, 'sine', 0.08),
  hole: () => tone(400, 0, 0.2, 'sine', 0.04),
  beep: () => tone(660, 0, 0.18, 'square', 0.06),
  go: () => tone(1046, 0, 0.35, 'square', 0.07),
  lose: () => [523, 440, 349].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.1)),
  clap: () => { noise(0.18, 0.35); tone(1200, 0.02, 0.15, 'sine', 0.06); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.12)),
};

/* ---------- ikony ---------- */
const SP_BODY = '<circle cx="16" cy="17" r="6.5" fill="currentColor" stroke="none"/><path d="M10.5 14 5 9M10 17.5H3.5M10.5 21l-5 5M21.5 14 27 9M22 17.5h6.5M21.5 21l5 5"/><circle cx="14" cy="16" r="1.6" fill="var(--eye,#fff)" stroke="none"/><circle cx="18" cy="16" r="1.6" fill="var(--eye,#fff)" stroke="none"/>';
const smallA = (k) => `<rect x="3" y="3" width="26" height="26" rx="6" stroke-dasharray="3 3.5" stroke-width="2"/><g transform="translate(16 16.5) scale(${k})"><circle cx="-2.5" cy="1" r="6.5" vector-effect="non-scaling-stroke"/><path d="M4 -5.5V7.5" vector-effect="non-scaling-stroke"/></g>`;
const flag = (n) => '<path d="M10 29V3.5"/><path d="M10 5h16l-3.5 6 3.5 6H10"/><path d="M10 5h5v6h-5zM20 5h5.2l-2.7 6H20zM15 11h5v6h-5z" fill="currentColor" stroke="none"/>' + ['M2 9h5', 'M1 14h6', 'M2 19h5'].slice(0, n).map((d) => `<path d="${d}"/>`).join('');
const ICONS = {
  unlock: '<rect x="7" y="14" width="18" height="14" rx="3"/><path d="M11 14V9a5 5 0 0 1 9.7-1.7"/><circle cx="16" cy="21" r="1"/>',
  privacy: '<path d="M16 3 27 7v8c0 7-5 11-11 14C10 26 5 22 5 15V7z"/><path d="m11 16 3.5 3.5L21 13"/>',
  info: '<circle cx="16" cy="16" r="12"/><path d="M16 14v9"/><circle cx="16" cy="9" r="1" fill="currentColor" stroke="none"/>',
  close: '<path d="m9 9 14 14M23 9 9 23"/>',
  lock: '<rect x="7" y="14" width="18" height="14" rx="3"/><path d="M11 14V9a5 5 0 0 1 10 0v5"/><circle cx="16" cy="21" r="1"/>',
  settings: '<path d="m13 3-1 4-3 2-4-1-2 5 3 3v3l-3 3 3 5 4-1 3 2 1 3h5l1-4 3-2 4 1 2-5-3-3v-3l3-3-3-5-4 1-3-2-1-3z"/><circle cx="16" cy="17" r="4"/>',
  home: '<path d="M4 16 16 5l12 11"/><path d="M8 13.5V27h6v-7h4v7h6V13.5"/>',
  back: '<path d="M20 6 10 16l10 10"/>',
  eye: '<path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z"/><circle cx="16" cy="16" r="4"/>',
  soundOn: '<path d="M5 12h5l7-5v18l-7-5H5z"/><path d="M21.5 11.5a6.5 6.5 0 0 1 0 9M25 8a11.5 11.5 0 0 1 0 16"/>',
  soundOff: '<path d="M5 12h5l7-5v18l-7-5H5z"/><path d="M22 12l7 8M29 12l-7 8"/>',
  dice: '<rect x="4" y="4" width="24" height="24" rx="6"/><circle cx="11" cy="11" r="1.8" fill="currentColor" stroke="none"/><circle cx="21" cy="21" r="1.8" fill="currentColor" stroke="none"/><circle cx="21" cy="11" r="1.8" fill="currentColor" stroke="none"/><circle cx="11" cy="21" r="1.8" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.8" fill="currentColor" stroke="none"/>',
  spider: SP_BODY,
  nospider: SP_BODY + '<circle cx="16" cy="16" r="13.5" stroke="#d6453a"/><path d="M6.5 6.5l19 19" stroke="#d6453a"/>',
  fast: '<path d="M5 8l9 8-9 8M16 8l9 8-9 8"/>',
  flash: '<circle cx="16" cy="16" r="4.5"/><path d="M16 3v5M16 24v5M3 16h5M24 16h5M6.8 6.8l3.5 3.5M21.7 21.7l3.5 3.5M25.2 6.8l-3.5 3.5M10.3 21.7l-3.5 3.5"/>',
  noeye: '<path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z"/><circle cx="16" cy="16" r="3.5"/><path d="M5 27 27 5" stroke="#d6453a"/>',
  small1: smallA(1), small2: smallA(0.72), small3: smallA(0.46),
  race1: flag(1), race2: flag(2), race3: flag(3),
  badge: '<path d="M11 3l-3.5 9M21 3l3.5 9"/><circle cx="16" cy="19.5" r="9"/><path d="M16 14.5l1.6 3.2 3.5.5-2.5 2.5.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.5-2.5 3.5-.5z" fill="currentColor" stroke="none"/>',
  replay: '<path d="M26 16a10 10 0 1 1-3.2-7.4"/><path d="M24 3.5v6h-6"/>',
  eraser: '<path d="M18.5 4.5 27.5 13.5 15 26H9l-5-5z"/><path d="M12 11l9.5 9.5"/><path d="M17 27.5h10"/>',
  check: '<path d="M6 17l7 7L26 9"/>',
  next: '<path d="M5 16h20"/><path d="M17 7l9 9-9 9"/>',
  pencil: '<path d="M21.5 4.5l6 6L11 27H5v-6z"/><path d="M18 8l6 6"/><path d="M5 27l4.5-1.2L6.2 22.5z" fill="currentColor" stroke="none"/>',
  eyeclosed: '<path d="M3 13c3 5 8 7.5 13 7.5S26 18 29 13"/><path d="M8 18.5 5.5 23M16 20.5V26M24 18.5l2.5 4.5"/>',
  hand: '<path d="M11 18V9a2.2 2.2 0 0 1 4.4 0v7M15.4 15V6a2.2 2.2 0 0 1 4.4 0v9M19.8 15.5V8.5a2.2 2.2 0 0 1 4.4 0V19c0 6-4 10-9.5 10-4 0-6.3-2.2-8-5l-3.1-5.2a2.1 2.1 0 0 1 3.4-2.4L11 19"/>',
};
const icon = (name, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
function cupSVG(on, size) {
  const f = on ? C.gold : C['cup-empty'], s = on ? C['gold-dark'] : '#c3ccd8';
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" class="${on ? 'on' : ''}" aria-hidden="true">
    <path d="M14 9H8c0 6.5 3 10 7.5 10M34 9h6c0 6.5-3 10-7.5 10" fill="none" stroke="${s}" stroke-width="3" stroke-linecap="round"/>
    <path d="M13 5h22v10c0 8-5 13-11 13S13 23 13 15z" fill="${f}" stroke="${s}" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="21" y="27" width="6" height="7" fill="${f}" stroke="${s}" stroke-width="2.5"/>
    <path d="M14 42c0-4.5 4.5-8 10-8s10 3.5 10 8z" fill="${f}" stroke="${s}" stroke-width="2.5" stroke-linejoin="round"/>
    ${on ? '<path d="M24 9.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff6d6"/>' : ''}
  </svg>`;
}
function spiderIcon(color, got) {
  const c = got ? color : '#c3ccd8';
  const legs = [-1, 1].map((sd) => [0, 1, 2, 3].map((i) => {
    const y = 13 + (i - 1.5) * 3.2;
    return `<path d="M${15 + sd * 5} ${y} L${15 + sd * 10} ${y - 4 + i} L${15 + sd * 13} ${y + 3 + i * 0.6}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('')).join('');
  return `<svg viewBox="0 0 30 30" class="${got ? 'got' : ''}" aria-hidden="true">${legs}<circle cx="15" cy="15" r="7.5" fill="${c}"/>
    <circle cx="12.4" cy="14" r="2.3" fill="#fff"/><circle cx="17.6" cy="14" r="2.3" fill="#fff"/>
    <circle cx="12.6" cy="14.4" r="1.1" fill="#1b1530"/><circle cx="17.8" cy="14.4" r="1.1" fill="#1b1530"/></svg>`;
}
function letterPaths(ch, scale, dx, dy, color, w) {
  const L = BUILT[ch];
  return L.strokes.map((s) => s.dot
    ? `<circle cx="${(s.pts[0][0] * scale + dx).toFixed(1)}" cy="${(s.pts[0][1] * scale + dy).toFixed(1)}" r="${(w * 0.8).toFixed(1)}" fill="${color}"/>`
    : `<path d="${polyD(s.pts.map((p) => [p[0] * scale + dx, p[1] * scale + dy]))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
}
function badgeSVG(ch) {
  const L = BUILT[ch], h = L.maxY - L.minY, k = Math.min(78 / h, 84 / L.width);
  const dx = 100 - L.width * k / 2, dy = 128 - (L.minY + h / 2) * k;
  return `<svg viewBox="0 0 200 230" aria-hidden="true">
    <path d="M62 8 44 92l30-12 18 22 12-92z" fill="#d6453a"/><path d="M138 8l18 84-30-12-18 22-12-92z" fill="#1d6c78"/>
    <circle cx="100" cy="128" r="84" fill="${C['gold-dark']}"/><circle cx="100" cy="128" r="76" fill="${C.gold}"/>
    <circle cx="100" cy="128" r="62" fill="#fff6d6" stroke="${C['gold-dark']}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
    ${letterPaths(ch, k, dx, dy, C.ink, 9)}
  </svg>`;
}
function bigSpiderSVG() {
  const col = SPIDER_COLORS[0];
  let legs = '';
  [[-1, -1.2], [-1, -0.4], [-1, 0.4], [-1, 1.2], [1, -0.4], [1, 0.4], [1, 1.2]].forEach(([sd, k]) => {
    const y = 128 + k * 20;
    legs += `<path d="M${120 + sd * 30} ${y} L${120 + sd * 72} ${y - 34 + Math.abs(k) * 6} L${120 + sd * 96} ${y + 24 + k * 18}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  return `<svg class="big" viewBox="0 0 240 240" aria-hidden="true">
    <line x1="120" y1="0" x2="120" y2="78" stroke="${C.silk}" stroke-width="3"/>
    ${legs}
    <g class="paw"><path d="M146 108 L172 66 L178 42" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="180" cy="36" r="17" fill="${col}"/>
      <circle cx="180" cy="36" r="9" fill="#ffd0dc"/></g>
    <circle cx="120" cy="132" r="46" fill="${col}"/>
    <ellipse cx="102" cy="112" rx="13" ry="7" fill="rgba(255,255,255,.2)" transform="rotate(-35 102 112)"/>
    <circle cx="96" cy="146" r="7" fill="rgba(255,140,170,.6)"/><circle cx="144" cy="146" r="7" fill="rgba(255,140,170,.6)"/>
    <g class="calm"><ellipse cx="104" cy="126" rx="12" ry="14" fill="#fff"/><ellipse cx="136" cy="126" rx="12" ry="14" fill="#fff"/>
      <circle cx="106" cy="130" r="6" fill="#1b1530"/><circle cx="138" cy="130" r="6" fill="#1b1530"/>
      <path d="M110 150 Q120 158 130 150" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
    <g class="happy"><path d="M93 128 Q104 114 115 128M125 128 Q136 114 147 128" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <path d="M104 146 Q120 166 136 146" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></g>
  </svg><span class="hand">${icon('hand')}</span>`;
}

/* ---------- menu: pary liter (wielka + mała) ---------- */
function polyD(pts) { return 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'); }
function letterSheetSVG(ch) {
  const vbW = 240, top = 50, H = 370, L = BUILT[ch], dx = (vbW - L.width) / 2;
  let lines = '';
  [[0, C['line-top'], 1.5], [100, C['line-mid'], 2.5], [200, C['line-base'], 2.5], [300, C['line-top'], 1.5]].forEach(([y, c, w]) => {
    lines += `<line x1="-10" x2="${vbW + 10}" y1="${y + top}" y2="${y + top}" stroke="${c}" stroke-width="${w}"/>`;
  });
  return `<svg class="sheet" viewBox="0 0 ${vbW} ${H}" style="aspect-ratio:${vbW}/${H}" preserveAspectRatio="none" aria-hidden="true">${lines}${letterPaths(ch, 1, dx, top, C.ink, 11)}</svg>`;
}
function tileHTML(ch) {
  const locked = !access.canPlay(ch);
  const p = store.badges[ch] ? 1 : Math.min(1, (store.prog[ch] || 0) / LEVELS.length);
  const what = isDigit(ch) ? 'cyferka' : (ch === ch.toLowerCase() ? 'mała literka' : 'wielka literka');
  return `<button type="button" class="tile${locked ? ' locked' : ''}" id="tile-${ORDER.indexOf(ch)}" data-ch="${ch}" aria-label="${what} ${ch}${locked ? ', pełna wersja' : ''}${store.badges[ch] ? ', zdobyta odznaka' : ''}">
    <span class="lbl" aria-hidden="true">${ch}</span>${store.badges[ch] ? `<span class="med">${icon('badge')}</span>` : ''}
    ${locked ? '<span class="tile-lock" aria-hidden="true">' + icon('lock') + '</span>' : ''}${letterSheetSVG(ch)}<span class="prog"><i style="width:${Math.round(p * 100)}%"></i></span></button>`;
}
function renderMenu() {
  const page = document.getElementById('page');
  page.innerHTML = '<h2 class="sect" id="secLetters">Literki</h2>'
    + UPPER.map((U, i) => `<div class="pair">${tileHTML(U)}${tileHTML(LOWER[i])}</div>`).join('')
    + '<h2 class="sect" id="secDigits">Cyferki</h2>'
    + [0, 1, 2, 3, 4].map((i) => `<div class="pair">${tileHTML(DIGITS[2 * i])}${tileHTML(DIGITS[2 * i + 1])}</div>`).join('');
  page.querySelectorAll('.tile').forEach((b) => b.addEventListener('click', () => { audio(); startLetter(b.dataset.ch, resumeLevel(b.dataset.ch)); }));
}

/* ---------- elementy gry ---------- */
const $ = (id) => document.getElementById(id);
const menuEl = $('menu'), gameEl = $('game'), stage = $('stage'), cv = $('cv'), ctx = cv.getContext('2d');
const msgEl = $('msg'), timerEl = $('timer'), slotsEl = $('slots'), resultEl = $('result'), rewardEl = $('reward');
let W = 0, H = 0, DPR = 1, S = 1, OX = 0, OY = 0, RX = 0;
let G = null;            // stan bieżącego zadania
let raf = 0, lastT = 0;
const FLY_DUR = 0.65, EMERGE = 0.3;

function demoPlan(L, kind) {
  if (kind === 'none') return null;
  if (kind === 'flash') return { flash: true, end: 1.7, total: 2.15 };
  const fast = kind === 'fast';
  const speed = fast ? 560 : 240, gap = fast ? 0.2 : 0.45, hold = fast ? 0.35 : 0.7;
  let t = 0.3;
  const segs = L.strokes.map((st) => {
    const d = st.dot ? (fast ? 0.15 : 0.3) : Math.min(fast ? 1.4 : 3.2, Math.max(fast ? 0.25 : 0.5, st.len / speed));
    const sg = { t0: t, t1: t + d }; t += d + gap; return sg;
  });
  const end = t - gap + hold;
  return { segs, end, total: end + 0.4 };
}

function setMsg(t) { if (msgEl.textContent !== t) msgEl.textContent = t; }
function fmtTime(sec) { return sec.toFixed(1).replace('.', ',') + ' s'; }
const U2S = (p) => [OX + p[0] * S, OY + p[1] * S];
const S2U = (x, y) => [(x - OX) / S, (y - OY) / S];
const R2S = (p) => [RX + p[0] * S, OY + p[1] * S];

// iPad: cały obszar między czterema liniami (od górnej do dolnej, 300 jednostek) nie większy niż 5 cm. CSS-owy px na iPadzie to 1/132 cala (mini 6: 1/163).
const IS_IPAD = /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const BIG_LINES = 0.8; // duże linijki (skala 1) są o 20% niższe niż wcześniej; małe ćwiczenia zachowują swój rozmiar
const MAX_BAND_CM = 5; // wysokość całego pola czterech linii
const S_CAP = IS_IPAD ? (MAX_BAND_CM / 2.54 * (Math.min(screen.width, screen.height) === 744 ? 163 : 132)) / 300 : 3.4;
function layout() {
  const r = stage.getBoundingClientRect();
  if (!r.width || !r.height) return;
  W = r.width; H = r.height; DPR = Math.min(window.devicePixelRatio || 1, 3);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  if (!G) return;
  const L = G.L, race = G.level.mode === 'race';
  const top = Math.min(0, L.minY - 16), bottom = Math.max(300, L.maxY + 12), band = bottom - top;
  const avH = H - 20, paneW = race ? W / 2 : W;
  S = Math.min(avH / band, (paneW - (race ? 22 : 40)) / (L.width + (race ? 26 : 60)), 3.4, S_CAP) * ((G.level.scale || 1) < 1 ? G.level.scale : BIG_LINES);
  OX = (paneW - L.width * S) / 2;
  RX = W / 2 + (paneW - L.width * S) / 2;
  OY = 10 + (avH - band * S) / 2 - top * S;
}
new ResizeObserver(() => layout()).observe(stage);

const STROKE_TXT = {
  kropka: 'Jeszcze kropka!', kreska: 'Teraz kreska z góry!', ogonek: 'Teraz ogonek!',
  poprzeczka: 'Teraz poprzeczka od lewej!', kreseczka: 'Teraz kreseczka w poprzek!',
  ramie: 'Teraz ukośna kreska od góry do laseczki i w dół!', brzuszek: 'Teraz brzuszek!', brzuszki: 'Teraz brzuszki!', laseczka: 'Teraz laseczka z góry!',
  brzuszekNoga: 'Teraz brzuszek i nóżka!', daszek: 'Teraz daszek!', poprzeczkaP: 'Teraz poprzeczka od prawej!',
  ramieNoga: 'Teraz ramię w górę, z powrotem i nóżka!',
};
function strokeHint(st) { return (STROKE_TXT[st.name] || 'Jeszcze jeden ruch!') + ' Dotknij dziurki.'; }

function renderLevels(el, li, doneUpTo) {
  // można skoczyć do każdego poziomu, który już odblokowałeś (ukończone + aktualny)
  el.innerHTML = LEVELS.map((lv, i) => `<button type="button" class="lv ${i < doneUpTo ? 'done' : ''} ${i === li ? 'cur' : ''}" data-i="${i}" title="${lab(lv)}" aria-label="Poziom ${i + 1}: ${lab(lv)}" ${i <= doneUpTo ? '' : 'disabled'}>${icon(lv.icon)}</button>`).join('')
    + `<span class="lv prize ${store.badges[G.ch] ? 'got' : ''}" title="Odznaka">${icon('badge')}</span>`;
  el.querySelectorAll('button.lv:not(:disabled)').forEach((b) => b.addEventListener('click', () => { audio(); startLetter(G.ch, +b.dataset.i); }));
}

function startLetter(ch, li = 0) {
  if (!access.canPlay(ch)) { openPaywall(ch); return; }
  const L = BUILT[ch], level = LEVELS[li];
  G = {
    ch, L, li, level, phase: 'intro', clock: 0, demoAt: 0, plan: demoPlan(L, level.demo), idx: 0,
    sp: null, spiders: [], fingerS: 0, started: false, down: false, pid: null, finger: null,
    ink: level.mode === 'spider' ? L.strokes.map(() => []) : [[]], dev: [], lifts: 0, tStart: null, tEnd: null,
    particles: [], doneAt: 0, totalLen: L.strokes.reduce((a, s) => a + s.len, 0),
    freeCount: 0, freeLast: 0, ev: null, pending: null, race: null, winner: null,
  };
  menuEl.hidden = true; gameEl.hidden = false; resultEl.hidden = true; rewardEl.hidden = true;
  $('curLetter').textContent = ch;
  $('hintBtn').setAttribute('aria-label', 'Pokaż jeszcze raz, jak się pisze ' + thing(ch));
  $('cmpB').parentNode.querySelector('figcaption').textContent = isDigit(ch) ? 'Twoja cyferka' : 'Twoja literka';
  slotsEl.classList.toggle('invis', level.mode !== 'spider');
  slotsEl.innerHTML = level.mode === 'spider' ? L.strokes.map((s, i) => spiderIcon(SPIDER_COLORS[i % 3], false)).join('') : '';
  $('hintBtn').classList.toggle('invis', !G.plan);
  showFreeButtons(false);
  renderLevels($('levels'), li, store.badges[ch] ? LEVELS.length : (store.prog[ch] || 0));
  timerEl.textContent = fmtTime(0);
  if (G.plan) setMsg(level.demo === 'flash' ? 'Patrz uważnie — wzór mignie tylko na chwilę!' : 'Patrz, jak się pisze ' + thing(ch) + ' „' + ch + '”…');
  layout();
  if (!G.plan || level.mode !== 'race') {
    beginTask(); // pokaz leci w tle, a dziecko może od razu pisać (poza wyścigiem)
    if (G.plan && level.mode === 'free') setMsg(level.demo === 'flash' ? 'Wzór zaraz mignie — możesz już pisać!' : 'Patrz na wzór — możesz od razu pisać!');
  }
  cancelAnimationFrame(raf); lastT = performance.now(); raf = requestAnimationFrame(loop);
}
function showFreeButtons(on) { $('clearBtn').classList.toggle('invis', !on); $('doneBtn').classList.toggle('invis', !on); }

function beginTask() {
  const m = G.level.mode;
  if (m === 'spider') {
    G.phase = 'play'; G.sp = newSpider(0); G.spiders = [G.sp]; sfx.hole();
    setMsg('Dotknij dziurki — wyjdzie z niej pająk. Prowadź palec za nim!');
  } else if (m === 'free') {
    G.phase = 'free'; showFreeButtons(true);
    setMsg(G.level.demo === 'none' ? (G.level.scale < 1 ? 'Napisz mniejszą ' + thing(G.ch) + ' „' + G.ch + '”!' : 'Napisz ' + thing(G.ch) + ' „' + G.ch + '” z pamięci!') : 'Teraz napisz ' + thing(G.ch) + ' sam, bez pająka!');
  } else {
    G.phase = 'countdown'; G.countAt = G.clock; G.countStep = -1; showFreeButtons(true);
    const n = G.L.strokes.length, ref = refTime();
    const T = ref * G.level.speed * 1.25, nd = G.L.strokes.filter((s) => s.dot).length; // pająk wolniejszy o 20%
    const hopT = Math.min(0.3, T * 0.08), dotT = Math.min(0.2, T * 0.05);
    G.race = { T, hopT, dotDur: dotT, v: G.totalLen / Math.max(0.4, T - hopT * (n - 1) - dotT * nd), i: 0, s: 0, hop: 0, dotT: 0, done: false, gait: 0, look: [-1, 0] };
    setMsg('Wyścig! Ty piszesz po lewej, pająk po prawej.');
  }
}
function falseStart() {
  G.phase = 'falsestart'; G.fsAt = G.clock; G.falseStarts = (G.falseStarts || 0) + 1;
  G.tStart = null; G.tEnd = null; timerEl.textContent = fmtTime(0);
  sfx.lose(); setMsg('Falstart! Poczekaj na znak START.');
}
function refTime() { return 0.9 + (G.totalLen / 100) / 1.1 + 1.2 * (G.L.strokes.length - 1); }

function newSpider(i) {
  const st = G.L.strokes[i];
  return { i, color: SPIDER_COLORS[i % 3], s: 0, pos: st.pts[0].slice(), state: 'hole', t: 0, emerge: -1, gait: 0, look: [0, -1], tilt: 0, shake: 0 };
}

function posAt(st, s) {
  if (st.dot || s <= 0) return st.pts[0].slice();
  if (s >= st.len) return st.pts[st.pts.length - 1].slice();
  let k = Math.min(st.pts.length - 2, Math.floor(s / 2));
  while (k > 0 && st.cum[k] > s) k--;
  while (k < st.pts.length - 2 && st.cum[k + 1] < s) k++;
  const a = st.pts[k], b = st.pts[k + 1], t = (s - st.cum[k]) / Math.max(1e-6, st.cum[k + 1] - st.cum[k]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function idxAt(st, s) { return Math.max(0, Math.min(st.pts.length - 1, Math.round(s / 2))); }
function nearest(st, p, i0 = 0, i1 = st.pts.length - 1) {
  let best = Infinity, bi = i0;
  for (let i = i0; i <= i1; i++) { const q = st.pts[i], d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2; if (d < best) { best = d; bi = i; } }
  return [Math.sqrt(best), bi];
}
function nearestAll(p) { let d = Infinity; for (const st of G.L.strokes) d = Math.min(d, nearest(st, p)[0]); return d; }
const tolU = () => Math.max(48, 36 / S);
const grabU = () => Math.max(55, 44 / S);

/* ---------- ocena pisania bez wzoru: dopasowanie położenia rysunku do wzoru ---------- */
function getField(L) {
  if (L.field) return L.field;
  const cell = 3, pad = 150;
  const x0 = -pad, y0 = Math.min(0, L.minY) - pad, x1 = L.width + pad, y1 = Math.max(300, L.maxY) + pad;
  const nx = Math.ceil((x1 - x0) / cell), ny = Math.ceil((y1 - y0) / cell);
  const tp = []; L.strokes.forEach((st) => st.pts.forEach((p, i) => { if (st.dot || i % 2 === 0) tp.push(p); }));
  const f = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const y = y0 + (j + 0.5) * cell;
    for (let i = 0; i < nx; i++) {
      const x = x0 + (i + 0.5) * cell; let m = 1e12;
      for (const p of tp) { const dx = p[0] - x, dy = p[1] - y, d = dx * dx + dy * dy; if (d < m) m = d; }
      f[j * nx + i] = Math.sqrt(m);
    }
  }
  L.field = { cell, x0, y0, nx, ny, f, tp: [].concat(...L.strokes.map((st) => st.pts)), tpS: [].concat(...L.strokes.map((st, si) => st.pts.map(() => si))) };
  return L.field;
}
function fieldAt(F, x, y) {
  const i = Math.floor((x - F.x0) / F.cell), j = Math.floor((y - F.y0) / F.cell);
  const ci = Math.max(0, Math.min(F.nx - 1, i)), cj = Math.max(0, Math.min(F.ny - 1, j));
  return F.f[cj * F.nx + ci] + Math.hypot(i - ci, j - cj) * F.cell;
}
function childPoints() { const out = []; G.ink.forEach((segs) => segs.forEach((seg) => seg.forEach((p) => out.push(p)))); return out; }
function evalFree() {
  const pts = childPoints();
  if (!pts.length) return { align: [0, 0], cov: 0, mean: 999, covS: G.L.strokes.map(() => 0), minS: 0 };
  const F = getField(G.L), r = Math.max(16, 13 / S), cell = F.cell, rc = Math.ceil(r / cell);
  let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
  pts.forEach((p) => { mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mny = Math.min(mny, p[1]); mxy = Math.max(mxy, p[1]); });
  const ox0 = mnx - r - cell, oy0 = mny - r - cell, onx = Math.ceil((mxx - mnx + 2 * r) / cell) + 3, ony = Math.ceil((mxy - mny + 2 * r) / cell) + 3;
  const occ = new Uint8Array(onx * ony);
  pts.forEach((p) => {
    const ci = Math.floor((p[0] - ox0) / cell), cj = Math.floor((p[1] - oy0) / cell);
    for (let dj = -rc; dj <= rc; dj++) for (let di = -rc; di <= rc; di++) {
      if (di * di + dj * dj > rc * rc) continue;
      const i = ci + di, j = cj + dj; if (i >= 0 && j >= 0 && i < onx && j < ony) occ[j * onx + i] = 1;
    }
  });
  const step = Math.max(1, Math.floor(pts.length / 220)), sub = pts.filter((_, i) => i % step === 0);
  const tp = F.tp;
  const cov = (dx, dy) => {
    let h = 0;
    for (const q of tp) { const i = Math.floor((q[0] - dx - ox0) / cell), j = Math.floor((q[1] - dy - oy0) / cell); if (i >= 0 && j >= 0 && i < onx && j < ony && occ[j * onx + i]) h++; }
    return h / tp.length;
  };
  const mean = (dx, dy) => { let s = 0; for (const p of sub) s += fieldAt(F, p[0] + dx, p[1] + dy); return s / sub.length; };
  const cost = (dx, dy) => { const c = cov(dx, dy), m = mean(dx, dy); return [m / 100 + 0.8 * (1 - c), c, m]; };
  const dx0 = G.L.width / 2 - (mnx + mxx) / 2;
  let best = [Infinity], bdx = 0, bdy = 0;
  for (let dx = dx0 - 60; dx <= dx0 + 60; dx += 6) for (let dy = -30; dy <= 30; dy += 6) { const c = cost(dx, dy); if (c[0] < best[0]) { best = c; bdx = dx; bdy = dy; } }
  const cx = bdx, cy = bdy;
  for (let dx = cx - 6; dx <= cx + 6; dx += 2) for (let dy = cy - 6; dy <= cy + 6; dy += 2) { const c = cost(dx, dy); if (c[0] < best[0]) { best = c; bdx = dx; bdy = dy; } }
  const per = G.L.strokes.map(() => [0, 0]);
  tp.forEach((q, k) => {
    const si = F.tpS[k], i = Math.floor((q[0] - bdx - ox0) / cell), j = Math.floor((q[1] - bdy - oy0) / cell);
    per[si][1]++; if (i >= 0 && j >= 0 && i < onx && j < ony && occ[j * onx + i]) per[si][0]++;
  });
  const covS = per.map(([h, t]) => (t ? h / t : 1));
  return { align: [bdx, bdy], cov: best[1], mean: best[2], covS, minS: Math.min(...covS) };
}

/* pokrycie wzoru rysunkiem dokładnie tam, gdzie dziecko pisało (do kary za niedojechanie do linii) */
// przesunięcie w poziomie, które wyśrodkowuje rysunek względem wzoru (pozycja w poziomie nie ma znaczenia; w pionie nadal liczą się linie)
function centerShiftX() {
  if (G.level.mode === 'spider') return 0;
  let a = Infinity, b = -Infinity, pa = Infinity, pb = -Infinity;
  G.ink.forEach((segs) => segs.forEach((seg) => seg.forEach((p) => { a = Math.min(a, p[0]); b = Math.max(b, p[0]); })));
  if (a === Infinity) return 0;
  getField(G.L).tp.forEach((q) => { pa = Math.min(pa, q[0]); pb = Math.max(pb, q[0]); });
  return (pa + pb) / 2 - (a + b) / 2;
}
function inkDense(dx = 0) {
  const out = [];
  G.ink.forEach((segs) => segs.forEach((seg) => seg.forEach((p, i) => {
    out.push([p[0] + dx, p[1]]);
    if (i) { const q = seg[i - 1], d = Math.hypot(p[0] - q[0], p[1] - q[1]), n = Math.floor(d / 4); for (let k = 1; k < n; k++) { const t = k / n; out.push([q[0] + (p[0] - q[0]) * t + dx, q[1] + (p[1] - q[1]) * t]); } }
  })));
  return out;
}
function coverage0(pts, r) {
  const F = getField(G.L), cell = F.cell, rc = Math.ceil(r / cell), tp = F.tp;
  if (!pts.length) return { cov: 0, covS: G.L.strokes.map(() => 0) };
  let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
  pts.forEach((p) => { mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mny = Math.min(mny, p[1]); mxy = Math.max(mxy, p[1]); });
  const ox0 = mnx - r - cell, oy0 = mny - r - cell, onx = Math.ceil((mxx - mnx + 2 * r) / cell) + 3, ony = Math.ceil((mxy - mny + 2 * r) / cell) + 3;
  const occ = new Uint8Array(onx * ony);
  pts.forEach((p) => {
    const ci = Math.floor((p[0] - ox0) / cell), cj = Math.floor((p[1] - oy0) / cell);
    for (let dj = -rc; dj <= rc; dj++) for (let di = -rc; di <= rc; di++) {
      if (di * di + dj * dj > rc * rc) continue;
      const i = ci + di, j = cj + dj; if (i >= 0 && j >= 0 && i < onx && j < ony) occ[j * onx + i] = 1;
    }
  });
  const per = G.L.strokes.map(() => [0, 0]); let hit = 0;
  tp.forEach((q, k) => {
    const si = F.tpS[k], i = Math.floor((q[0] - ox0) / cell), j = Math.floor((q[1] - oy0) / cell);
    per[si][1]++; if (i >= 0 && j >= 0 && i < onx && j < ony && occ[j * onx + i]) { per[si][0]++; hit++; }
  });
  return { cov: hit / tp.length, covS: per.map(([h, t]) => (t ? h / t : 1)) };
}

/* ---------- dotyk ---------- */
function pointerPos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
// Tylko rysik: po pierwszym dotknięciu Apple Pencil tryb włącza się sam (raz); da się go wyłączyć w menu.
const palmBlocked = (e) => store.penOnly && e.pointerType === 'touch';
function notePen(e) {
  if (e.pointerType !== 'pen' || store.penSeen) return;
  store.penSeen = true; store.penOnly = true; save(); renderPen();
}
cv.addEventListener('pointerdown', (e) => {
  notePen(e);
  if (!G || G.down || palmBlocked(e)) return;
  audio();
  const [x, y] = pointerPos(e), u = S2U(x, y);
  G.finger = u;
  if (G.phase === 'countdown') { if (x <= W / 2) falseStart(); return; } // dotknięcie przed startem = falstart
  if (G.phase === 'free' || G.phase === 'race') { if (G.phase === 'race' && x > W / 2) return; freeDown(e, u); return; }
  if (G.phase !== 'play' || !G.sp || !['hole', 'wait', 'run'].includes(G.sp.state)) return;
  const st = G.L.strokes[G.idx], sp = G.sp;
  let ok = false;
  if (sp.state === 'hole') ok = Math.hypot(u[0] - st.pts[0][0], u[1] - st.pts[0][1]) < grabU();
  else {
    const [d] = nearest(st, u, idxAt(st, G.fingerS - 40), idxAt(st, sp.s));
    ok = d < tolU() || Math.hypot(u[0] - sp.pos[0], u[1] - sp.pos[1]) < grabU();
  }
  if (!ok) { if (sp.state === 'hole') { sp.shake = 0.5; setMsg('Dotknij dziurki — tam schował się pająk.'); } else sp.shake = 0.6; return; }
  G.down = true; G.pid = e.pointerId;
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  if (G.spPending != null) { G.spPending = null; G.lifts++; }
  if (G.tStart === null) G.tStart = G.clock;
  if (sp.state === 'hole') { sp.state = 'wait'; sp.emerge = 0; G.started = true; G.fingerS = 0; sfx.pop(); }
  G.ink[G.idx].push([]); G.off = false;
  addPoint(u);
  if (st.dot) catchSpider();
  else setMsg('Dobrze! Prowadź palec za pająkiem.');
});
cv.addEventListener('pointermove', (e) => {
  if (!G || palmBlocked(e)) return;
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of (evs.length ? evs : [e])) {
    const [x, y] = pointerPos(ev), u = S2U(x, y);
    G.finger = u;
    if (G.down && e.pointerId === G.pid) { if (G.phase === 'free' || G.phase === 'race') freeAdd(u); else addPoint(u); }
  }
});
const SPIDER_END_FRAC = 0.85;
function endPointer(e) {
  if (!G || !G.down || e.pointerId !== G.pid) return;
  G.down = false; G.pid = null;
  if (G.phase === 'free' || G.phase === 'race') { freeUp(); return; }
  if (G.phase === 'play' && G.started && G.sp && G.sp.state !== 'caught') {
    const st = G.L.strokes[G.idx];
    G.spLiftAt = G.clock;
    if (!st.dot && G.sp.s >= st.len - 0.5 && G.fingerS >= st.len - 8 && G.finger && endZone(st, G.finger).dist <= Math.max(30, 34 / S)) { catchSpider(); return; }
    if (!st.dot && G.fingerS >= st.len * SPIDER_END_FRAC) {
      // prawie cała linia za nami i palec uniesiony: po chwili uznajemy koniec ruchu (jak w rundach bez pająka)
      G.spPending = G.clock + 0.7; setMsg('Skończone? Poczekaj chwilę albo dotknij pająka i dopisz brakujący kawałek.'); return;
    }
    G.lifts++; sfx.lift();
    setMsg('Palec się oderwał. Dotknij pająka i prowadź dalej.');
  }
}
cv.addEventListener('pointerup', endPointer);
cv.addEventListener('pointercancel', endPointer);

function addPoint(u) {
  const segs = G.ink[G.idx]; const seg = segs[segs.length - 1]; if (!seg) return;
  const last = seg[seg.length - 1];
  if (last && Math.hypot(u[0] - last[0], u[1] - last[1]) < 1.5) return;
  const st = G.L.strokes[G.idx];
  const [dAll] = nearest(st, u);
  seg.push([u[0], u[1], dAll]);
  G.dev.push(dAll);
  if (st.dot || G.phase !== 'play') return;
  const sp = G.sp;
  const i0 = idxAt(st, G.fingerS - 30), i1 = idxAt(st, Math.min(sp.s, G.fingerS + 26));
  const [dmin] = nearest(st, u, i0, i1);
  const [dNear] = nearest(st, u, i0, idxAt(st, sp.s));
  if (dNear > tolU() * 1.3) { if (!G.off) { G.off = true; setMsg('Wróć palcem bliżej pająka.'); } }
  else if (G.off) { G.off = false; setMsg('Dobrze! Prowadź palec za pająkiem.'); }
  if (dmin < tolU()) {
    let bj = i0;
    for (let i = i0; i <= i1; i++) { const q = st.pts[i]; if (Math.hypot(q[0] - u[0], q[1] - u[1]) <= dmin + 6) bj = i; }
    const ns = Math.min(st.cum[bj], sp.s);
    if (ns > G.fingerS) G.fingerS = ns;
  }
  checkCatch(u);
}
function endZone(st, u) {
  // położenie palca względem końca linii: wzdłuż kierunku końcówki (ujemne = przed końcem) i w poprzek
  const end = st.pts[st.pts.length - 1], back = posAt(st, Math.max(0, st.len - 10));
  let tx = end[0] - back[0], ty = end[1] - back[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
  const dx = u[0] - end[0], dy = u[1] - end[1];
  return { along: dx * tx + dy * ty, perp: Math.abs(dx * ty - dy * tx), dist: Math.hypot(dx, dy) };
}
function checkCatch(u) {
  const st = G.L.strokes[G.idx], sp = G.sp;
  if (sp.state === 'caught' || sp.s < st.len - 0.5 || G.fingerS < st.len - 30) return;
  const z = endZone(st, u);
  // mały margines przed końcem, duży za końcem (gdy palec pojedzie za daleko)
  if (z.along >= -3 && z.along <= Math.max(60, 50 / S) && z.perp <= Math.max(26, 30 / S)) catchSpider();
}
function catchSpider() {
  const sp = G.sp, wasDown = G.down;
  sp.state = 'caught'; sp.t = 0; G.down = false;
  sfx.catch();
  const [x, y] = U2S(sp.pos);
  for (let k = 0; k < 14; k++) {
    const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 160;
    G.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.8, max: 0.8, c: k % 2 ? C.gold : sp.color, r: 3 + Math.random() * 4 });
  }
  const last = G.idx === G.L.strokes.length - 1;
  if (last) { G.tEnd = wasDown ? G.clock : (G.spLiftAt ?? G.clock); timerEl.textContent = fmtTime(G.tEnd - G.tStart); setMsg('Złapany! Brawo!'); }
  else {
    G.idx++; G.started = false; G.fingerS = 0;
    G.sp = newSpider(G.idx); G.sp.t = 0.3; G.spiders.push(G.sp);
    setMsg(strokeHint(G.L.strokes[G.idx]));
  }
}

/* ---------- pisanie bez pająka i wyścig ---------- */
function freeDown(e, u) {
  G.down = true; G.pid = e.pointerId; G.pending = null;
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  if (G.tStart === null) G.tStart = G.clock;
  G.ink[0].push([]);
  freeAdd(u);
}
function freeAdd(u) {
  const seg = G.ink[0][G.ink[0].length - 1]; if (!seg) return;
  const last = seg[seg.length - 1];
  if (last && Math.hypot(u[0] - last[0], u[1] - last[1]) < 1.5) return;
  seg.push([u[0], u[1], 0]);
}
function freeUp() {
  G.freeCount++; G.freeLast = G.clock; G.ev = evalFree();
  const n = G.L.strokes.length;
  if (G.phase === 'race') {
    if (G.freeCount >= n && G.ev.cov >= 0.82 && G.ev.minS >= 0.5) endRace('child');
  } else {
    if (G.freeCount >= n && G.ev.cov >= 0.88 && G.ev.minS >= 0.6) G.pending = G.clock + 1.3;
    setMsg(G.freeCount >= n ? 'Skończone? Dotknij ✔ albo dopisz brakujący kawałek.' : 'Pisz dalej!');
  }
}
function finishFree() {
  if (G.phase !== 'free' || !G.freeCount) return;
  G.ev = evalFree(); G.tEnd = G.freeLast; G.phase = 'done'; G.doneAt = G.clock; G.pending = null; showFreeButtons(false);
  sfx.win(); burst(W / 2, H / 2);
  setMsg('Brawo!');
}
function endRace(winner) {
  if (G.phase !== 'race') return;
  G.winner = winner; G.ev = evalFree(); G.tEnd = G.clock; G.phase = 'done'; G.doneAt = G.clock; G.pending = null; showFreeButtons(false);
  if (winner === 'child') { sfx.win(); burst(W / 4, H / 2); setMsg('Wygrana! Byłeś szybszy od pająka!'); }
  else { sfx.lose(); setMsg('Pająk był szybszy. Spróbuj jeszcze raz!'); }
}
$('clearBtn').addEventListener('click', () => {
  if (!G || (G.phase !== 'free' && G.phase !== 'race')) return;
  G.ink = [[]]; G.freeCount = 0; G.ev = null; G.pending = null;
  if (G.phase === 'free') { G.tStart = null; timerEl.textContent = fmtTime(0); setMsg('Napisz ' + thing(G.ch) + ' jeszcze raz.'); }
});
$('doneBtn').addEventListener('click', () => {
  if (!G) return;
  if (G.phase === 'free') { if (G.freeCount) finishFree(); else setMsg('Najpierw napisz ' + thing(G.ch) + ' palcem.'); }
  else if (G.phase === 'play' && G.level.mode === 'spider') {
    if (G.sp && G.started && !G.down && ['wait', 'run'].includes(G.sp.state)) { G.spPending = null; catchSpider(); }
  } else if (G.phase === 'race') {
    G.ev = evalFree();
    if (G.freeCount && G.ev.cov >= 0.7 && G.ev.minS >= 0.4) endRace('child'); else { sfx.lift(); setMsg('Dokończ ' + thing(G.ch) + '!'); }
  }
});

/* ---------- pętla ---------- */
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (G) { update(dt); draw(); }
  raf = requestAnimationFrame(loop);
}
function burst(cx, cy) {
  for (let k = 0; k < 40; k++) {
    const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
    G.particles.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 1.2, max: 1.2, c: [C.gold, C.ink, SPIDER_COLORS[1], C['line-base']][k % 4], r: 3 + Math.random() * 5 });
  }
}
function update(dt) {
  G.clock += dt;
  const t = G.clock;
  if (G.phase === 'intro' && (!G.plan || t - G.demoAt > G.plan.total)) beginTask();
  if (G.plan && G.plan.segs) { const bt = t - G.demoAt; G.plan.segs.forEach((sg) => { if (bt >= sg.t0 && bt - dt < sg.t0) sfx.tick(); }); }
  if (G.phase === 'falsestart' && t - G.fsAt >= 1) { // po sekundzie odliczanie startuje od nowa, a timer jest wyzerowany
    G.phase = 'countdown'; G.countAt = t; G.countStep = -1; G.tStart = null; G.tEnd = null;
    timerEl.textContent = fmtTime(0); setMsg('Wyścig! Ty piszesz po lewej, pająk po prawej.');
  }
  if (G.phase === 'countdown') {
    const step = Math.floor(t - G.countAt);
    if (step !== G.countStep) { G.countStep = step; if (step < 3) sfx.beep(); else sfx.go(); }
    if (t - G.countAt >= 3) { G.phase = 'race'; G.tStart = t; G.raceAt = t; setMsg('Pisz! Szybciej niż pająk!'); }
  }
  if (G.phase === 'race') raceUpdate(dt);
  if (G.tStart !== null && G.tEnd === null) timerEl.textContent = fmtTime(t - G.tStart);
  if (G.pending !== null && !G.down && t >= G.pending) { if (G.phase === 'race') endRace('child'); else finishFree(); }
  if (G.spPending != null && !G.down && t >= G.spPending && G.sp && ['wait', 'run'].includes(G.sp.state)) { G.spPending = null; catchSpider(); }
  if (G.level.mode === 'spider') {
    const st = G.L.strokes[G.idx];
    const show = G.phase === 'play' && G.sp && G.started && !G.down && ['wait', 'run'].includes(G.sp.state) && !st.dot && G.fingerS > st.len * 0.3;
    $('doneBtn').classList.toggle('invis', !show);
  }
  for (const sp of G.spiders) updateSpider(sp, dt);
  G.particles = G.particles.filter((p) => (p.life -= dt) > 0);
  G.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; });
  if (G.phase === 'done' && t - G.doneAt > 1.0 && resultEl.hidden && rewardEl.hidden) {
    if (G.level.mode === 'race' && G.winner === 'child' && G.li === LEVELS.length - 1 && passes(computeScore())) showReward(); else showResult();
  }
}
function raceUpdate(dt) {
  const R = G.race; if (R.done) return;
  const n = G.L.strokes.length;
  if (R.hop > 0) { R.hop -= dt; if (R.hop <= 0) { R.i++; R.s = 0; R.dotT = 0; } return; }
  const st = G.L.strokes[R.i];
  let finished = false;
  if (st.dot) { R.dotT += dt; finished = R.dotT >= R.dotDur; }
  else { R.s = Math.min(st.len, R.s + R.v * dt); R.gait += R.v * dt * 0.35; finished = R.s >= st.len; }
  if (finished) {
    if (R.i === n - 1) { R.done = true; R.s = st.len; endRace('spider'); }
    else R.hop = R.hopT;
  }
}
function raceSpiderPos() {
  const R = G.race, L = G.L, st = L.strokes[R.i];
  if (R.hop > 0) {
    const a = st.dot ? st.pts[0] : posAt(st, st.len), b = L.strokes[R.i + 1].pts[0], k = 1 - R.hop / R.hopT;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k - Math.sin(k * Math.PI) * 40];
  }
  return st.dot ? st.pts[0].slice() : posAt(st, R.s);
}
function updateSpider(sp, dt) {
  const st = G.L.strokes[sp.i];
  sp.t += dt; sp.shake = Math.max(0, sp.shake - dt);
  if (sp.emerge >= 0) sp.emerge += dt;
  if (sp.state === 'hole') return;
  if (sp.state === 'wait' || sp.state === 'run') {
    if (G.started && sp === G.sp && !st.dot) {
      const lead = Math.min(46, st.len * 0.5);
      const target = Math.min(st.len, G.fingerS + lead);
      const step = Math.min(Math.max(0, target - sp.s), 720 * dt);
      if (step > 0) {
        const prev = sp.pos; sp.s += step; sp.pos = posAt(st, sp.s);
        sp.gait += step * 0.35; sp.tilt = Math.max(-0.35, Math.min(0.35, (sp.pos[0] - prev[0]) / Math.max(0.5, step) * 0.3));
        sp.state = 'run';
      } else { sp.tilt *= 0.9; sp.state = 'wait'; }
    }
    if (G.finger) { const dx = G.finger[0] - sp.pos[0], dy = G.finger[1] - sp.pos[1], m = Math.hypot(dx, dy) || 1; sp.look = [dx / m, dy / m]; }
    if (sp === G.sp && G.down && G.finger) checkCatch(G.finger);
    return;
  }
  if (sp.state === 'caught' && sp.t > 0.45) { sp.state = 'fly'; sp.t = 0; sp.from = U2S(sp.pos); }
  if (sp.state === 'fly' && sp.t >= FLY_DUR) {
    sp.state = 'gone';
    const icons = slotsEl.querySelectorAll('svg');
    if (icons[sp.i]) icons[sp.i].outerHTML = spiderIcon(sp.color, true);
    if (sp.i === G.L.strokes.length - 1) { G.phase = 'done'; G.doneAt = G.clock - 0.5; sfx.win(); burst(W / 2, H / 2); }
  }
}

/* ---------- rysowanie ---------- */
function drawLiniatura(c, oy, s, x0, x1, lw = 1) {
  c.save();
  [[0, C['line-top'], 1.5], [100, C['line-mid'], 2.5], [200, C['line-base'], 2.5], [300, C['line-top'], 1.5]].forEach(([y, col, wd]) => {
    c.strokeStyle = col; c.lineWidth = wd * lw; c.beginPath(); c.moveTo(x0, oy + y * s); c.lineTo(x1, oy + y * s); c.stroke();
  });
  c.restore();
}
function pathPts(c, pts, ox, oy, s, upTo, dx = 0, dy = 0) {
  c.beginPath();
  const n = upTo === undefined ? pts.length : upTo;
  for (let i = 0; i < n; i++) { const x = ox + (pts[i][0] + dx) * s, y = oy + (pts[i][1] + dy) * s; i ? c.lineTo(x, y) : c.moveTo(x, y); }
}
function drawWzor(c, L, ox, oy, s, col, wd) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.fillStyle = col;
  L.strokes.forEach((st) => {
    if (st.dot) { c.beginPath(); c.arc(ox + st.pts[0][0] * s, oy + st.pts[0][1] * s, wd * 0.7 * s, 0, 7); c.fill(); }
    else { c.lineWidth = wd * s; pathPts(c, st.pts, ox, oy, s); c.stroke(); }
  });
  c.restore();
}
function drawDemo(c, bt) {
  const P = G.plan, L = G.L;
  if (!P || bt < 0 || bt > P.total) return;
  if (P.flash) {
    const a = bt < 0.2 ? 0 : Math.min(1, (bt - 0.2) / 0.15, bt <= P.end ? 1 : 1 - (bt - P.end) / (P.total - P.end));
    if (a <= 0) return;
    c.save(); c.globalAlpha = a * 0.9; drawWzor(c, L, OX, OY, S, C.wzor, 12); c.restore();
    return;
  }
  const alpha = bt <= P.end ? 1 : Math.max(0, 1 - (bt - P.end) / (P.total - P.end));
  c.save(); c.globalAlpha = alpha * 0.92; c.lineCap = 'round'; c.lineJoin = 'round';
  const tips = [];
  L.strokes.forEach((st, si) => {
    const sg = P.segs[si]; if (bt < sg.t0) return;
    const k = Math.min(1, (bt - sg.t0) / (sg.t1 - sg.t0)), e = k * 0.7 + k * k * (3 - 2 * k) * 0.3;
    c.strokeStyle = C.wzor; c.fillStyle = C.wzor;
    let tip, dir = [1, 0];
    if (st.dot) { const p = U2S(st.pts[0]); c.beginPath(); c.arc(p[0], p[1], 9 * S * e, 0, 7); c.fill(); tip = st.pts[0]; }
    else {
      const sl = e * st.len, n = Math.min(st.pts.length, Math.floor(sl / 2) + 1);
      c.lineWidth = 12 * S; pathPts(c, st.pts, OX, OY, S, n); tip = posAt(st, sl); const pe = U2S(tip); c.lineTo(pe[0], pe[1]); c.stroke();
      const ahead = posAt(st, Math.min(st.len, sl + 6)), back = posAt(st, Math.max(0, sl - 6));
      const m = Math.hypot(ahead[0] - back[0], ahead[1] - back[1]) || 1; dir = [(ahead[0] - back[0]) / m, (ahead[1] - back[1]) / m];
    }
    const p0 = U2S(st.pts[0]), r = Math.max(10, 9 * S), off = st.dot ? r * 1.7 : 0;
    c.fillStyle = C.ink; c.beginPath(); c.arc(p0[0] - off, p0[1], r, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.font = `800 ${Math.round(r * 1.25)}px Grandstander, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(si + 1), p0[0] - off, p0[1] + r * 0.08);
    if (k < 1) tips.push([tip, dir]);
  });
  tips.forEach(([tip, dir]) => {
    const [x, y] = U2S(tip), r = Math.max(7, 6 * S);
    c.fillStyle = C.ink; c.strokeStyle = '#fff'; c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
    const ax = x + dir[0] * r * 2.4, ay = y + dir[1] * r * 2.4, ang = Math.atan2(dir[1], dir[0]);
    c.strokeStyle = C.ink; c.lineWidth = Math.max(3, 2.6 * S);
    c.beginPath(); c.moveTo(ax - Math.cos(ang - 0.7) * r, ay - Math.sin(ang - 0.7) * r); c.lineTo(ax, ay); c.lineTo(ax - Math.cos(ang + 0.7) * r, ay - Math.sin(ang + 0.7) * r); c.stroke();
  });
  c.restore();
}
// grubość pisaka: na małych linijkach proporcjonalnie cieńsza (bez sztywnego minimum 4 px)
function penW() { const sc = G.level.scale || 1; return Math.max(1.8, 7 * S, 4 * (sc < 1 ? sc / BIG_LINES : 1)); }
function drawInk(c, segs, ox, oy, s, colorFn, width, dx = 0, dy = 0) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = width;
  for (const seg of segs) {
    if (!seg.length) continue;
    if (seg.length === 1) { c.fillStyle = colorFn(seg[0][2]); c.beginPath(); c.arc(ox + (seg[0][0] + dx) * s, oy + (seg[0][1] + dy) * s, width / 2, 0, 7); c.fill(); continue; }
    if (!colorFn.multi) { c.strokeStyle = colorFn(0); pathPts(c, seg, ox, oy, s, undefined, dx, dy); c.stroke(); continue; }
    for (let i = 1; i < seg.length; i++) {
      c.strokeStyle = colorFn(seg[i][2]); c.beginPath();
      c.moveTo(ox + (seg[i - 1][0] + dx) * s, oy + (seg[i - 1][1] + dy) * s); c.lineTo(ox + (seg[i][0] + dx) * s, oy + (seg[i][1] + dy) * s); c.stroke();
    }
  }
  c.restore();
}
function spiderR() { return Math.max(9, Math.min(20, 9.6 * S / (G.level.scale || 1))); }
function drawHole(c, x, y, R, alpha, peek, t) {
  if (alpha <= 0) return;
  c.save(); c.globalAlpha = alpha;
  const rx = R * 1.35, ry = R * 0.8;
  c.fillStyle = C['paper-2']; c.beginPath(); c.ellipse(x, y + R * 0.08, rx * 1.18, ry * 1.25, 0, 0, 7); c.fill();
  c.fillStyle = C.hole; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill();
  if (peek) {
    const blink = (t % 2.6) < 0.14 ? 0.15 : 1, dx = Math.sin(t * 0.9) * R * 0.08;
    [-1, 1].forEach((sd) => {
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + sd * R * 0.36 + dx, y - R * 0.05, R * 0.22, R * 0.26 * blink, 0, 0, 7); c.fill();
      if (blink > 0.5) { c.fillStyle = '#1b1530'; c.beginPath(); c.arc(x + sd * R * 0.36 + dx, y - R * 0.12, R * 0.11, 0, 7); c.fill(); }
    });
  }
  c.restore();
}
function drawSpider(c, x, y, R, o) {
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(o.scale || 1, o.scale || 1); c.globalAlpha = o.alpha ?? 1;
  c.strokeStyle = o.color; c.lineWidth = Math.max(1.6, R * 0.17); c.lineCap = 'round'; c.lineJoin = 'round';
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
    const w = Math.sin(o.gait + i * 1.7 + (sd > 0 ? Math.PI : 0));
    const ry = (i - 1.5) * R * 0.38;
    c.beginPath(); c.moveTo(sd * R * 0.55, ry);
    c.lineTo(sd * R * 1.25, ry - R * 0.6 + w * R * 0.14 + i * R * 0.08);
    c.lineTo(sd * (R * 1.75 + w * R * 0.1), ry + R * 0.25 + (i - 1.5) * R * 0.3);
    c.stroke();
  }
  c.fillStyle = o.color; c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.ellipse(-R * 0.4, -R * 0.5, R * 0.32, R * 0.18, -0.6, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,140,170,.55)'; [-1, 1].forEach((sd) => { c.beginPath(); c.arc(sd * R * 0.6, R * 0.32, R * 0.15, 0, 7); c.fill(); });
  const happy = o.mood === 'happy';
  [-1, 1].forEach((sd) => {
    const ex = sd * R * 0.34, ey = -R * 0.12;
    if (happy) { c.strokeStyle = '#fff'; c.lineWidth = R * 0.12; c.beginPath(); c.arc(ex, ey + R * 0.08, R * 0.2, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); return; }
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, R * 0.28, R * 0.32, 0, 0, 7); c.fill();
    const lx = (o.look ? o.look[0] : 0) * R * 0.11, ly = (o.look ? o.look[1] : 0) * R * 0.12;
    c.fillStyle = '#1b1530'; c.beginPath(); c.arc(ex + lx, ey + ly, R * 0.15, 0, 7); c.fill();
  });
  c.strokeStyle = '#fff'; c.lineWidth = R * 0.1; c.beginPath();
  if (happy) c.arc(0, R * 0.3, R * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (o.mood === 'scared') c.ellipse(0, R * 0.42, R * 0.09, R * 0.12, 0, 0, 7);
  else c.arc(0, R * 0.28, R * 0.14, 0.2 * Math.PI, 0.8 * Math.PI);
  c.stroke();
  c.restore();
}
function drawPencil(c, x, y, s) {
  c.save(); c.translate(x, y); c.rotate(-0.7); c.lineJoin = 'round';
  c.fillStyle = '#f2b01e'; c.fillRect(-s * 1.4, -s * 0.32, s * 2.2, s * 0.64);
  c.fillStyle = '#f0c9a8'; c.beginPath(); c.moveTo(s * 0.8, -s * 0.32); c.lineTo(s * 1.45, 0); c.lineTo(s * 0.8, s * 0.32); c.closePath(); c.fill();
  c.fillStyle = C.ink; c.beginPath(); c.moveTo(s * 1.22, -s * 0.11); c.lineTo(s * 1.45, 0); c.lineTo(s * 1.22, s * 0.11); c.closePath(); c.fill();
  c.fillStyle = '#e88aa0'; c.fillRect(-s * 1.7, -s * 0.32, s * 0.3, s * 0.64);
  c.restore();
}
function draw() {
  const c = ctx, L = G.L, race = G.level.mode === 'race';
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.fillStyle = C.paper; c.fillRect(0, 0, W, H);
  const R = spiderR();
  if (race) {
    drawLiniatura(c, OY, S, 0, W / 2 - 8); drawLiniatura(c, OY, S, W / 2 + 8, W);
    c.save(); c.strokeStyle = C['line-top']; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(W / 2, 6); c.lineTo(W / 2, H - 6); c.stroke(); c.restore();
    drawPencil(c, 26, 22, 12);
    drawSpider(c, W / 2 + 26, 24, 9, { color: SPIDER_COLORS[0], gait: 0, look: [0, 1], mood: 'calm' });
    // ślad pająka po prawej
    if (G.race) {
      const Rr = G.race;
      c.save(); c.strokeStyle = SPIDER_COLORS[0]; c.fillStyle = SPIDER_COLORS[0]; c.globalAlpha = 0.75; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = Math.max(4, 6 * S);
      L.strokes.forEach((st, i) => {
        if (i > Rr.i) return;
        const full = i < Rr.i || Rr.done || (i === Rr.i && Rr.hop > 0);
        if (st.dot) { if (full || Rr.dotT > Rr.dotDur * 0.4) { const p = R2S(st.pts[0]); c.beginPath(); c.arc(p[0], p[1], Math.max(3, 6 * S), 0, 7); c.fill(); } return; }
        const s = full ? st.len : Rr.s, n = Math.min(st.pts.length, Math.floor(s / 2) + 1);
        pathPts(c, st.pts, RX, OY, S, n); const e = R2S(posAt(st, s)); c.lineTo(e[0], e[1]); c.stroke();
      });
      c.restore();
      if (G.phase === 'race' || G.phase === 'done') {
        const p = R2S(raceSpiderPos());
        const mood = G.winner === 'spider' ? 'happy' : G.winner === 'child' ? 'scared' : 'calm';
        drawSpider(c, p[0], p[1] + (G.winner === 'spider' ? Math.sin(G.clock * 12) * 4 : 0), R, { color: SPIDER_COLORS[0], gait: Rr.gait, look: [-1, 0], mood });
      } else {
        const p = R2S(L.strokes[0].pts[0]);
        drawSpider(c, p[0], p[1], R, { color: SPIDER_COLORS[0], gait: G.clock * 3, look: [-1, 0], mood: 'calm' });
      }
    }
    // linia dziecka po lewej
    G.ink.forEach((segs) => drawInk(c, segs, OX, OY, S, () => C.ink, penW()));
    // przyciemnienie tła podczas odliczania; po starcie rozjaśnia się, żeby czuć różnicę między czekaniem a wyścigiem
    const dimA = G.phase === 'countdown' ? Math.min(1, (G.clock - G.countAt) / 0.25) : G.phase === 'falsestart' ? 1 : 0; // na start tło jest od razu jasne (bez animacji)
    if (dimA > 0) { c.fillStyle = `rgba(40,32,80,${(0.22 * dimA).toFixed(3)})`; c.fillRect(0, 0, W, H); }
    if (G.phase === 'countdown') drawCountdown(c);
    if (G.phase === 'falsestart') drawFalseStart(c);
  } else {
    drawLiniatura(c, OY, S, 0, W);
    // zapowiedź następnej dziurki pod koniec bieżącego ruchu
    if (G.level.mode === 'spider' && G.sp && G.started && G.idx + 1 < L.strokes.length && ['wait', 'run'].includes(G.sp.state)) {
      const st = L.strokes[G.idx], k = st.dot ? 0 : (G.sp.s / st.len - 0.6) / 0.3;
      if (k > 0) { const p = U2S(L.strokes[G.idx + 1].pts[0]); drawHole(c, p[0], p[1], R, Math.min(1, k), true, G.clock); }
    }
    // dziurki
    G.spiders.forEach((sp) => {
      const p = U2S(L.strokes[sp.i].pts[0]);
      const a = sp.state === 'hole' ? Math.min(1, sp.t / 0.3) : (sp.emerge >= 0 ? Math.max(0, 1 - sp.emerge / 0.7) : 0);
      let x = p[0]; if (sp.state === 'hole' && sp.shake > 0) x += Math.sin(sp.shake * 50) * R * 0.15;
      drawHole(c, x, p[1], R, a, sp.state === 'hole', G.clock);
    });
    // nić pająka (ślad)
    c.save(); c.strokeStyle = C.silk; c.lineWidth = 2; c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([2, 4]);
    G.spiders.forEach((sp) => {
      const st = L.strokes[sp.i]; if (st.dot || sp.state === 'hole') return;
      const s = sp.state === 'gone' || sp.state === 'fly' || sp.state === 'caught' ? st.len : sp.s;
      const n = Math.min(st.pts.length, Math.floor(s / 2) + 1);
      pathPts(c, st.pts, OX, OY, S, n); const e = U2S(posAt(st, s)); c.lineTo(e[0], e[1]); c.stroke();
    });
    c.restore();
    G.ink.forEach((segs) => drawInk(c, segs, OX, OY, S, () => C.ink, penW()));
    drawDemo(c, G.clock - G.demoAt);
    G.spiders.forEach((sp) => {
      if (sp.state === 'gone' || sp.state === 'hole') return;
      let [x, y] = U2S(sp.pos), scale = 1, alpha = 1, mood = 'calm';
      if (sp.emerge >= 0 && sp.emerge < EMERGE) { const k = sp.emerge / EMERGE; scale = 0.3 + 0.7 * (1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2)); }
      if (sp.state === 'run' || (G.down && sp === G.sp)) mood = 'scared';
      if (sp.shake > 0) x += Math.sin(sp.shake * 60) * R * 0.15;
      if (sp.state === 'wait' && G.started && sp === G.sp && sp.s >= L.strokes[sp.i].len - 0.5 && !L.strokes[sp.i].dot) { x += Math.sin(G.clock * 40) * R * 0.06; mood = 'scared'; }
      if (sp.state === 'caught') { mood = 'happy'; scale = 1 + Math.sin(Math.min(1, sp.t / 0.45) * Math.PI) * 0.35; }
      if (sp.state === 'fly') {
        mood = 'happy';
        const k = Math.min(1, sp.t / FLY_DUR), e = k * k * (3 - 2 * k);
        const ic = slotsEl.querySelectorAll('svg')[sp.i];
        let tx = W - 40, ty = -20;
        if (ic) { const r1 = ic.getBoundingClientRect(), r0 = cv.getBoundingClientRect(); tx = r1.left + r1.width / 2 - r0.left; ty = r1.top + r1.height / 2 - r0.top; }
        x = sp.from[0] + (tx - sp.from[0]) * e; y = sp.from[1] + (ty - sp.from[1]) * e - Math.sin(k * Math.PI) * 80;
        scale = 1 - e * 0.4; alpha = 1 - e * 0.3;
      }
      drawSpider(c, x, y, R, { color: sp.color, gait: sp.gait, look: sp.look, tilt: sp.tilt, mood, scale, alpha });
    });
  }
  G.particles.forEach((p) => { c.globalAlpha = Math.max(0, p.life / p.max); c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); });
  c.globalAlpha = 1;
}
function drawFalseStart(c) {
  const k = G.clock - G.fsAt, cx = W / 2 + Math.sin(k * 45) * 7 * Math.max(0, 1 - k * 1.6), cy = H / 2, r = Math.min(W, H) * 0.2;
  c.save();
  c.fillStyle = `rgba(214,69,58,${(0.14 + 0.06 * Math.sin(k * 14)).toFixed(3)})`; c.fillRect(0, 0, W, H);
  c.fillStyle = C.bad; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = r * 0.16; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx - r * 0.38, cy - r * 0.38); c.lineTo(cx + r * 0.38, cy + r * 0.38); c.moveTo(cx + r * 0.38, cy - r * 0.38); c.lineTo(cx - r * 0.38, cy + r * 0.38); c.stroke();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `800 ${Math.round(r * 0.34)}px Grandstander, sans-serif`;
  c.lineWidth = r * 0.07; c.strokeStyle = C.bad; c.strokeText('Falstart!', cx, cy + r * 1.35); c.fillText('Falstart!', cx, cy + r * 1.35);
  c.restore();
}
function drawCountdown(c) {
  const k = G.clock - G.countAt, step = Math.floor(k), f = k - step;
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.2 * (1.15 - f * 0.25);
  c.save(); c.globalAlpha = 1 - f * 0.3;
  c.fillStyle = step < 3 ? C.ink : C.good; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (step < 3) { c.font = `800 ${Math.round(r * 1.2)}px Grandstander, sans-serif`; c.fillText(String(3 - step), cx, cy + r * 0.06); }
  else { // flaga start
    c.strokeStyle = '#fff'; c.lineWidth = r * 0.09; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx - r * 0.35, cy + r * 0.55); c.lineTo(cx - r * 0.35, cy - r * 0.55); c.stroke();
    c.beginPath(); c.moveTo(cx - r * 0.35, cy - r * 0.5); c.lineTo(cx + r * 0.45, cy - r * 0.5); c.lineTo(cx + r * 0.28, cy - r * 0.22); c.lineTo(cx + r * 0.45, cy + r * 0.06); c.lineTo(cx - r * 0.35, cy + r * 0.06); c.closePath(); c.fill();
  }
  c.restore();
}

/* ---------- wynik ---------- */
function devColor(d) { const x = d / 100; return x < 0.1 ? C.good : x < 0.2 ? C.warn : C.bad; }
devColor.multi = true;
const GREEN_ACC = 0.75, GREEN_SPEED = 0.66;
const passes = (r) => r.acc > GREEN_ACC && r.speed > GREEN_SPEED;

/* ---------- ocena dokładności: punkty kluczowe ruchu (start, skrajne punkty w pionie, koniec) + kierunki ---------- */
// Szerokość literki nie ma znaczenia (rysunek skalujemy w poziomie do wzoru). Liczy się: gdzie ruch się zaczął, czy dojechał do właściwej linii,
// czy nie przekroczył jej za bardzo i czy jechał w dobrym kierunku między punktami.
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
// Punkty leżące MIĘDZY liniami (ogonki h, l, t, brzuszki itp.): niedojechanie prawie nie jest karane (do ok. 22 jedn. za wzorem bez kary),
// za daleko (ponad ok. 13 jedn. za wzorem, a zwłaszcza za kolejną linią) jest karane mocno. Np. ogonek h: strefa ok. 20–55% wysokości nad linią podstawy.
const lineYs = [0, 100, 200, 300];
// Mnożnik tolerancji: przy zmniejszonej linijce (ćwiczenia „Mniejsza/Jeszcze mniejsza/Malutka literka”) ten sam błąd w milimetrach to większy błąd w jednostkach wzoru
let TM = 1;
const offLine = (y) => lineYs.every((l) => Math.abs(y - l) >= 18);
function zonePen(y0, e, sd) { // e > 0: za daleko, e < 0: niedojechanie; sd: kierunek ruchu w pionie (1 = w dół)
  if (e <= 0) return 0.3 * clamp01((-e - 22 * TM) / (40 * TM));
  let p = clamp01((e - 13 * TM) / (22 * TM));
  const nl = lineYs.find((l) => (l - y0) * sd > 0);
  if (nl !== undefined) { const cr = e - Math.abs(nl - y0); if (cr > 6 * TM) p = Math.max(p, clamp01(0.5 + (cr - 6 * TM) / (24 * TM))); }
  return p;
}
function keyPts(st) {
  if (st.kp) return st.kp;
  const p = st.pts, prom = 28, kp = [{ x: p[0][0], y: p[0][1], t: 's', i: 0 }];
  let mx = p[0], mn = p[0], mxI = 0, mnI = 0, dir = 0;
  for (let i = 1; i < p.length; i++) {
    const y = p[i][1];
    if (y > mx[1]) { mx = p[i]; mxI = i; }
    if (y < mn[1]) { mn = p[i]; mnI = i; }
    if (dir >= 0 && mx[1] - y > prom) { if (mxI > 0) kp.push({ x: mx[0], y: mx[1], t: 'max', i: mxI }); dir = -1; mx = mn = p[i]; mxI = mnI = i; }
    else if (dir <= 0 && y - mn[1] > prom) { if (mnI > 0) kp.push({ x: mn[0], y: mn[1], t: 'min', i: mnI }); dir = 1; mx = mn = p[i]; mxI = mnI = i; }
  }
  kp.push({ x: p[p.length - 1][0], y: p[p.length - 1][1], t: 'e', i: p.length - 1 });
  // pętla (kółeczko): miejsce, gdzie ścieżka wraca do wcześniejszego punktu i obejmuje realne pole (nie jest to tylko cofnięcie po tej samej linii)
  let best = 0;
  for (let i = 0; i < p.length; i += 2) for (let j = i + 50; j < p.length; j++) {
    if (Math.hypot(p[j][0] - p[i][0], p[j][1] - p[i][1]) > 12) continue;
    let ar = 0; for (let k = i; k < j; k++) ar += p[k][0] * p[k + 1][1] - p[k + 1][0] * p[k][1];
    ar = Math.abs(ar) / 2;
    if (ar > 800 && ar > best) { best = ar; st.loop = { a: i, b: j }; }
  }
  // powroty po tej samej linii (np. laseczka „a”, „d”, „h”: w górę i z powrotem w dół): wzór wraca po swojej własnej śladzie
  // skrajne punkty w poziomie (np. środek prawej strony „o”): muszą leżeć po właściwej stronie sąsiednich punktów kluczowych
  st.xk = [];
  { let mx = p[0], mn = p[0], mxI = 0, mnI = 0, dir = 0; const pr = 15;
    for (let i = 1; i < p.length; i++) {
      const x = p[i][0];
      if (x > mx[0]) { mx = p[i]; mxI = i; }
      if (x < mn[0]) { mn = p[i]; mnI = i; }
      if (dir >= 0 && mx[0] - x > pr) { if (mxI > 0) st.xk.push({ x: mx[0], y: mx[1], t: 'xmax', i: mxI }); dir = -1; mx = mn = p[i]; mxI = mnI = i; }
      else if (dir <= 0 && x - mn[0] > pr) { if (mnI > 0) st.xk.push({ x: mn[0], y: mn[1], t: 'xmin', i: mnI }); dir = 1; mx = mn = p[i]; mxI = mnI = i; }
    }
  }
  st.retr = {};
  for (let k = 1; k < kp.length - 1; k++) {
    const A = p.slice(kp[k - 1].i, kp[k].i + 1), B = p.slice(kp[k].i, kp[k + 1].i + 1);
    if (A.length < 20 || B.length < 20) continue;
    const ds = B.map((q) => { let m = 1e9; for (const r of A) m = Math.min(m, Math.hypot(q[0] - r[0], q[1] - r[1])); return m; }).sort((x, y) => x - y);
    if (ds[ds.length >> 1] < 4) st.retr[k] = true;
  }
  return (st.kp = kp);
}
function scoreStroke(C, st) {
  const kp = keyPts(st), N = C.length, K = kp.length;
  if (N < 2) return { s: 0, idx: [] };
  const cost = (k, j) => Math.abs(C[j][1] - kp[k].y) + 0.35 * Math.abs(C[j][0] - kp[k].x);
  const idx = new Array(K).fill(0); idx[K - 1] = N - 1;
  if (K > 2) { // dopasowanie punktów kluczowych do ścieżki dziecka w kolejności (programowanie dynamiczne)
    const dp = [], bk = [];
    for (let k = 1; k < K - 1; k++) {
      dp[k] = []; bk[k] = [];
      for (let j = 0; j < N; j++) {
        let b = 0, bj = 0;
        if (k > 1) { b = Infinity; for (let q = 0; q <= j; q++) if (dp[k - 1][q] < b) { b = dp[k - 1][q]; bj = q; } }
        dp[k][j] = b + cost(k, j); bk[k][j] = bj;
      }
    }
    let bj = 0, b = Infinity; for (let j = 0; j < N; j++) if (dp[K - 2][j] < b) { b = dp[K - 2][j]; bj = j; }
    idx[K - 2] = bj; for (let k = K - 3; k >= 1; k--) idx[k] = bk[k + 1][idx[k + 1]];
  }
  let pen = 0, ws = 0, mx2 = 0; const add = (w, p) => { pen += w * clamp01(p); ws += w; if (w >= 2) mx2 = Math.max(mx2, clamp01(p)); };
  kp.forEach((q, k) => {
    if (q.t === 'max' || q.t === 'min') { // dojechanie do linii (mniejsza tolerancja) i przekroczenie linii (większa tolerancja)
      let r = C[idx[k]][1];
      for (let j = idx[k - 1]; j <= idx[k + 1]; j++) r = q.t === 'max' ? Math.max(r, C[j][1]) : Math.min(r, C[j][1]);
      const e = q.t === 'max' ? r - q.y : q.y - r;
      add(2.5, offLine(q.y) ? zonePen(q.y, e, q.t === 'max' ? 1 : -1) : (e > 0 ? (e - 6 * TM) / (14 * TM) : (-e - 6 * TM) / (24 * TM))); // tolerancja ok. 6% odstępu między liniami przed linią i za linią, pełna kara od ok. 30
    } else { // start i koniec: właściwa linia w pionie, w poziomie tylko z grubsza
      const c = C[idx[k]];
      const touch = q.t === 'e' && contactsOf(G.L.strokes.indexOf(st)).some((o) => o.i === st.pts.length - 1);
      if (q.t === 'e' && !touch && offLine(q.y)) { const sd = q.y > kp[K - 2].y ? 1 : -1; add(2.5, zonePen(q.y, (c[1] - q.y) * sd, sd) + 0.3 * clamp01((Math.abs(c[0] - q.x) - 60 * TM) / (80 * TM))); }
      else add(q.t === 's' ? 3 : 2.5, (Math.abs(c[1] - q.y) - (q.t === 's' && offLine(q.y) ? 20 : 8) * TM) / ((q.t === 's' && offLine(q.y) ? 35 : 30) * TM) + 0.8 * clamp01((Math.abs(c[0] - q.x) - 35 * TM) / (55 * TM)));
    }
  });
  for (let k = 0; k < K - 1; k++) { // kierunek ruchu między kolejnymi punktami i strona wybrzuszenia (kierunek kółka)
    const a = kp[k], b = kp[k + 1], ca = C[idx[k]], cb = C[idx[k + 1]], tl = Math.hypot(b.x - a.x, b.y - a.y);
    if (tl < 30) continue;
    const d = Math.abs(angDiff(Math.atan2(cb[1] - ca[1], cb[0] - ca[0]), Math.atan2(b.y - a.y, b.x - a.x)));
    { const m = Math.min(TM, 2.4); add(2, (d * 57.3 - 35 * m) / (40 * m)); }
    const m = st.pts[(a.i + b.i) >> 1], cm = C[(idx[k] + idx[k + 1]) >> 1];
    const tb = ((b.x - a.x) * (m[1] - a.y) - (b.y - a.y) * (m[0] - a.x)) / tl;
    const cl = Math.hypot(cb[0] - ca[0], cb[1] - ca[1]) || 1, cbul = ((cb[0] - ca[0]) * (cm[1] - ca[1]) - (cb[1] - ca[1]) * (cm[0] - ca[0])) / cl;
    if (Math.abs(tb) > 14 && Math.abs(cbul) > 8 && tb * cbul < 0) add(1.2, 0.9);
    // duży brzuszek (np. D, B, P, R, O): jego wybrzuszenie w prawdziwej szerokości (bez skalowania) ma być co najmniej ok. 75% wzoru
    if (Math.abs(tb) > 40) { const q = tb * cbul > 0 ? Math.abs(cbul) / (scoreStroke.sc || 1) / Math.abs(tb) : 0; add(3.5, (Math.max(0.4, 0.75 - 0.1 * (TM - 1)) - q) / 0.25); }
  }
  { // skrajne punkty w poziomie (np. środek prawej strony „o”): po właściwej stronie sąsiednich punktów (kluczowych i poziomych), min. ok. 40% przesunięcia wzoru
    const xs = st.xk || [];
    if (xs.length) { // tylko jednoznaczne przypadki: dokładnie jeden skrajny punkt poziomy między dwoma punktami kluczowymi
      const per = {};
      xs.forEach((q) => { let k = 0; while (k < K - 2 && kp[k + 1].i < q.i) k++; (per[k] = per[k] || []).push(q); });
      Object.keys(per).forEach((key) => {
        const k = +key; if (per[k].length !== 1) return;
        const q = per[k][0]; let cx = C[idx[k]][0];
        for (let j = idx[k]; j <= idx[k + 1]; j++) cx = q.t === 'xmax' ? Math.max(cx, C[j][0]) : Math.min(cx, C[j][0]);
        [k, k + 1].forEach((n) => {
          const tOff = q.x - kp[n].x; if (Math.abs(tOff) < 18) return;
          add(2.5, (0.4 - ((cx - C[idx[n]][0]) / (scoreStroke.sc || 1)) / tOff) / 0.4);
        });
      });
    }
  }
  if (st.loop) { // kara za niedomknięcie kółeczka: początek i koniec pętli powinny się spotkać
    const mi = (ti) => { let k = 0; while (k < K - 2 && kp[k + 1].i < ti) k++; const t = (ti - kp[k].i) / Math.max(1, kp[k + 1].i - kp[k].i); return Math.round(idx[k] + Math.max(0, Math.min(1, t)) * (idx[k + 1] - idx[k])); };
    const ia = mi(st.loop.a), ib = mi(st.loop.b); let gap = Infinity;
    for (let u = Math.max(0, ia - 3); u <= Math.min(N - 1, ia + 3); u++) for (let v = Math.max(0, ib - 4); v <= Math.min(N - 1, ib + 4); v++) gap = Math.min(gap, Math.hypot(C[u][0] - C[v][0], C[u][1] - C[v][1]));
    add(3, (gap - 8 * TM) / (24 * TM));
  }
  for (let k = 1; k < K - 1; k++) { // powrót po tej samej linii: dziecko musi wracać po własnym śladzie (tolerancja ok. 8 jedn., pełna kara od ok. 16)
    if (!st.retr[k]) continue;
    const A = C.slice(idx[k - 1], idx[k] + 1), B = C.slice(idx[k], idx[k + 1] + 1);
    if (A.length < 3 || B.length < 3) { add(3, 0.8); continue; }
    const ds = B.map((q) => ptDist(q, A)).sort((x, y) => x - y);
    add(3, (ds[ds.length >> 1] - 8 * TM) / (8 * TM));
  }
  return { s: clamp01(1 - 1.5 * pen / ws - 0.3 * mx2), idx }; // dodatkowo najcięższe uchybienie (start, koniec, linia, kółeczko) obniża ocenę ruchu
}
// styki: miejsca, w których ruch wzoru dotyka lub przecina inny ruch (np. brzuszek wracający do laseczki w „B”, poprzeczka w „t”)
function ptDist(pt, P) { // odległość punktu od łamanej (nie tylko od jej próbek)
  let m = Infinity;
  for (let j = 0; j < P.length; j++) {
    const a = P[j], b = P[j + 1] || a, dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / l2)) : 0;
    m = Math.min(m, Math.hypot(pt[0] - a[0] - t * dx, pt[1] - a[1] - t * dy));
  }
  return m;
}
function contactsOf(t) {
  const L = G.L, st = L.strokes[t]; if (st.cont) return st.cont;
  const out = [], n = st.pts.length;
  L.strokes.forEach((o, u) => {
    if (u === t || o.dot) return;
    const near = st.pts.map((p) => { let m = 1e9; for (const q of o.pts) m = Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1])); return m < 12; });
    for (let a = 0; a < n; a++) {
      if (!near[a]) continue; let b = a; while (b + 1 < n && near[b + 1]) b++;
      out.push({ i: a === 0 ? 0 : b === n - 1 ? n - 1 : (a + b) >> 1, u }); a = b;
    }
  });
  return (st.cont = out);
}
function keyAcc() {
  const L = G.L, spider = G.level.mode === 'spider', all = [];
  TM = Math.min(4, 1 / Math.max(0.25, G.level.scale || 1));
  G.ink.forEach((s) => s.forEach((q) => q.forEach((p) => all.push(p))));
  if (!all.length) return 0;
  let a = Infinity, b = -Infinity; all.forEach((p) => { a = Math.min(a, p[0]); b = Math.max(b, p[0]); });
  const sc = Math.max(0.6, Math.min(1.7, L.width / Math.max(40, b - a))), nx = (x) => (x - (a + b) / 2) * sc + L.width / 2;
  scoreStroke.sc = sc;
  const norm = (pts) => pts.length < 2 ? [] : resample(pts.map((p) => [nx(p[0]), p[1]]), 8).pts;
  let cs = [];
  if (spider) cs = G.ink.map((s) => norm([].concat(...s.filter((q) => q.length > 1))));
  else G.ink[0].forEach((seg) => { if (seg.length < 2) return; const last = cs[cs.length - 1], lp = last && last[last.length - 1]; if (lp && Math.hypot(seg[0][0] - lp[0], seg[0][1] - lp[1]) < 8 * TM) last.push(...seg); else cs.push(seg.slice()); });
  if (!spider) cs = cs.map(norm);
  const T = []; L.strokes.forEach((st, i) => { if (!st.dot) T.push(i); });
  const R = {};
  if (spider) T.forEach((t) => { if (cs[t]) { const r = scoreStroke(cs[t], L.strokes[t]); R[t] = { s: r.s, idx: r.idx, C: cs[t] }; } });
  else {
    const pr = []; T.forEach((t) => cs.forEach((c, ci) => { const r = scoreStroke(c, L.strokes[t]); pr.push([r.s, t, ci, r.idx]); }));
    pr.sort((x, y) => y[0] - x[0]); const ut = new Set(), uc = new Set();
    pr.forEach(([s, t, ci, ix]) => { if (ut.has(t) || uc.has(ci)) return; ut.add(t); uc.add(ci); R[t] = { s, idx: ix, C: cs[ci] }; });
  }
  // kontrola styków: w miejscu, gdzie wzorzec dotyka innego ruchu, ruch dziecka też musi dotykać (z tolerancją ok. 14 jednostek)
  T.forEach((t) => {
    const r = R[t]; if (!r || !r.idx.length) return;
    const kp = keyPts(L.strokes[t]), K = kp.length; let worst = 0;
    contactsOf(t).forEach(({ i, u }) => {
      let k = 0; while (k < K - 2 && kp[k + 1].i < i) k++;
      const f = Math.max(0, Math.min(1, (i - kp[k].i) / Math.max(1, kp[k + 1].i - kp[k].i)));
      const pt = r.C[Math.max(0, Math.min(r.C.length - 1, Math.round(r.idx[k] + f * (r.idx[k + 1] - r.idx[k]))))];
      let d = 60; if (R[u]) d = ptDist(pt, R[u].C);
      worst = Math.max(worst, clamp01((d - 16 * TM) / (26 * TM)));
    });
    r.s = clamp01(r.s - 0.5 * worst);
  });
  const vals = T.map((t) => (R[t] ? R[t].s : 0));
  L.strokes.forEach((st) => { if (!st.dot) return; let d = Infinity; all.forEach((p) => { d = Math.min(d, Math.hypot(nx(p[0]) - st.pts[0][0], p[1] - st.pts[0][1])); }); vals.push(1 - clamp01((d - 50 * TM) / (60 * TM))); });
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  return 0.6 * mean + 0.4 * Math.min(...vals);
}
function computeScore() {
  const time = Math.max(0.1, (G.tEnd ?? G.clock) - (G.tStart ?? G.clock));
  // wymagany czas: ok. 24% krótszy niż dawniej, a z każdym poziomem o 1 pkt proc. krócej
  const ref = refTime() * (0.76 - 0.01 * G.li);
  const speed = Math.max(0, Math.min(1, 1 - (time - ref) / (2 * ref)));
  let acc;
  G.dx = centerShiftX();
  if (G.level.mode === 'spider') {
    const samples = G.dev.length ? G.dev : [0];
    const accRaw = samples.reduce((a, d) => a + Math.max(0, Math.min(1, 1 - (d / 100 - 0.03) / 0.17)), 0) / samples.length;
    // koniec ruchu wykrywamy po oderwaniu palca, więc niedojechanie do końca linii obniża ocenę (kropki pomijamy)
    const c0 = coverage0(inkDense(), Math.max(12, 10 / S));
    const covS = c0.covS.map((c, i) => (G.L.strokes[i].dot ? 1 : c));
    const covScore = Math.max(0, Math.min(1, (c0.cov - 0.8) / 0.17));
    const missing = covS.filter((c) => c < 0.5).length;
    const short = covS.reduce((a, c) => a + Math.max(0, 0.93 - c), 0);
    acc = Math.max(0, keyAcc() - G.lifts * 0.04);
  } else {
    // dokładność liczona od miejsca, w którym dziecko faktycznie pisało (bez przesuwania na wzór)
    const ev = G.ev || evalFree(), slack = 8 / S;
    let sum = 0, n = 0;
    G.ink[0].forEach((seg) => seg.forEach((p) => { const d = Math.max(0, nearestAll([p[0] + G.dx, p[1]]) - slack); p[2] = d; sum += Math.max(0, Math.min(1, 1 - (d / 100 - 0.03) / 0.17)); n++; }));
    const accRaw = n ? sum / n : 0;
    // niedojechanie do linii wzoru mocno obniża ocenę: liczymy pokrycie rysunku wyśrodkowanego w poziomie
    const c0 = coverage0(inkDense(G.dx), Math.max(12, 10 / S));
    const covScore = Math.max(0, Math.min(1, (c0.cov - 0.8) / 0.17));
    const missing = c0.covS.filter((c) => c < 0.5).length;
    const short = c0.covS.reduce((a, c) => a + Math.max(0, 0.93 - c), 0);
    acc = Math.max(0, keyAcc() - Math.max(0, G.freeCount - G.L.strokes.length - 1) * 0.04);
  }
  const spider = G.level.mode === 'spider';
  const total = G.level.mode === 'race' ? acc : spider ? 0.65 * acc + 0.35 * speed : 0.75 * acc + 0.25 * speed;
  const cups = total >= 0.85 ? 3 : total >= (spider ? 0.62 : 0.68) ? 2 : 1;
  return { time, speed, acc, cups, total };
}
function setupCanvas(cvs) {
  const r = cvs.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 3);
  cvs.width = Math.round(r.width * d); cvs.height = Math.round(r.height * d);
  const c = cvs.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
  return [c, r.width, r.height];
}
function drawCompare(cvs, mode, src = G) {
  // rozmiar jak podczas pisania: małe linijki są pokazane mniejsze (względem dużej), a wszystko jest wyśrodkowane względem wzoru
  const [c, w, h] = setupCanvas(cvs), L = G.L;
  c.fillStyle = C.paper; c.fillRect(0, 0, w, h);
  const ax = src.dx || 0, ay = 0, sc = src.scale || (src.level && src.level.scale) || 1, rel = (sc < 1 ? sc : BIG_LINES) / BIG_LINES;
  let ix0 = Infinity, ix1 = -Infinity, iy0 = Infinity, iy1 = -Infinity;
  src.ink.forEach((segs) => segs.forEach((seg) => seg.forEach((p) => { ix0 = Math.min(ix0, p[0] + ax); ix1 = Math.max(ix1, p[0] + ax); iy0 = Math.min(iy0, p[1]); iy1 = Math.max(iy1, p[1]); })));
  const has = ix0 !== Infinity;
  const cx = L.width / 2, tT = Math.min(0, L.minY - 10), tB = Math.max(300, L.maxY + 8), cy = (tT + tB) / 2;
  let hw = L.width / 2 + 8, hh = (tB - tT) / 2;
  if (has) { hw = Math.max(hw, cx - (ix0 - 12), (ix1 + 12) - cx); hh = Math.max(hh, cy - (iy0 - 12), (iy1 + 12) - cy); }
  const s = Math.min((h - 10) / (2 * hh), (w - 10) / (2 * hw)) * rel;
  const ox = w / 2 - cx * s, oy = h / 2 - cy * s;
  drawLiniatura(c, oy, s, 0, w, 0.8);
  if (mode === 'both') drawWzor(c, L, ox, oy, s, C['wzor-cmp'], 16);
  if (mode === 'wzor') drawWzor(c, L, ox, oy, s, C.ink, 7);
  if (mode === 'both') src.ink.forEach((segs) => drawInk(c, segs, ox, oy, s, devColor, Math.max(3 * Math.min(1, rel), 5 * s), ax, ay));
  if (mode === 'child') src.ink.forEach((segs) => drawInk(c, segs, ox, oy, s, Object.assign(() => C.ink, { multi: false }), Math.max(3 * Math.min(1, rel), 7 * s), ax, ay));
}
function drawResultCanvases() {
  drawCompare($('cmpA'), 'wzor'); drawCompare($('cmpB'), 'child'); drawCompare($('cmpMain'), 'both');
  document.querySelectorAll('#cmp figure.hist').forEach((f) => drawCompare(f.querySelector('canvas'), 'child', f._e));
}
/* historia: wcześniejsze podejścia do tej samej literki (tylko w tej sesji) — do przesunięcia palcem w prawo obok porównania */
const HIST = {};
function histPush(r, ok) {
  const list = (HIST[G.ch] = HIST[G.ch] || []);
  list.push({ label: lab(G.level), acc: r.acc, ok, scale: G.level.scale || 1, ink: JSON.parse(JSON.stringify(G.ink)), dx: G.dx || 0 });
  if (list.length > 20) list.shift();
}
function renderHist() {
  const box = $('cmp'); box.querySelectorAll('figure.hist').forEach((f) => f.remove());
  const prev = (HIST[G.ch] || []).slice(0, -1).reverse(); // najnowsze poprzednie najbliżej
  box.classList.toggle('has-hist', prev.length > 0);
  prev.forEach((e) => {
    const f = document.createElement('figure'), cv = document.createElement('canvas'), cap = document.createElement('figcaption');
    f.className = 'hist'; f._e = e; cap.textContent = Math.round(e.acc * 100) + '% · ' + e.label; cap.title = e.label;
    f.append(cv, cap); box.append(f);
  });
  box.scrollLeft = 0;
}
function showResult() {
  const r = computeScore(), lose = G.level.mode === 'race' && G.winner === 'spider';
  const ok = !lose && passes(r);
  histPush(r, ok);
  if (ok) {
    store.prog[G.ch] = Math.max(store.prog[G.ch] || 0, G.li + 1);
    const prev = store.best[G.ch] || {};
    store.best[G.ch] = { cups: Math.max(prev.cups || 0, r.cups) };
    save();
  }
  if (lose) { $('resTitle').textContent = 'Pająk był szybszy!'; $('resCups').innerHTML = `<span style="width:58px;height:58px;display:block">${spiderIcon(SPIDER_COLORS[0], true)}</span>`; }
  else {
    $('resTitle').textContent = !ok ? 'Prawie! Spróbuj jeszcze raz' : G.level.mode === 'race' ? 'Wygrana z pająkiem!' : r.cups === 3 ? 'Mistrzowsko!' : r.cups === 2 ? 'Super!' : 'Brawo!';
    $('resCups').innerHTML = [0, 1, 2].map((i) => cupSVG(i < r.cups, 58)).join('');
  }
  $('resCups').setAttribute('aria-label', lose ? 'Pająk wygrał' : `${r.cups} z 3 pucharów`);
  $('resTime').textContent = fmtTime(r.time);
  $('resAcc').textContent = Math.round(r.acc * 100) + '%';
  const tb = $('resTimeBar'), ab = $('resAccBar');
  tb.style.width = Math.round(Math.max(0.04, r.speed) * 100) + '%'; tb.style.background = r.speed > GREEN_SPEED ? C.good : r.speed > 0.33 ? C.warn : C.bad;
  ab.style.width = Math.round(Math.max(0.04, r.acc) * 100) + '%'; ab.style.background = r.acc > GREEN_ACC ? C.good : r.acc > 0.5 ? C.warn : C.bad;
  const notes = [lab(G.level) + '.'];
  if (G.level.mode === 'spider' && G.lifts) notes.push(`Palec oderwał się ${G.lifts} ${G.lifts === 1 ? 'raz' : 'razy'}.`);
  if (!lose && !ok) {
    const miss = [];
    if (r.acc <= GREEN_ACC) miss.push('dokładność');
    if (r.speed <= GREEN_SPEED) miss.push('czas');
    notes.push('Żeby iść dalej, ' + (miss.length > 1 ? 'dokładność i czas muszą' : miss[0] + ' musi') + ' być na zielono.');
  }
  $('resNote').textContent = notes.join(' ');
  const nextLi = G.li + 1, canNext = ok && nextLi < LEVELS.length;
  renderLevels($('resLevels'), canNext ? nextLi : G.li, store.badges[G.ch] ? LEVELS.length : (store.prog[G.ch] || 0));
  $('retryIcon').innerHTML = icon('replay');
  $('retryLabel').textContent = lose ? 'Jeszcze raz wyścig' : 'Jeszcze raz';
  $('retryBtn').classList.toggle('main', !canNext);
  $('nextBtn').hidden = !canNext;
  if (canNext) { $('nextIcon').innerHTML = icon('next'); $('nextLabel').textContent = 'Dalej: ' + lab(LEVELS[nextLi]); $('nextBtn').dataset.li = nextLi; }
  resultEl.hidden = false;
  renderHist();
  drawResultCanvases();
  (canNext ? $('nextBtn') : $('retryBtn')).focus({ preventScroll: true });
}

/* ---------- nagroda: piątka od pająka i odznaka ---------- */
function showReward() {
  store.badges[G.ch] = true; store.prog[G.ch] = LEVELS.length; save();
  const hf = $('hifive');
  hf.innerHTML = bigSpiderSVG(); hf.classList.remove('clap'); hf.disabled = false;
  $('badge').hidden = true; $('rwHome').hidden = true; rewardEl.classList.remove('won');
  $('rwMsg').textContent = 'Przybij piątkę z pająkiem!';
  rewardEl.hidden = false;
}
$('hifive').addEventListener('click', () => {
  const hf = $('hifive'); if (hf.classList.contains('clap')) return;
  audio(); hf.classList.add('clap');
  setTimeout(() => {
    sfx.clap();
    for (let k = 0; k < 28; k++) {
      const s = document.createElement('span'); s.className = 'confetti';
      s.style.background = [C.gold, C.ink, SPIDER_COLORS[1], C['line-base'], C.good][k % 5];
      s.style.setProperty('--dx', (Math.random() * 2 - 1) * 46 + 'vw'); s.style.setProperty('--dy', (Math.random() * 1.4 - 0.9) * 50 + 'vh'); s.style.setProperty('--r', Math.random() * 720 + 'deg');
      rewardEl.appendChild(s); setTimeout(() => s.remove(), 1500);
    }
  }, 300);
  setTimeout(() => {
    sfx.win();
    $('rwMsg').textContent = 'Masz odznakę za ' + thing(G.ch) + ' „' + G.ch + '”!';
    $('badge').innerHTML = badgeSVG(G.ch) + '<small>Odznaka za ' + thing(G.ch) + ' „' + G.ch + '”</small>';
    rewardEl.classList.add('won');
    $('badge').hidden = false; $('rwHome').hidden = false; $('rwHome').focus({ preventScroll: true });
  }, 1000);
});

/* ---------- przyciski ---------- */
function toMenu() { G = null; cancelAnimationFrame(raf); gameEl.hidden = true; resultEl.hidden = true; rewardEl.hidden = true; menuEl.hidden = false; renderMenu(); }
$('settingsBtn').innerHTML = icon('settings');
$('closeSettingsBtn').innerHTML = icon('close');
for (const [id, symbol] of [['fullVersionBtn', 'unlock'], ['parentInfoBtn', 'info'], ['privacyBtn', 'privacy']]) {
  $(id).insertAdjacentHTML('afterbegin', icon(symbol));
}
$('settingsBtn').addEventListener('click', () => $('settingsDialog').showModal());
$('closeSettingsBtn').addEventListener('click', () => $('settingsDialog').close());
$('parentInfoBtn').addEventListener('click', () => $('parentInfoDialog').showModal());
$('closeParentInfoBtn').addEventListener('click', () => $('parentInfoDialog').close());
$('backBtn').innerHTML = icon('back'); $('hintBtn').innerHTML = icon('eye');
$('clearBtn').innerHTML = icon('eraser'); $('doneBtn').innerHTML = icon('check');
$('homeIcon').innerHTML = icon('home'); $('rwHomeIcon').innerHTML = icon('home');
$('backBtn').addEventListener('click', toMenu);
$('homeBtn').addEventListener('click', toMenu);
$('rwHome').addEventListener('click', toMenu);
$('nextBtn').addEventListener('click', () => startLetter(G.ch, +$('nextBtn').dataset.li));
$('retryBtn').addEventListener('click', () => startLetter(G.ch, G.li));
$('hintBtn').addEventListener('click', () => { if (G && G.plan && G.phase !== 'done') G.demoAt = G.clock; });
function renderSound() {
  $('soundMenuBtn').innerHTML = icon(store.muted ? 'soundOff' : 'soundOn', '') + 'Dźwięk: ' + (store.muted ? 'wyłączony' : 'włączony');
  $('soundMenuBtn').setAttribute('aria-pressed', String(!store.muted));
  $('soundMenuBtn').setAttribute('aria-label', store.muted ? 'Dźwięk wyłączony, włącz' : 'Dźwięk włączony, wyłącz');
}
function renderPen() {
  const b = $('penMenuBtn'); if (!b) return;
  b.innerHTML = icon('pencil', '') + 'Tylko rysik' + (store.penOnly ? ': tak' : ': nie');
  b.setAttribute('aria-pressed', String(!!store.penOnly));
  b.setAttribute('aria-label', store.penOnly ? 'Tylko rysik włączony: palec nie pisze po płótnie, wyłącz' : 'Tylko rysik wyłączony: włącz, żeby dłoń nie pisała po płótnie');
}
function togglePen() { store.penOnly = !store.penOnly; store.penSeen = true; save(); renderPen(); }
$('penMenuBtn').addEventListener('click', togglePen);
function toggleSound() { store.muted = !store.muted; save(); renderSound(); if (!store.muted) sfx.pop(); }
$('soundMenuBtn').addEventListener('click', toggleSound);
window.addEventListener('resize', () => { if (G && !resultEl.hidden) drawResultCanvases(); });

// pająk w nagłówku: po kliknięciu śmieje się, kręci i zjeżdża na nitce, a wokół lecą serduszka
(() => {
  const g = document.getElementById('heroSpider'), thread = document.getElementById('heroThread'), fx = document.getElementById('heroFx'), btn = document.getElementById('heroBtn');
  const col = SPIDER_COLORS[0];
  let legs = '';
  [-1, 1].forEach((sd) => [0, 1, 2, 3].forEach((i) => {
    const y = (i - 1.5) * 6.5;
    legs += `<path d="M${sd * 10} ${y} L${sd * 22} ${y - 10 + i * 1.4} L${sd * 30} ${y + 4 + (i - 1.5) * 5}" fill="none" stroke="${col}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }));
  g.innerHTML = legs + `<circle r="17" fill="${col}"/><ellipse cx="-7" cy="-8" rx="5.5" ry="3" fill="rgba(255,255,255,.2)" transform="rotate(-35 -7 -8)"/>
    <circle cx="-10" cy="6" r="2.5" fill="rgba(255,140,170,.6)"/><circle cx="10" cy="6" r="2.5" fill="rgba(255,140,170,.6)"/>
    <g id="heroCalm"><ellipse cx="-6" cy="-2" rx="5" ry="5.6" fill="#fff"/><ellipse cx="6" cy="-2" rx="5" ry="5.6" fill="#fff"/>
      <circle cx="-5.4" cy="0" r="2.6" fill="#1b1530"/><circle cx="6.6" cy="0" r="2.6" fill="#1b1530"/>
      <path d="M-3.5 5.5 Q0 9 3.5 5.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>
    <g id="heroHappy" display="none"><path d="M-11 -1 Q-6 -8 -1 -1M1 -1 Q6 -8 11 -1" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M-5 4.5 Q0 13 5 4.5Z" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></g>`;
  const calm = document.getElementById('heroCalm'), happy = document.getElementById('heroHappy');
  const BASE_Y = 84, NS = 'http://www.w3.org/2000/svg';
  let anim = 0, parts = [];
  const setFace = (h) => { calm.setAttribute('display', h ? 'none' : 'inline'); happy.setAttribute('display', h ? 'inline' : 'none'); };
  const place = (y, rot, sc) => { g.setAttribute('transform', `translate(42 ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${sc.toFixed(3)})`); thread.setAttribute('y2', (y - 20 * sc).toFixed(2)); };
  const spawn = () => {
    const el = document.createElementNS(NS, 'path'), heart = Math.random() < 0.7, c = ['#e8567a', '#f2b01e', '#ff8fab', '#6c9bd8'][Math.floor(Math.random() * 4)];
    el.setAttribute('d', heart ? 'M0 3 C-6 -2 -3.5 -7 0 -3.5 C3.5 -7 6 -2 0 3Z' : 'M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2Z');
    el.setAttribute('fill', c); fx.appendChild(el);
    parts.push({ el, x: 42 + (Math.random() * 2 - 1) * 14, y: BASE_Y - 6, vx: (Math.random() * 2 - 1) * 22, vy: -(30 + Math.random() * 28), life: 1.1, max: 1.1, sc: 0.8 + Math.random() * 0.7 });
  };
  function tick(now) {
    const t = (now - t0) / 1000, D = 1.5;
    // zjazd na nitce i sprężyste wahnięcie
    const drop = t < 0.28 ? 15 * (t / 0.28) * (2 - t / 0.28) : 15 * Math.exp(-(t - 0.28) * 3.2) * Math.cos((t - 0.28) * 11);
    const rot = Math.sin(t * 17) * 12 * Math.exp(-t * 2.4);
    const sc = 1 + 0.13 * Math.sin(Math.min(1, t / 0.4) * Math.PI) * Math.exp(-t * 1.2);
    place(BASE_Y + drop, rot, sc);
    parts.forEach((q) => { q.life -= 1 / 60; q.x += q.vx / 60; q.y += q.vy / 60; q.vy += 38 / 60; q.el.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) scale(${q.sc})`); q.el.setAttribute('opacity', Math.max(0, q.life / q.max).toFixed(2)); });
    parts = parts.filter((q) => { if (q.life > 0) return true; q.el.remove(); return false; });
    if (t < 0.55 && Math.random() < 0.55) spawn();
    if (t < D || parts.length) anim = requestAnimationFrame(tick);
    else { place(BASE_Y, 0, 1); anim = 0; }
    if (t >= D) setFace(false);
  }
  let t0 = 0;
  btn.addEventListener('click', () => {
    audio();
    sfx.pop(); setTimeout(() => sfx.catch(), 120);
    setFace(true);
    cancelAnimationFrame(anim); fx.innerHTML = ''; parts = [];
    t0 = performance.now(); for (let k = 0; k < 4; k++) spawn();
    anim = requestAnimationFrame(tick);
  });
  place(BASE_Y, 0, 1);
})();

renderSound();
renderPen();
renderMenu();
access.addEventListener('change', () => {
  renderMenu();
  if (G && !access.canPlay(G.ch)) toMenu();
});
}
