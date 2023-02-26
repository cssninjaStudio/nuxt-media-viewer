<script setup lang="ts">
import { ref, computed, inject, watchEffect, onBeforeUnmount, watch } from 'vue'
// @ts-ignore
import { useRoute } from '#app'
import { keyToPath } from '../shared'
import type { PreviewState } from '../../../types/preview'

const route = useRoute()

const imageRef = ref()
const mode = ref<'scale' | 'real'>('scale')
const config = inject<any>('mediaViewerConfig')

const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')
const selectedAssetSrc = keyToPath(selectedAssetKey, config)

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
  <div class="relative overflow-hidden rounded-l border-slate-100 border-r preview w-7/12 flex items-center justify-center">
    <div v-if="!isImage" class="rounded flex flex-col justify-center border select-none pointer-events-none border-slate-100 w-[150px] h-[150px] bg-white object-scale-down">
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
    <div class="absolute right-6 top-6 flex gap-2">
      <div>
        <button
          type="button"
          class=" text-sm py-1 px-3 rounded-l border-r-0 border border-slate-100 disabled:opacity-60 disabled:cursor-not-allowed active:hover:bg-indigo-400 active:hover:text-white"
          :class="[
            mode === 'scale' && 'bg-indigo-400 text-white',
            mode !== 'scale' && 'bg-white',
          ]"
          :disabled="!isImage"
          @click="mode = 'scale'"
        >
          Overview
        </button>
        <button
          type="button"
          class=" text-sm py-1 px-3 rounded-r bg-white border border-slate-100 disabled:opacity-60 disabled:cursor-not-allowed active:hover:bg-indigo-400 active:hover:text-white"
          :class="[
            mode === 'real' && 'bg-indigo-400 text-white',
            mode !== 'real' && 'bg-white',
          ]"
          :disabled="!isImage"
          @click="mode = 'real'"
        >
          Realtime preview
        </button>
      </div>

      <a
        :href="selectedAssetSrc"
        class=" text-sm py-1 px-3 rounded bg-white border border-slate-100 hover:bg-indigo-400 hover:text-white"
        target="_blank"
      >
        Open in new tab
      </a>
    </div>
  </div>
</template>

<style scoped>
.preview {
  background-image: repeating-conic-gradient(#f8fafc 0% 25%, transparent 0% 50%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
.prevent-drag, .prevent-drag:deep(*) {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
</style>
