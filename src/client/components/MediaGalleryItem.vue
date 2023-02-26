<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { keyToPath } from '../shared'
import type { AssetStats } from '../../../types/preview'

const props = defineProps<{
  assetKey: string
}>()

const isImage = ref(true)
const fileStat = ref<AssetStats>()
const config = inject<any>('mediaViewerConfig')
const src = keyToPath(props.assetKey, config)

onMounted(() => {
  // check if image loads, the @error.once seems to be cached
  // @todo: use IntersectionObserver to lazy load
  const image = new Image()
  image.onerror = async () => {
    image.onerror = null
    // @ts-ignore
    fileStat.value = await $fetch(`/__media_viewer__/stats?key=${props.assetKey}`, {
      baseURL: '/'
    })
    isImage.value = false
  }
  image.src = src.value
})
</script>

<template>
  <NuxtLink :key="props.assetKey" :to="`#${props.assetKey}`" class="transition-all prevent-drag hover:scale-150">
    <img
      v-if="isImage"
      :src="`${src}?h=300`"
      :title="src"
      width="100"
      loading="lazy"
      decoding="async"
      draggable="false"
      class="prevent-drag rounded border select-none pointer-events-none border-slate-100 w-[150px] h-[150px] preview bg-white object-scale-down"
    >
    <div v-else class="rounded flex flex-col justify-center border select-none pointer-events-none border-slate-100 w-[150px] h-[150px] preview bg-white object-scale-down">
      <div class="truncate w-full text-center">
        {{ fileStat?.name }}
      </div>
      <div class="truncate w-full text-center text-sm text-slate-400">
        {{ fileStat?.mimetype }}
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.preview {
  background-image: repeating-conic-gradient(#f8fafc 0% 25%, transparent 0% 50%);
  background-size: 15px 15px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
.prevent-drag {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
</style>
