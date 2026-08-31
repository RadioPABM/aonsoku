import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.radiopabm.client',
  appName: 'radioPABM',
  // The web build the native project ships, produced by `pnpm build`
  webDir: 'dist',
  android: {
    // The renderer is served from https://localhost, so requests to the
    // Subsonic server are cross origin. Routing them through the native HTTP
    // layer avoids depending on the server sending CORS headers.
    allowMixedContent: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
}

export default config
