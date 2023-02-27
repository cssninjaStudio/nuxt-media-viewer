import type { PreviewState } from '../../../types/preview'
import type { MediaPreviewConfig } from '../options'
import { generateHtmlSnippet } from './html'
import { generateInlineSvgSnippet } from './inline'
import { generateNuxtImageSnippet } from './nuxt-image'

export function generateSnippet (previewState: PreviewState, config: MediaPreviewConfig) {
  // @ts-ignore
  if (!previewState.stats) {
    return ''
  }

  switch (previewState.snippetType) {
    case 'inline':
      return generateInlineSvgSnippet(previewState)
    case '@nuxt/image':
      return generateNuxtImageSnippet(previewState, config)
    case 'html':
    default:
      return generateHtmlSnippet(previewState, config)
  }
}
