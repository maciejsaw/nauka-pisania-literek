import test from 'node:test';
import assert from 'node:assert/strict';
import { paywallPrice } from '../src/paywall-price.js';
test('uses actual PLN store price, including future price changes', () => {
  const result = paywallPrice({ currencyCode: 'PLN', priceString: '7,99 zł' });
  assert.equal(result.price, '7,99 zł jednorazowo');
  assert.equal(result.note, '');
});
test('TestFlight foreign metadata keeps the approved Polish offer', () => {
  for (const currencyCode of ['USD', 'EUR']) {
    const result = paywallPrice({ currencyCode, priceString: '$0.99' });
    assert.equal(result.price, '4,99 zł jednorazowo');
    assert.equal(result.note, '');
  }
});
