# @cssninja/nuxt-media-viewer

A media viewer for public assets in Nuxt.js

## Features

- Preview assets with their meta data
- Generate snippets for responsive/retina images
- Generate and customize inline SVG from your assets


## Installation

1. Add `@cssninja/nuxt-media-viewer` dependency to your project
```bash
# Using pnpm
pnpm add -D @cssninja/nuxt-media-viewer

# Using yarn
pnpm add -D @cssninja/nuxt-media-viewer

# Using npm
npm install --save-dev @cssninja/nuxt-media-viewer
```

2. Add `@cssninja/nuxt-media-viewer` to the `modules` section of `nuxt.config.js`

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@cssninja/nuxt-media-viewer'
  ]
})
```

3. Go to the media viewer page and start previewing your assets at [http://localhost:3000/__media_viewer/client/](http://localhost:3000/__media_viewer/client/) or open the devtools and click on the `Media Viewer` tab.


## Configuration

```ts
type ModuleOptions = {
  /**
   * @default false
   */
  installIpxMiddleware?: boolean

  /**
   * @default '/_ipx'
   */
  ipxMiddlewarePrefix?: string
}
```

```ts
export default defineNuxtConfig({
  modules: [
    '@cssninja/nuxt-media-viewer'
  ],
  mediaViewer: {
    installIpxMiddleware: false,
    ipxMiddlewarePrefix:  '/_ipx',
  }
})
```

## Development

- Run `npm run dev` to develop the client UI.
- Use `npm run dev:playground` to start [playground](./playground) in development mode.
