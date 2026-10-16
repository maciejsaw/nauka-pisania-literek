// Native store bridge simulation, shared by code activation and ratings.
export async function storeDevice(page, platform, paid = false) {
  await page.addInitScript(({ platform, paid }) => {
    if (platform === 'android') window.androidBridge = {};
    else window.webkit = { messageHandlers: { bridge: {} } };
    window.storeTest = { paid, urls: [], listeners: {}, failOpen: false, offline: false };
    const definitions = { Preferences: ['get', 'set', 'remove'], App: ['addListener', 'removeListener'],
      AppLauncher: ['openUrl'], Purchases: ['configure', 'addCustomerInfoUpdateListener', 'getCustomerInfo', 'getProducts', 'syncPurchases', 'invalidateCustomerInfoCache'] };
    window.Capacitor = {
      PluginHeaders: Object.entries(definitions).map(([name, methods]) => ({ name, methods: methods.map(name => ({ name, rtype: name === 'addListener' || name === 'addCustomerInfoUpdateListener' ? 'callback' : 'promise' })) })),
      nativeCallback: (plugin, method, args, callback) => {
        if (plugin === 'App') (window.storeTest.listeners[args.eventName] ||= []).push(callback);
        return 'test-listener';
      },
      nativePromise: async (plugin, method, args) => {
        if (plugin === 'Preferences') {
          if (method === 'get') return { value: localStorage.getItem(args.key) };
          if (method === 'set') localStorage.setItem(args.key, args.value);
          if (method === 'remove') localStorage.removeItem(args.key);
          return {};
        }
        if (plugin === 'AppLauncher') { window.storeTest.urls.push(args.url); return { completed: !window.storeTest.failOpen }; }
        if (plugin === 'Purchases') {
          if (method === 'syncPurchases' && window.storeTest.offline) throw new Error('offline');
          if (method === 'getCustomerInfo') return { customerInfo: { entitlements: { active: window.storeTest.paid ? { full_version: { isActive: true, productIdentifier: 'full_version' } } : {} } } };
          if (method === 'getProducts') return { products: [] };
        }
        return {};
      },
    };
  }, { platform, paid });
}
