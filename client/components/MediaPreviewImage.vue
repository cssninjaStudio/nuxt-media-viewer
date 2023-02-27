<script setup lang="ts">
import { ref, computed, inject, watchEffect, onBeforeUnmount, watch } from 'vue'
// @ts-ignore
import { useRoute } from '#app'
import type { PreviewState } from '../../types/preview'
import { useKeyPath } from '~~/composables/keys'

const route = useRoute()

const imageRef = ref()
const mode = ref<'scale' | 'real'>('scale')
const config = inject<any>('mediaViewerConfig')

const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')
const selectedAssetSrc = useKeyPath(selectedAssetKey, config)

const previewState = inject<PreviewState>('previewState')
const isImage = computed(() => previewState?.stats?.mimetype?.startsWith('image/'))

const dragging = ref(false)
const offsetX = ref(0)
const offsetY = ref(0)
const initialX = ref(0)
const initialY = ref(0)

function onMousedown (e: MouseEvent) {
  dragging.value = true
  initialX.value = e.offsetX
  initialY.value = e.offsetY
  // e.target.style.setProperty('cursor', 'grabbing', 'important')
  document.addEventListener('mousemove', onMousemove)
  document.addEventListener('mouseup', onMouseup)
}

function onMousemove (e: MouseEvent) {
  if (!e.screenX && !e.screenY) { return } // don't move if mouse is out of the screen
  if (!imageRef.value) { return }

  offsetX.value = e.clientX - initialX.value - 128 // 128 = mx-32 (magin present on X axis on MediaPreview container)
  offsetY.value = e.clientY - initialY.value - 96 // 96 = my-24 (magin present on Y axis on on MediaPreview container)
}

function onMouseup (e: MouseEvent) {
  dragging.value = false
  // e.target.style.removeProperty('cursor')
  document.removeEventListener('mousemove', onMousemove)
  document.removeEventListener('mouseup', onMouseup)
}

watchEffect(() => {
  imageRef.value?.addEventListener('mousedown', onMousedown)
})

onBeforeUnmount(() => {
  imageRef.value?.removeEventListener('mousedown', onMousedown)
})

watch(mode, () => {
  initialX.value = 0
  initialY.value = 0
  offsetX.value = 0
  offsetY.value = 0
})
</script>

<template>
  <div class="relative overflow-hidden rounded-l n-border-base border-r preview flex items-center justify-center">
    <div v-if="!isImage" class="rounded flex flex-col justify-center border select-none pointer-events-none n-border-base w-[150px] h-[150px] n-bg-base object-scale-down">
      <div class="truncate w-full text-center">
        {{ previewState?.stats?.name }}
      </div>
      <div class="truncate w-full text-center text-sm text-slate-400">
        {{ previewState?.stats?.mimetype }}
      </div>
    </div>
    <span
      v-else-if="mode === 'real'"
      ref="imageRef"
      class="prevent-drag block absolute max-w-none origin-top-left hover:cursor-grab active:cursor-grabbing"
      tabindex="0"
      :style="{
        left: `${offsetX}px`,
        top: `${offsetY}px`,
        width: `${previewState?.targetWidth ?? 0}px`,
        height: `${previewState?.targetHeight ?? 0}px`,
      }"
      v-html="previewState?.snippet"
    />
    <img
      v-else
      :src="selectedAssetSrc"
      class="prevent-drag block object-scale-down w-full max-w-full max-h-full"
      tabindex="0"
    >
    <div class="absolute left-4 right-4 top-4 flex justify-between gap-2">
      <NButton
        to="/"
        icon="carbon:arrow-left"
        class="n-bg-base"
      >
        <span>Back</span>
      </NButton>
      <div>
        <NButton
          :class="[
            mode === 'scale' ? 'bg-primary' : 'n-bg-base',
          ]"
          class="border-r-0 rounded-r-none"
          :disabled="!isImage"
          @click="mode = 'scale'"
        >
          Overview
        </NButton>
        <NButton
          :class="[
            mode === 'real' ? 'bg-primary' : 'n-bg-base',
          ]"
          class="border-l-0 rounded-l-none"
          :disabled="!isImage"
          @click="mode = 'real'"
        >
          Real-size preview
        </NButton>
      </div>

      <NButton
        :to="selectedAssetSrc"
        target="_blank"
        class="n-bg-base"
      >
        Open in new tab
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.preview {
  background-image: repeating-conic-gradient(#f8fafc 0% 25%, transparent 0% 50%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
.dark .preview {
  background-image: repeating-conic-gradient(#1c1c1c 0% 25%, #151515 0% 50%);
}
.prevent-drag, .prevent-drag:deep(*) {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
</style>
