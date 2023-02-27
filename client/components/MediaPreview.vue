<script setup lang="ts">
import { computed, reactive, inject, provide, watchEffect, watch } from 'vue'
// @ts-ignore
import { Pane, Splitpanes } from 'splitpanes'
// @ts-ignore
import { useRuntimeConfig, useRoute } from '#app'

import type { PreviewState } from '../../types/preview'
import MediaPreviewImage from './MediaPreviewImage.vue'
import MediaPreviewStats from './MediaPreviewStats.vue'
import { generateSnippet } from '~~/utils/snippets'
import { vFocus } from '~~/utils/directives'

// keep track of the current image in hash so we can use the history
const route = useRoute()
const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')
const mvBaseURL = useRuntimeConfig().public.mvBaseURL
const config = inject<any>('mediaViewerConfig')

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
  previewState.stats = await $fetch(`/__media_viewer/stats?key=${selectedAssetKey.value}`, {
    baseURL: mvBaseURL
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
watch([previewState, config], () => {
  previewState.snippet = generateSnippet(previewState, config.value)
}, { deep: true, immediate: true })

// prevent gallery scrolling when preview modal is open
watchEffect(() => {
  if (selectedAssetKey.value) {
    document.documentElement.classList.add('overflow-hidden')
  } else {
    document.documentElement.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <div>
    <div v-show="selectedAssetKey" class="fixed inset-0">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-0 opacity-0"
        enter-to-class="transform scale-1 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-1 opacity-100"
        leave-to-class="transform scale-0 opacity-0"
      >
        <div v-if="selectedAssetKey" v-focus tabindex="0" class="border outline-none n-border-base drop-shadow-sm flex flex-1 relative n-bg-base h-full items-center justify-center">
          <Splitpanes class="flex flex-1 h-full w-full">
            <Pane class="border border-r border-base of-auto" min-size="30">
              <MediaPreviewImage class="h-full" :selected-asset-key="selectedAssetKey" />
            </Pane>
            <Pane size="30" min-size="30">
              <MediaPreviewStats class="h-full" :selected-asset-key="selectedAssetKey" />
            </Pane>
          </Splitpanes>
        </div>
      </Transition>
    </div>
  </div>
</template>
