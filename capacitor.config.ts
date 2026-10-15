import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.maciejsawicki.pajaczek',
  appName: 'Pajączek',
  webDir: 'dist',
  zoomEnabled: false,
  ios: { contentInset: 'never' },
  android: { allowMixedContent: false },
};
export default config;
