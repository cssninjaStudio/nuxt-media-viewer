// same as https://github.com/unjs/ipx/blob/main/src/middleware.ts
// but work with query params
// initial goal was to not use /_ipx prefix and plug this middleware directly on public folder but seems not possible

import { createIPX } from 'ipx'
import { send, appendHeader } from 'h3'
import qs from 'qs'
import getEtag from 'etag'

// @ts-ignore
const config = useRuntimeConfig()
const dir = config.mediaViewer.publicRoot

const ipx = createIPX({
  dir,
  maxAge: 15552000 // 6 months,
})

// @ts-ignore
export default defineEventHandler(async (event) => {
  if (!event.req.url.startsWith('/_ipx')) {
    return
  }

  const [originalPath, query] = event.req.url.replace('/_ipx', '').split('?')
  const modifiers = qs.parse(query) as Record<string, string>
  const img = ipx(originalPath, modifiers, {})

  if (!modifiers) {
    return
  }

  try {
    const src = await img.src()

    // Caching headers
    if (src.mtime) {
      if (event.req.headers['if-modified-since']) {
        if (new Date(event.req.headers['if-modified-since']) >= src.mtime) {
          event.res.statusCode = 304
          return null
        }
      }
      appendHeader(event, 'Last-Modified', `${+src.mtime}`)
    }
    if (src.maxAge !== undefined) {
      appendHeader(event, 'Cache-Control', `max-age=${+src.maxAge}, public, s-maxage=${+src.maxAge}`)
    }

    // Get converted image
    const { data, format } = await img.data()

    // ETag
    const etag = getEtag(data)
    appendHeader(event, 'ETag', etag)
    if (etag && event.req.headers['if-none-match'] === etag) {
      event.res.statusCode = 304
      return null
    }

    // Mime
    return send(event, data, `image/${format}`)
  } catch (error) {
    const statusCode = parseInt(error.statusCode, 10) || 500
    const statusMessage = error.message ? `IPX Error (${error.message})` : `IPX Error (${statusCode})`
    console.error(statusMessage)

    event.res.statusCode = statusCode
  }
})
