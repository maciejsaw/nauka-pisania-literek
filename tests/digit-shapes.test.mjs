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
  const outerStroke = points.slice(0, points.findIndex(p => p[1] >= 150));
  assert.ok(Math.min(...outerStroke.map(p => Math.hypot(p[0] - end[0], p[1] - end[1]))) < 1.1);
});

test('6 closes its loop downward, without a final horizontal movement', () => {
  const points = buildLetter(LETTERS['6']).strokes[0].pts;
  const tail = points.slice(-6);
  const dx = tail.at(-1)[0] - tail[0][0];
  const dy = tail.at(-1)[1] - tail[0][1];
  assert.ok(dy > 8, 'the pen must finish moving down');
  assert.ok(Math.abs(dx) < dy * 0.2, 'the final movement must be almost vertical');
});

test('5 top bar ends on the top guideline', () => {
  const end = buildLetter(LETTERS['5']).strokes[1].pts.at(-1);
  assert.ok(Math.abs(end[1]) < 0.01); // Path resampling can omit a tail shorter than 0.01.
});

test('s and ś share an entry shortened by another 25 percent', () => {
  const shape = buildLetter(LETTERS.s);
  const points = shape.strokes[0].pts;
  const start = points[0];
  assert.ok(Math.abs(start[0] - 14.4375) < 0.01, 'start moves right within the original frame');
  assert.equal(start[1], 135.875);
  const original = buildLetter([{ d: LETTERS.s[0].d.replace('M 16.6375 135.875', 'M 2.2 156') }]);
  assert.ok(Math.abs(shape.width - original.width) < 0.05, 'centering must not move the letter body (allow resampling error)');
  assert.deepEqual(points.at(-1), original.strokes[0].pts.at(-1));
  const shortenedLength = Math.hypot(35.2 - 16.6375, 110 - start[1]);
  const previousLength = Math.hypot(35.2 - 10.45, 110 - 144.5);
  assert.ok(Math.abs(shortenedLength / previousLength - 0.75) < 0.001);
  assert.deepEqual(LETTERS['ś'][0], LETTERS.s[0]);
  assert.equal(LETTERS['ś'][1].d, 'M 70.5 56 L 46.5 76.2');
});
