import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brickfall.game',
  appName: 'Brick Fall',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
