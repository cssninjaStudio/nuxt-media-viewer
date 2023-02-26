import type { PreviewState } from '../../../../types/preview'

function generateNuxtImageVectorSnippet (previewState: PreviewState) {
  if (!previewState.stats?.dimensions) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  const targetWidth = Math.min(previewState.stats.dimensions.width, previewState.targetWidth)
  const targetHeight = Math.min(previewState.stats.dimensions.height, previewState.targetHeight)

  return `<nuxt-img
  src="${hostname}${previewState.stats.path}"
  width="${targetWidth}"
  height="${targetHeight}"
  loading="lazy"
  ${previewState.alt ? `alt="${previewState.alt}"` : 'aria-hidden="true"\n  alt=""'}
/>`
}

function generateNuxtImageRasterSnippet (previewState: PreviewState) {
  if (!previewState.stats?.dimensions) {
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
      `${hostname}/_ipx${previewState.stats.path}${baseModifier ? `?${baseModifier}` : ''}`
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

  return `<nuxt-picture
src="${hostname}/_ipx${previewState.stats.path}${baseModifier ? `?${baseModifier}` : ''}"${urls.src.length > 1 ? `\n    srcset="${urls.src.join(', ')}"` : ''}
width="${targetWidth}"
height="${targetHeight}"
loading="lazy"
decoding="async"
${previewState.alt ? `alt="${previewState.alt}"` : 'aria-hidden="true"\n  alt=""'}
/>`
}

export function generateNuxtImageSnippet (previewState: PreviewState) {
  if (!previewState.stats) {
    return ''
  }

  // @todo: use nuxt runtime config
  const hostname = `${document.location.protocol}//${document.location.host}`

  switch (previewState.stats.mimetype) {
    case 'image/svg+xml':
      return generateNuxtImageVectorSnippet(previewState)
    case 'image/png':
    case 'image/jpeg':
      return generateNuxtImageRasterSnippet(previewState)
    default:
      return `<a
  href="${hostname}${previewState.stats.path}"
  download
>
  Download ${previewState.stats.name}
</a>`
  }
}
