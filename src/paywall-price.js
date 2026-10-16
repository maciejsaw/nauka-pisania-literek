// Approved Polish offer copy. TestFlight can return USD metadata for a PLN sheet.
// Keep real PLN price changes; the configured Polish fallback is not an FX conversion.
export function paywallPrice(product) {
  return {
    price: `${product.currencyCode === 'PLN' && product.priceString ? product.priceString : '4,99 zł'} jednorazowo`,
    note: '',
  };
}
