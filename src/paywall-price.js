// TestFlight can return USD metadata while the payment sheet uses PLN.
// A Polish reference price must never be presented as a converted store price.
export function paywallPrice(product, store) {
  if (product.currencyCode && product.currencyCode !== 'PLN') {
    return {
      price: '4,99 zł w polskim sklepie',
      note: `Cenę dla Twojego konta pokaże ${store} przed potwierdzeniem.`,
    };
  }
  return {
    price: `${product.priceString} — jednorazowo`,
    note: '',
  };
}
