import { resolve } from 'path'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@nuxt/devtools-ui-kit'
  ],
  ssr: false,
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client')
    }
  },
  app: {
    baseURL: '/__media_viewer/client'
  },
  vite: {
    build: {
      target: 'esnext'
    }
  },
  runtimeConfig: {
    public: {
      mvBaseURL: '/' // NUXT_PUBLIC_MV_BASE_URL
    },
    mediaViewer: {
      publicRoot: 'public',
      hasIpx: false,
      ipxMiddlewarePrefix: '/_ipx'
    }
  }
})
