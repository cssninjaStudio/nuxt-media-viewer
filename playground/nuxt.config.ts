import MediaViewer from '..'

export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    // '@nuxt/image-edge', @todo
    // @ts-ignore
    MediaViewer
  ],
  mediaViewer: {
    installIpxMiddleware: true
  }
})
