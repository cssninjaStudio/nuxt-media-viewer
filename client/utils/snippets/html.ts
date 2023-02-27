import { type PreviewState } from '../../../types/preview'
import { type MediaPreviewConfig } from '../options'

function generateHtmlVectorSnippet (previewState: PreviewState) {
  if (!previewState?.stats?.dimensions) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  const targetWidth = Math.min(previewState.stats.dimensions.width, previewState.targetWidth)
  const targetHeight = Math.min(previewState.stats.dimensions.height, previewState.targetHeight)
  return [
    '<img',
    `  src="${hostname}${previewState.stats.path}"`,
    `  width="${targetWidth}"`,
    `  height="${targetHeight}"`,
    '  loading="lazy"',
    `  ${previewState.alt ? `alt="${previewState.alt}"` : 'aria-hidden="true"\n  alt=""'}`,
    '/>'
  ].join('\n')
}
function generateHtmlRasterSnippet (previewState: PreviewState, config: MediaPreviewConfig) {
  if (!previewState?.stats?.dimensions) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  const targetWidth = Math.min(previewState.stats.dimensions.width, previewState.targetWidth)
  const targetHeight = Math.min(previewState.stats.dimensions.height, previewState.targetHeight)

  let baseModifier = ''
  let src = ''

  const sources: string[] = []
  const urls = {
    avif: [] as string[],
    webp: [] as string[],
    src: [] as string[]
  }

  if (!config.hasIpx) {
    src = `${hostname}${previewState.stats.path}`
  } else {
    if (targetWidth !== previewState.stats.dimensions.width || targetHeight !== previewState.stats.dimensions.height) {
      baseModifier = `width=${targetWidth}&height=${targetHeight}`
    }

    src = `${hostname}${baseModifier ? config.ipxMiddlewarePrefix : ''}${previewState.stats.path}${baseModifier ? `?${baseModifier}` : ''}`

    urls.avif.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}${baseModifier ? `?${baseModifier}&` : '?'}format=avif`)
    urls.webp.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}${baseModifier ? `?${baseModifier}&` : '?'}format=webp`)
    urls.src.push(`${hostname}${baseModifier ? config.ipxMiddlewarePrefix : ''}${previewState.stats.path}${baseModifier ? `?${baseModifier}` : ''}`)

    if (targetWidth <= previewState.stats.dimensions.width / 2) {
      urls.avif.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}?width=${targetWidth * 2}&height=${targetHeight * 2}&format=avif 2x`)
      urls.webp.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}?width=${targetWidth * 2}&height=${targetHeight * 2}&format=webp 2x`)
      urls.src.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}?width=${targetWidth * 2}&height=${targetHeight * 2}`)
    }

    if (targetWidth <= previewState.stats.dimensions.width / 3) {
      urls.avif.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}?width=${targetWidth * 3}&height=${targetHeight * 3}&format=avif 3x`)
      urls.webp.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}?width=${targetWidth * 3}&height=${targetHeight * 3}&format=webp 3x`)
      urls.src.push(`${hostname}${config.ipxMiddlewarePrefix}${previewState.stats.path}?width=${targetWidth * 3}&height=${targetHeight * 3}`)
    }

    sources.push(...[
      '  <source',
      '    type="image/avif"',
      `    srcset="${urls.avif.join(', ')}"`,
      '  />',
      '  <source',
      '    type="image/webp"',
      `    srcset="${urls.webp.join(', ')}"`,
      '  />'
    ])
  }

  return [
    '<picture>',
    ...sources,
    '  <img',
    `    src="${src}"`,
    ...(urls.src.length > 1 ? [`    srcset="${urls.src.join(', ')}"`] : []),
    `    width="${targetWidth}"`,
    `    height="${targetHeight}"`,
    '    loading="lazy"',
    '    decoding="async"',
    `${previewState.alt ? `    alt="${previewState.alt}"` : '    aria-hidden="true"\n    alt=""'}`,
    '  />',
    '</picture>'
  ].join('\n')
}
function generateHtmlDownloadSnippet (previewState: PreviewState) {
  if (!previewState?.stats) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  return [
    '<a',
    `  href="${hostname}${previewState.stats.path}"`,
    '  download,',
    '>',
    `  Download ${previewState.stats.name}`,
    '</a>'
  ].join('\n')
}

export function generateHtmlSnippet (previewState: PreviewState, config: MediaPreviewConfig) {
  if (!previewState?.stats) {
    return ''
  }

  switch (previewState.stats.mimetype) {
    case 'image/svg+xml':
      return generateHtmlVectorSnippet(previewState)
    case 'image/png':
    case 'image/jpeg':
      return generateHtmlRasterSnippet(previewState, config)
    default:
      return generateHtmlDownloadSnippet(previewState)
  }
}
