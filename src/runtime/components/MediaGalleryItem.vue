<script setup lang="ts">
import { keyToPath } from '../shared'

const props = defineProps<{
  assetKey: string
}>()

function onImageError (event: Event) {
  // fetch asset stats
  console.log(props.assetKey, event)

  // show an icon from the mimetype
}
</script>

<template>
  <NuxtLink :key="assetKey" :to="`#${assetKey}`" class="transition-all  hover:scale-150">
    <img
      :src="`${keyToPath(assetKey, true)}?h=300`"
      :title="keyToPath(assetKey)"
      width="100"
      loading="lazy"
      decoding="async"
      draggable="false"
      class="prevent-drag rounded border select-none pointer-events-none border-slate-100 w-[150px] h-[150px] preview bg-white object-scale-down"
      @error.once="onImageError"
    >
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
