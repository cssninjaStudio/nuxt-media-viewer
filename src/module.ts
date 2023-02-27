import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { createResolver, defineNuxtModule, addServerHandler } from '@nuxt/kit'
import { name, version } from '../package.json'
import { setupDevToolsUI } from './devtools'
import type { ModuleOptions } from './options'
import { DEVTOOLS_UI_ROUTE } from './constant'

export { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'mediaViewer'
  },
  defaults: {
    devtools: true,
    installIpxMiddleware: false,
    hasIpx: undefined,
    ipxMiddlewarePrefix: '/_ipx'
  },
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    nuxt.hook('modules:done', () => {
      const hasUserProvidedIPX =
        nuxt.options.serverHandlers.find(
          handler =>
            options.ipxMiddlewarePrefix &&
            handler.route?.startsWith(options.ipxMiddlewarePrefix)
        ) ||
        nuxt.options.devServerHandlers.find(
          handler =>
            options.ipxMiddlewarePrefix &&
            handler.route?.startsWith(options.ipxMiddlewarePrefix)
        )

      nuxt.options.runtimeConfig.mediaViewer = {
        publicRoot: resolver.resolve(nuxt.options.rootDir, 'public'),
        hasIpx:
          options.hasIpx ??
          Boolean(hasUserProvidedIPX || options.installIpxMiddleware),
        ipxMiddlewarePrefix: options.ipxMiddlewarePrefix ?? ''
      }

      if (options.installIpxMiddleware && !hasUserProvidedIPX) {
        // @todo: check if ipx middleware is already installed
        addServerHandler({
          handler: resolve(runtimeDir, 'server/middlewares/ipx')
        })
      }
    })

    // for now only inject viewer on dev mode
    if (nuxt.options.dev) {
      nuxt.options.build.transpile.push(runtimeDir)

      // register server routes to list files and get their stats
      addServerHandler({
        route: `${DEVTOOLS_UI_ROUTE}/ls`,
        handler: resolve(runtimeDir, 'server/routes/ls')
      })
      addServerHandler({
        route: `${DEVTOOLS_UI_ROUTE}/stats`,
        handler: resolve(runtimeDir, 'server/routes/stats')
      })
      addServerHandler({
        route: `${DEVTOOLS_UI_ROUTE}/config`,
        handler: resolve(runtimeDir, 'server/routes/config')
      })

      if (options.devtools) {
        setupDevToolsUI(nuxt, resolver)
      }
    }
  }
})
