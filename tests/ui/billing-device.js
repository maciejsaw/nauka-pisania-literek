// Native store bridge simulation; no network requests or real charges.
export async function billingDevice(page, options = {}) {
  await page.addInitScript(options => {
    if (options.platform === 'android') window.androidBridge = {};
    else window.webkit = { messageHandlers: { bridge: {} } };
    const state = window.billingTest = {
      paid: options.paid || localStorage.getItem('billing-test-paid') === 'true',
      calls: [], listeners: {}, holdConfirmation: false, noProduct: !!options.noProduct,
    };
    let sequence = 0;
    const info = () => ({
      requestDate: new Date(Date.UTC(2026, 9, 16) + ++sequence * 1000).toISOString(),
      entitlements: { active: state.paid ? { full_version: { isActive: true, productIdentifier: 'full_version', verification: 'VERIFIED' } } : {} },
    });
    const setPaid = value => { state.paid = value; localStorage.setItem('billing-test-paid', String(value)); };
    state.notify = value => { setPaid(value); state.customerListener(info()); };
    const definitions = {
      Preferences: ['get', 'set', 'remove'], App: ['addListener', 'removeListener'],
      Purchases: ['configure', 'addCustomerInfoUpdateListener', 'getCustomerInfo', 'getProducts', 'purchaseStoreProduct', 'restorePurchases', 'invalidateCustomerInfoCache'],
    };
    window.Capacitor = {
      PluginHeaders: Object.entries(definitions).map(([name, methods]) => ({ name, methods: methods.map(name => ({ name, rtype: name === 'addListener' || name === 'addCustomerInfoUpdateListener' ? 'callback' : 'promise' })) })),
      nativeCallback: (plugin, method, args, callback) => {
        if (plugin === 'App') (state.listeners[args.eventName] ||= []).push(callback);
        else if (method === 'addCustomerInfoUpdateListener') state.customerListener = typeof args === 'function' ? args : callback;
        return 'billing-listener';
      },
      nativePromise: async (plugin, method) => {
        if (plugin === 'Preferences') return { value: null };
        if (plugin !== 'Purchases') return {};
        state.calls.push(method);
        if (method === 'getProducts') return { products: state.noProduct ? [] : [{ identifier: 'full_version', priceString: options.currency === 'USD' ? '$0.99' : '4,99 zł', currencyCode: options.currency || 'PLN' }] };
        if (method === 'getCustomerInfo') {
          if (state.holdConfirmation) return new Promise(resolve => { state.finishConfirmation = paid => { setPaid(paid); resolve({ customerInfo: info() }); }; });
          return { customerInfo: info() };
        }
        if (method === 'purchaseStoreProduct') return new Promise((resolve, reject) => {
          state.finishPurchase = outcome => {
            if (['cancel', 'pending', 'error'].includes(outcome)) {
              reject({ code: { cancel: '1', pending: '20', error: '10' }[outcome], userCancelled: outcome === 'cancel' });
            } else { setPaid(outcome === 'paid'); resolve({ customerInfo: info() }); }
          };
        });
        if (method === 'restorePurchases') return { customerInfo: info() };
        return {};
      },
    };
  }, options);
}
export async function confirmParent(page) {
  await page.locator('#parentAnswer').fill('1985');
  await page.locator('#parentForm button').click();
}
export async function openOffer(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'wielka literka Ę, pełna wersja', exact: true }).click();
}
