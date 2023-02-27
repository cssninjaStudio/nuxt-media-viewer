import type { PreviewState } from '../../../types/preview'
import { generateHtmlSnippet } from './html'
import { generateInlineSvgSnippet } from './inline'
import { generateNuxtImageSnippet } from './nuxt-image'

export function generateSnippet (previewState: PreviewState) {
  // @ts-ignore
  if (!previewState.stats || process.server) {
    return ''
  }

  switch (previewState.snippetType) {
    case 'inline':
      return generateInlineSvgSnippet(previewState)
    case '@nuxt/image':
      return generateNuxtImageSnippet(previewState)
    case 'html':
    default:
      return generateHtmlSnippet(previewState)
  }
}
