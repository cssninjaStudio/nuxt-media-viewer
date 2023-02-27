import { existsSync } from 'fs'
import { Nuxt } from 'nuxt/schema'
import { Resolver } from '@nuxt/kit'

import { DEVTOOLS_UI_ROUTE, DEVTOOLS_UI_LOCAL_PORT } from './constant'

export function setupDevToolsUI (
  nuxt: Nuxt,
  resolver: Resolver
) {
  const clientPath = resolver.resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  if (isProductionBuild) {
    // Serve production-built client (used when package is published)
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(
        DEVTOOLS_UI_ROUTE + '/client',
        sirv(clientPath, { dev: true, single: true })
      )
    })
  } else {
    // In local development, start a separate Nuxt Server and proxy to serve the client
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}
      config.server.proxy[DEVTOOLS_UI_ROUTE + '/client'] = {
        target:
          'http://localhost:' + DEVTOOLS_UI_LOCAL_PORT + DEVTOOLS_UI_ROUTE,
        changeOrigin: true,
        followRedirects: true,
        rewrite: path => path.replace(DEVTOOLS_UI_ROUTE, '')
      }
    })
  }

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
        src: `${DEVTOOLS_UI_ROUTE}/client`
      }
    })
  })
}
