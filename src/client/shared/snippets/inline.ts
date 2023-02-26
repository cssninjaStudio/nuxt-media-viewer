import type { PreviewState } from '../../../../types/preview'

export function generateInlineSvgSnippet (previewState: PreviewState) {
  if (!previewState?.stats?.dimensions || !previewState.stats.source) {
    return ''
  }

  // @todo: use nuxt runtime config
  const targetWidth = Math.min(previewState.stats.dimensions.width, previewState.targetWidth)
  const targetHeight = Math.min(previewState.stats.dimensions.height, previewState.targetHeight)

  // set width/height and alt/aria-hidden
  let snippet = previewState.stats.source.replace(
    '<svg',
    `<svg width="${targetWidth}" height="${targetHeight}" ${previewState.alt ? `alt="${previewState.alt}"` : 'aria-hidden="true" alt=""'}`
  )

  // replace svg colors
  if (Object.keys(previewState.snippetColors).length) {
    Object.entries(previewState.snippetColors)

    for (const [color, value] of Object.entries(previewState.snippetColors)) {
      snippet = snippet.replace(new RegExp(color, 'g'), value)
    }
  }

  return snippet
}
