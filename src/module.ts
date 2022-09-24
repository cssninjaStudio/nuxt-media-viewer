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
      // @todo: check if ipx middleware is already installed (and same format?)
      addServerHandler({
        handler: resolve(runtimeDir, 'server/middlewares/ipx')
      })
    }

    // for now only inject viewer on dev mode
    if (nuxt.options.dev) {
      // not sure if we need this if we don't include viewer in build?
      nuxt.options.build.transpile.push(runtimeDir)

      // @todo: remove this dependency (onKeyStroke)
      await installModule('@vueuse/nuxt')

      // register server routes to list files and get their stats
      addServerHandler({
        route: '/_media-viewer/ls',
        handler: resolve(runtimeDir, 'server/dev-routes/ls')
      })
      addServerHandler({
        route: '/_media-viewer/stats',
        handler: resolve(runtimeDir, 'server/dev-routes/stats')
      })

      // inject viewer in current app router
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

      // seems not to be needed as we can use root:public prefix
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
