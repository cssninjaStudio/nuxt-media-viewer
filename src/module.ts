import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import {
  defineNuxtModule,
  addServerHandler
} from '@nuxt/kit'
import chalk from 'chalk'
import consola from 'consola'
import sirv from 'sirv'

import { name, version } from '../package.json'

const distDir = resolve(fileURLToPath(import.meta.url), '..')
const runtimeDir = resolve(distDir, 'runtime')
const clientDir = resolve(distDir, 'client')

const ROUTE_PATH = '/__media_viewer__'
const ROUTE_ENTRY = `${ROUTE_PATH}/entry`
const ROUTE_CLIENT = `${ROUTE_PATH}/client`

export default defineNuxtModule({
  meta: {
    name,
    version,
    configKey: 'mediaViewer'
  },
  defaults: {
    installIpxMiddleware: false
  },
  setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const logger = consola.withScope('nuxt:media-viewer')

    if (options.installIpxMiddleware) {
      // @todo: check if ipx middleware is already installed
      addServerHandler({
        handler: resolve(runtimeDir, 'server/middlewares/ipx')
      })
    }

    const clientDirExists = existsSync(clientDir)

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

    // for now only inject viewer on dev mode
    if (nuxt.options.dev) {
      // not sure if we need this if we don't include viewer in build?
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

      nuxt.hook('listen', (_, listener) => {
        logger.info(
          `Media Viewer: ${chalk.underline.yellow(
            `${listener.url}${ROUTE_CLIENT}`
          )}`
        )
      })

      nuxt.options.runtimeConfig.mediaViewer = {
        publicRoot: resolve(nuxt.options.rootDir, 'public')
      }

      nuxt.hook('vite:serverCreated', (server) => {
        // serve the front end in production
        if (clientDirExists) {
          server.middlewares.use(ROUTE_CLIENT, sirv(clientDir, { single: true, dev: true }))
        }
      })
    }
  }
})
