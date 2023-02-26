import { type PreviewState } from '../../../../types/preview'

function generateHtmlVectorSnippet (previewState: PreviewState) {
  if (!previewState?.stats?.dimensions) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  const targetWidth = Math.min(previewState.stats.dimensions.width, previewState.targetWidth)
  const targetHeight = Math.min(previewState.stats.dimensions.height, previewState.targetHeight)
  return `<img
    src="${hostname}${previewState.stats.path}"
    width="${targetWidth}"
    height="${targetHeight}"
    loading="lazy"
    ${previewState.alt ? `alt="${previewState.alt}"` : 'aria-hidden="true"\n  alt=""'}
  />`
}
function generateHtmlRasterSnippet (previewState: PreviewState) {
  if (!previewState?.stats?.dimensions) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  const targetWidth = Math.min(previewState.stats.dimensions.width, previewState.targetWidth)
  const targetHeight = Math.min(previewState.stats.dimensions.height, previewState.targetHeight)

  let baseModifier = ''

  if (targetWidth !== previewState.stats.dimensions.width || targetHeight !== previewState.stats.dimensions.height) {
    baseModifier = `width=${targetWidth}&height=${targetHeight}`
  }

  const urls = {
    avif: [
      `${hostname}/_ipx${previewState.stats.path}${baseModifier ? `?${baseModifier}&` : '?'}format=avif`
    ],
    webp: [
      `${hostname}/_ipx${previewState.stats.path}${baseModifier ? `?${baseModifier}&` : '?'}format=webp`
    ],
    src: [
      `${hostname}${baseModifier ? '/_ipx' : ''}${previewState.stats.path}${baseModifier ? `?${baseModifier}` : ''}`
    ]
  }

  if (targetWidth <= previewState.stats.dimensions.width / 2) {
    urls.avif.push(`${hostname}/_ipx${previewState.stats.path}?width=${targetWidth * 2}&height=${targetHeight * 2}&format=avif 2x`)
    urls.webp.push(`${hostname}/_ipx${previewState.stats.path}?width=${targetWidth * 2}&height=${targetHeight * 2}&format=webp 2x`)
    urls.src.push(`${hostname}/_ipx${previewState.stats.path}?width=${targetWidth * 2}&height=${targetHeight * 2}`)
  }

  if (targetWidth <= previewState.stats.dimensions.width / 3) {
    urls.avif.push(`${hostname}/_ipx${previewState.stats.path}?width=${targetWidth * 3}&height=${targetHeight * 3}&format=avif 3x`)
    urls.webp.push(`${hostname}/_ipx${previewState.stats.path}?width=${targetWidth * 3}&height=${targetHeight * 3}&format=webp 3x`)
    urls.src.push(`${hostname}/_ipx${previewState.stats.path}?width=${targetWidth * 3}&height=${targetHeight * 3}`)
  }

  return `<picture>
  <source
    type="image/avif"
    srcset="${urls.avif.join(', ')}"
  />
  <source
    type="image/webp"
    srcset="${urls.webp.join(', ')}"
  />
  <img
    src="${hostname}${baseModifier ? '/_ipx' : ''}${previewState.stats.path}${baseModifier ? `?${baseModifier}` : ''}"${urls.src.length > 1 ? `\n    srcset="${urls.src.join(', ')}"` : ''}
    width="${targetWidth}"
    height="${targetHeight}"
    loading="lazy"
    decoding="async"
    ${previewState.alt ? `alt="${previewState.alt}"` : 'aria-hidden="true"\n    alt=""'}
  />
</picture>`
}
function generateHtmlDownloadSnippet (previewState: PreviewState) {
  if (!previewState?.stats) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  return `<a
  href="${hostname}${previewState.stats.path}"
  download
>
  Download ${previewState.stats.name}
</a>`
}

export function generateHtmlSnippet (previewState: PreviewState) {
  if (!previewState?.stats) {
    return ''
  }

  switch (previewState.stats.mimetype) {
    case 'image/svg+xml':
      return generateHtmlVectorSnippet(previewState)
    case 'image/png':
    case 'image/jpeg':
      return generateHtmlRasterSnippet(previewState)
    default:
      return generateHtmlDownloadSnippet(previewState)
  }
}
