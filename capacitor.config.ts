import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartavr.financemonitor',
  appName: 'SmartAvr',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
