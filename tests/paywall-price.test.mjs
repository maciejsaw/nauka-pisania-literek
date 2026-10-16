import test from 'node:test';
import assert from 'node:assert/strict';
import { paywallPrice } from '../src/paywall-price.js';
test('uses actual PLN store price, including future price changes', () => {
  const result = paywallPrice({ currencyCode: 'PLN', priceString: '7,99 zł' }, 'App Store');
  assert.equal(result.price, '7,99 zł — jednorazowo');
  assert.equal(result.note, '');
});
test('foreign metadata shows an explicit Polish reference, never a false currency conversion', () => {
  for (const currencyCode of ['USD', 'EUR']) {
    const result = paywallPrice({ currencyCode, priceString: '$0.99' }, 'App Store');
    assert.equal(result.price, '4,99 zł w polskim sklepie');
    assert.match(result.note, /Cenę dla Twojego konta pokaże App Store przed potwierdzeniem/);
  }
});
