
// Parsowanie ścieżek (M, L, C, Q – współrzędne bezwzględne), próbkowanie i pochylenie.
const SLANT = 0;
function parsePath(d) {
  const tok = d.trim().split(/[\s,]+/);
  const segs = []; let i = 0, cx = 0, cy = 0, cmd = null;
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/^[MLCQ]$/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M') { cx = num(); cy = num(); cmd = 'L'; segs.push({ t: 'M', p: [cx, cy] }); }
    else if (cmd === 'L') { const x = num(), y = num(); segs.push({ t: 'L', p: [[cx, cy], [x, y]] }); cx = x; cy = y; }
    else if (cmd === 'C') { const a = [num(), num()], b = [num(), num()], e = [num(), num()]; segs.push({ t: 'C', p: [[cx, cy], a, b, e] }); cx = e[0]; cy = e[1]; }
    else if (cmd === 'Q') { const a = [num(), num()], e = [num(), num()]; segs.push({ t: 'Q', p: [[cx, cy], a, e] }); cx = e[0]; cy = e[1]; }
    else throw new Error('bad path ' + d);
  }
  return segs;
}
function shear(x, y) { return [x + (200 - y) * SLANT, y]; }
function densePoints(d) {
  const pts = [];
  for (const s of parsePath(d)) {
    if (s.t === 'M') { if (!pts.length) pts.push(s.p.slice()); continue; }
    const n = s.t === 'L' ? Math.max(2, Math.ceil(Math.hypot(s.p[1][0] - s.p[0][0], s.p[1][1] - s.p[0][1]) / 2)) : 48;
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t; let x, y;
      if (s.t === 'L') { x = u * s.p[0][0] + t * s.p[1][0]; y = u * s.p[0][1] + t * s.p[1][1]; }
      else if (s.t === 'Q') { x = u * u * s.p[0][0] + 2 * u * t * s.p[1][0] + t * t * s.p[2][0]; y = u * u * s.p[0][1] + 2 * u * t * s.p[1][1] + t * t * s.p[2][1]; }
      else { const [p0, p1, p2, p3] = s.p; x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0]; y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]; }
      pts.push([x, y]);
    }
  }
  return pts.map(([x, y]) => shear(x, y));
}
// Równomierne próbkowanie co `step` jednostek; zwraca {pts, len, cum}
function resample(pts, step = 2) {
  const out = [pts[0].slice()], cum = [0]; let acc = 0, carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const seg = Math.hypot(bx - ax, by - ay); if (seg === 0) continue;
    let pos = step - carry;
    while (pos <= seg) { const t = pos / seg; out.push([ax + (bx - ax) * t, ay + (by - ay) * t]); acc += step; cum.push(acc); pos += step; }
    carry = seg - (pos - step);
  }
  const last = pts[pts.length - 1], pl = out[out.length - 1];
  const tail = Math.hypot(last[0] - pl[0], last[1] - pl[1]);
  if (tail > 0.01) { out.push(last.slice()); acc += tail; cum.push(acc); }
  return { pts: out, cum, len: acc };
}
function buildLetter(strokes) {
  const built = strokes.map((s) => {
    if (s.dot) { const p = shear(s.dot[0], s.dot[1]); return { dot: true, name: s.name, pts: [p], cum: [0], len: 0 }; }
    return Object.assign(resample(densePoints(s.d), 2), { name: s.name });
  });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  built.forEach((b) => b.pts.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }));
  // Keep the original horizontal frame when only a leading stroke is shortened.
  // Otherwise centering the narrower shape also moves the unchanged letter body.
  for (const stroke of strokes) {
    if (Number.isFinite(stroke.layoutMinX)) minX = Math.min(minX, stroke.layoutMinX);
  }
  built.forEach((b) => b.pts.forEach((p) => { p[0] -= minX; }));
  return { strokes: built, width: maxX - minX, minY, maxY };
}

export { buildLetter, resample };
