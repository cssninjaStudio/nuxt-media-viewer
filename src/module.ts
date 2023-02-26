import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import {
  defineNuxtModule,
  addServerHandler
} from '@nuxt/kit'
import { joinURL } from 'ufo'
import c from 'picocolors'
import consola from 'consola'
import sirv from 'sirv'

import { name, version } from '../package.json'

const distDir = resolve(fileURLToPath(import.meta.url), '..')
const clientDir = resolve(distDir, 'client')

const ROUTE_PATH = '/__media_viewer__'
const ROUTE_CLIENT = `${ROUTE_PATH}/client`

type ModuleOptions = {
  /**
   * @default false
   */
  installIpxMiddleware?: boolean

  /**
   * @default undefined
   */
  hasIpx?: boolean

  /**
   * @default '/_ipx'
   */
  ipxMiddlewarePrefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'mediaViewer'
  },
  defaults: <ModuleOptions>{
    installIpxMiddleware: false,
    hasIpx: undefined,
    ipxMiddlewarePrefix: '/_ipx'
  },
  setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const logger = consola.withScope('nuxt:media-viewer')

    nuxt.hook('modules:done', () => {
      const hasUserProvidedIPX =
        nuxt.options.serverHandlers.find(handler => options.ipxMiddlewarePrefix && handler.route?.startsWith(options.ipxMiddlewarePrefix)) ||
        nuxt.options.devServerHandlers.find(handler => options.ipxMiddlewarePrefix && handler.route?.startsWith(options.ipxMiddlewarePrefix))

      nuxt.options.runtimeConfig.mediaViewer = {
        publicRoot: resolve(nuxt.options.rootDir, 'public'),
        hasIpx: options.hasIpx ?? Boolean(hasUserProvidedIPX || options.installIpxMiddleware),
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
        route: `${ROUTE_PATH}/ls`,
        handler: resolve(runtimeDir, 'server/dev-routes/ls')
      })
      addServerHandler({
        route: `${ROUTE_PATH}/stats`,
        handler: resolve(runtimeDir, 'server/dev-routes/stats')
      })
      addServerHandler({
        route: `${ROUTE_PATH}/config`,
        handler: resolve(runtimeDir, 'server/dev-routes/config')
      })

      nuxt.hook('listen', (_, listener) => {
        logger.info(
          `Media Viewer: ${c.yellow(
            `${joinURL(listener.url, ROUTE_CLIENT)}`
          )}`
        )
      })

      const clientDirExists = existsSync(clientDir)
      nuxt.hook('vite:serverCreated', (server) => {
        // serve the front end in production
        if (clientDirExists) {
          server.middlewares.use(ROUTE_CLIENT, sirv(clientDir, { single: true, dev: true }))
        }
      })

      // @ts-expect-error - conditionally added by @nuxt/devtools if installed
      nuxt.hook('devtools:customTabs', (tabs) => {
        tabs.push({
          // unique identifier
          name: 'nuxt-media-viewer',
          // title to display in the tab
          title: 'Media Viewer',
          // any icon from Iconify, or a URL to an image
          icon: 'carbon:image',
          // iframe view
          view: {
            type: 'iframe',
            src: ROUTE_CLIENT
          }
        })
      })
    }
  }
})
