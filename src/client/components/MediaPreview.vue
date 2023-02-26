<script setup lang="ts">
import { computed, reactive, provide, watchEffect, watch } from 'vue'
// @ts-ignore
import { useRoute } from '#app'

import type { PreviewState } from '../../../types/preview'
import { vFocus, generateSnippet } from '../shared'
import MediaPreviewImage from './MediaPreviewImage.vue'
import MediaPreviewStats from './MediaPreviewStats.vue'

// keep track of the current image in hash so we can use the history
const route = useRoute()
const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')

// provide state to childs
const previewState = reactive({
  targetWidth: 0,
  targetHeight: 0,
  stats: undefined,
  snippet: '',
  snippetColors: {},
  snippetType: 'html',
  alt: ''
} as PreviewState)
provide('previewState', previewState)

// reload asset stats (size, dimensions, etc.) when hash changes
watchEffect(async () => {
  if (!selectedAssetKey.value) {
    previewState.stats = undefined
    return
  }

  // @ts-ignore
  previewState.stats = await $fetch(`/__media_viewer__/stats?key=${selectedAssetKey.value}`, {
    baseURL: '/'
  })

  // reset preview state
  previewState.targetWidth = previewState.stats?.dimensions?.width ?? 0
  previewState.targetHeight = previewState.stats?.dimensions?.height ?? 0
  previewState.snippetColors = previewState.stats?.colors?.reduce((acc, color) => {
    acc[color] = color
    return acc
  }, {} as Record<string, string>) ?? {}
  previewState.alt = ''
  previewState.snippetType = 'html'
})

// refresh snippet
watch(previewState, () => {
  previewState.snippet = generateSnippet(previewState)
}, { deep: true, immediate: true })

// prevent gallery scrolling when preview modal is open
watchEffect(() => {
  // @ts-ignore
  if (process.server) {
    return
  }

  if (selectedAssetKey.value) {
    document.documentElement.classList.add('overflow-hidden')
  } else {
    document.documentElement.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <ClientOnly>
    <NuxtLink v-if="selectedAssetKey" to="/" class="fixed inset-0 transition-all hover:backdrop-blur-none backdrop-blur-sm bg-white/30" />
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
