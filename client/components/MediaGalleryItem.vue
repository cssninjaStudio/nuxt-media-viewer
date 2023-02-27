<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#app'
import type { AssetStats } from '../../types/preview'
import { useKeyPath } from '~/composables/keys'

const props = defineProps<{
  assetKey: string;
}>()

const isImage = ref(true)
const fileStat = ref<AssetStats>()
const mvBaseURL = useRuntimeConfig().public.mvBaseURL
const config = inject<any>('mediaViewerConfig')
const src = useKeyPath(props.assetKey, config)

onMounted(() => {
  // check if image loads, the @error.once seems to be cached
  // @todo: use IntersectionObserver to lazy load
  const image = new Image()
  image.onerror = async () => {
    image.onerror = null
    // @ts-ignore
    fileStat.value = await $fetch(
      `/__media_viewer/stats?key=${props.assetKey}`,
      {
        baseURL: mvBaseURL
      }
    )
    isImage.value = false
  }
  image.src = src.value
})
</script>

<template>
  <NuxtLink
    :key="props.assetKey"
    :to="`#${props.assetKey}`"
    class="transition-all prevent-drag hover:scale-110"
  >
    <img
      v-if="isImage"
      :src="`${src}?h=300`"
      :title="src"
      width="100"
      loading="lazy"
      decoding="async"
      draggable="false"
      class="prevent-drag rounded border select-none pointer-events-none n-border-base w-[150px] h-[150px] preview bg-white object-scale-down"
    >
    <div
      v-else
      class="rounded flex flex-col justify-center border select-none pointer-events-none n-border-base w-[150px] h-[150px] preview bg-white object-scale-down"
    >
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
  background-image: repeating-conic-gradient(
    #f8fafc 0% 25%,
    #ffffff 0% 50%
  );
  background-size: 15px 15px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
.dark .preview {
  background-image: repeating-conic-gradient(#1c1c1c 0% 25%, #151515 0% 50%);
}

.prevent-drag {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
</style>
