import { resolve } from 'path'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@nuxt/devtools-ui-kit'
  ],
  ssr: false,
  pages: true,
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../../dist/client')
    }
  },
  app: {
    baseURL: '/__media_viewer__/client'
  },
  vite: {
    build: {
      target: 'esnext'
    }
  },
  runtimeConfig: {
    mediaViewer: {
      publicRoot: 'public',
      hasIpx: false,
      ipxMiddlewarePrefix: '/_ipx'
    }
  }
})
