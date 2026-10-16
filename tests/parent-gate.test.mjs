import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdultYear } from '../src/parent-gate.js';

test('parent gate accepts adult years, rejects child years and malformed input', () => {
  for (const value of ['1985', ' 2000 ', '2008', '1906']) assert.equal(isAdultYear(value, 2026), true, value);
  for (const value of ['', '2019', '2009', '2026', '2030', '0000', '1905', '85', '19850', '19e2', '1985.0', 'rok 1985']) {
    assert.equal(isAdultYear(value, 2026), false, value);
  }
  assert.equal(isAdultYear('2009', 2027), true);
});
