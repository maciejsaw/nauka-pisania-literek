import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLetter } from '../src/geometry.js';
import { LETTERS } from '../src/letters.js';

test('5 descends to the middle guideline before turning into its bowl', () => {
  const five = buildLetter(LETTERS['5']);
  const points = five.strokes[0].pts;
  const turningPoint = points.findIndex((p, i) => i > 0 && p[1] < points[i - 1][1]);
  assert.ok(turningPoint > 0);
  assert.ok(Math.abs(points[turningPoint - 1][1] - 100) < 1);
  assert.equal(five.strokes.length, 2); // Top bar remains a separate movement.
});

test('6 flows downward past the middle guideline without an inward notch', () => {
  const points = buildLetter(LETTERS['6']).strokes[0].pts;
  const firstDescent = points.slice(0, points.findIndex(p => p[1] >= 130) + 1).filter(p => p[1] >= 60);
  for (let i = 1; i < firstDescent.length; i++) {
    assert.ok(firstDescent[i][0] <= firstDescent[i - 1][0], 'left edge must not bend back to the right');
    assert.ok(firstDescent[i][1] > firstDescent[i - 1][1], 'movement must continue downward');
  }
  // The final stroke closes on the smooth outer stroke, without leaving a gap.
  const end = points.at(-1);
  assert.ok(Math.min(...firstDescent.map(p => Math.hypot(p[0] - end[0], p[1] - end[1]))) < 1.1);
});
