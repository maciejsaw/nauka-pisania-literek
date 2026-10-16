import { buildLetter } from '../../src/geometry.js';
import { LETTERS } from '../../src/letters.js';

export const PROGRESS_KEY = 'pajak-dwulinia-v3';

export async function openExercise(page, letter, level = 0) {
  // Seed only previously earned progress for later-level scenarios, never game state.
  if (level) await page.addInitScript(({ key, letter, level }) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({ prog: { [letter]: level } }));
    }
  }, { key: PROGRESS_KEY, letter, level });
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const size = letter === letter.toUpperCase() ? 'wielka' : 'mała';
  const label = /^[0-9]$/.test(letter) ? `cyferka ${letter}` : `${size} literka ${letter}`;
  await page.getByRole('button', { name: label, exact: true }).click();
  await page.clock.runFor(32);
}

export async function writeLetter(page, letter, { scale = 1, race = false, tick = 20 } = {}) {
  // Letter paths provide pointer input only. Completion, scoring, rendering and
  // saving run through the real app; no calls into its private game functions.
  const shape = buildLetter(LETTERS[letter]);
  const box = await page.locator('#cv').boundingBox();
  const top = Math.min(0, shape.minY - 16), bottom = Math.max(300, shape.maxY + 12);
  const band = bottom - top, height = box.height - 20, width = race ? box.width / 2 : box.width;
  const s = Math.min(height / band, (width - (race ? 22 : 40)) / (shape.width + (race ? 26 : 60)), 3.4)
    * (scale < 1 ? scale : 0.8);
  const ox = box.x + (width - shape.width * s) / 2;
  const oy = box.y + 10 + (height - band * s) / 2 - top * s;
  for (const stroke of shape.strokes) {
    const points = stroke.pts.filter((_, i) => i % 2 === 0 || i === stroke.pts.length - 1);
    await page.mouse.move(ox + points[0][0] * s, oy + points[0][1] * s);
    await page.mouse.down();
    await page.clock.runFor(tick);
    for (const [x, y] of points.slice(1)) {
      await page.mouse.move(ox + x * s, oy + y * s);
      await page.clock.runFor(tick);
    }
    await page.mouse.up();
    await page.clock.runFor(tick);
  }
}
