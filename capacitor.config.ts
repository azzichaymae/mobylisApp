import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mobylis.app',
  appName: 'mobylisApp',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
};

export default config;
