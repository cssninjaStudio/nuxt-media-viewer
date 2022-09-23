import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addServerHandler, installModule, createResolver, addComponentsDir } from '@nuxt/kit'
import chalk from 'chalk'
import consola from 'consola'

export default defineNuxtModule({
  meta: {
    name: 'media-viewer'
  },
  defaults: {
    installIpxMiddleware: true
  },
  async setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const logger = consola.withScope('nuxt:media-viewer')

    if (options.installIpxMiddleware) {
      addServerHandler({
        handler: resolve(runtimeDir, 'server/middlewares/ipx')
      })
    }

    if (nuxt.options.dev) {
      nuxt.options.build.transpile.push(runtimeDir)
      await installModule('@nuxtjs/tailwindcss', {
        config: {
          content: [
            resolve(runtimeDir, './components', '**/*.vue'),
            resolve(runtimeDir, './pages', '**/*.vue')
          ]
        }
      })
      await installModule('@vueuse/nuxt')
      addServerHandler({
        route: '/_media-viewer/ls',
        handler: resolve(runtimeDir, 'server/dev-routes/ls')
      })
      addServerHandler({
        route: '/_media-viewer/stats',
        handler: resolve(runtimeDir, 'server/dev-routes/stats')
      })
      addComponentsDir({
        path: resolve(runtimeDir, 'components'),
        isAsync: true
      })

      nuxt.hook('pages:extend', (pages) => {
        pages.push({
          name: 'module:media-viewer',
          path: '/_media-viewer',
          file: resolve(runtimeDir, 'pages/index.vue'),
          children: []
        })
      })

      nuxt.options.runtimeConfig.mediaViewer = {
        publicRoot: resolve(nuxt.options.rootDir, 'public')
      }

      // nuxt.hook('nitro:config', (config) => {
      //   console.log('nitro:config', config)
      //   config.storage = {
      //     '/public/': {
      //       driver: 'fs',
      //       base: './public'
      //     }
      //   }
      // })

      nuxt.hook('listen', (_, listener) => {
        logger.info(`Media Viewer: ${chalk.underline.yellow(`${listener.url}_media-viewer/`)}`)
      })

      // console.log(createResolver(import.meta.url).resolve('viewer'))
      // const viewerNuxtApp = await loadNuxt({
      //   rootDir: createResolver(import.meta.url).resolve('viewer'),
      //   dev: true,
      //   ready: false,
      //   name: 'viewer'
      // })
      // await viewerNuxtApp.ready()
      // addDevServerHandler({route: '/_viewer',  handler: viewerNuxtApp.server?.app })
    }
  }
})
