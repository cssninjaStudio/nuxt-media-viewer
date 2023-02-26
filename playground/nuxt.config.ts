import MediaViewer from '..'

export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    // @ts-ignore
    MediaViewer
  ],
  mediaViewer: {
    installIpxMiddleware: true
  }
})
