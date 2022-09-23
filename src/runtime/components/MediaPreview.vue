<script setup lang="ts">
import { computed, reactive, provide, watchEffect, watch, type Directive } from 'vue'
// @ts-ignore
import { useRoute } from '#app'

const route = useRoute()

const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')
// const selectedAssetStats = ref<any>()

const previewState = reactive({
  targetWidth: 0,
  targetHeight: 0,
  stats: undefined,
  snippet: '',
  snippetColors: {},
  snippetType: 'html',
  alt: ''
} as any)
provide('previewState', previewState)

function generateNuxtImageSnippet () {
  const hostname = `${document.location.protocol}//${document.location.host}`

  switch (previewState.stats.mimetype) {
    case 'image/svg+xml': {
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
    case 'image/png':
    case 'image/jpeg': {
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
    default:
      return `<a
  href="${hostname}${previewState.stats.path}"
  download
>
  Download ${previewState.stats.name}
</a>`
  }
}

function generateHtmlSnippet () {
  const hostname = `${document.location.protocol}//${document.location.host}`

  switch (previewState.stats.mimetype) {
    case 'image/svg+xml': {
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
    case 'image/png':
    case 'image/jpeg': {
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
    default:
      return `<a
  href="${hostname}${previewState.stats.path}"
  download
>
  Download ${previewState.stats.name}
</a>`
  }
}

function generateInlineSnippet () {
  const targetWidth = Math.min(previewState.stats.dimensions.width, previewState.targetWidth)
  const targetHeight = Math.min(previewState.stats.dimensions.height, previewState.targetHeight)

  let snippet = previewState.stats.source.replace(
    '<svg',
    `<svg width="${targetWidth}" height="${targetHeight}" ${previewState.alt ? `alt="${previewState.alt}"` : 'aria-hidden="true" alt=""'}`
  )

  if (Object.keys(previewState.snippetColors).length) {
    Object.entries(previewState.snippetColors)

    for (const [color, value] of Object.entries(previewState.snippetColors)) {
      snippet = snippet.replace(new RegExp(color, 'g'), value)
    }
  }

  return snippet
}

function generateSnippet () {
  // @ts-ignore
  if (!previewState.stats || process.server) {
    return ''
  }

  switch (previewState.snippetType) {
    case 'inline':
      return generateInlineSnippet()
    case '@nuxt/image':
      return generateNuxtImageSnippet()
    case 'html':
    default:
      return generateHtmlSnippet()
  }
}

const vFocus: Directive = {
  mounted: el => el.focus(),
  updated: el => el.focus(),
  getSSRProps: () => ({})
}

watchEffect(async () => {
  if (!selectedAssetKey.value) {
    previewState.stats = undefined
    return
  }

  previewState.stats = await $fetch(`/_media-viewer/stats?key=${selectedAssetKey.value}`)

  previewState.targetWidth = previewState.stats?.dimensions?.width
  previewState.targetHeight = previewState.stats?.dimensions?.height
  previewState.snippetColors = previewState.stats?.colors?.reduce((acc, color) => {
    acc[color] = color
    return acc
  }, {})
  previewState.alt = ''
  previewState.snippetType = 'html'
})

watch(previewState, (next, prev) => {
  previewState.snippet = generateSnippet()
}, { deep: true, immediate: true })
</script>

<template>
  <ClientOnly>
    <NuxtLink v-if="selectedAssetKey" to="/_media-viewer" class="fixed inset-0 transition-all hover:backdrop-blur-none backdrop-blur-sm bg-white/30" />
    <div v-show="selectedAssetKey" class="fixed inset-0 my-24 mx-32">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-0 opacity-0"
        enter-to-class="transform scale-1 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-1 opacity-100"
        leave-to-class="transform scale-0 opacity-0"
      >
        <div v-if="selectedAssetKey" v-focus tabindex="0" class="rounded border border-slate-100 drop-shadow-sm flex flex-1 relative bg-white h-full items-center justify-center">
          <div class="rounded flex flex-1 h-full w-full">
            <MediaPreviewImage :selected-asset-key="selectedAssetKey" />
            <MediaPreviewStats :selected-asset-key="selectedAssetKey" />
          </div>
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>
