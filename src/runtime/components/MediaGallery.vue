<script setup lang="ts">
const props = defineProps<{
  images: string[]
}>()

function keyToPath (key: string) {
  return key.replace(/:/g, '/').replace('root/public/', '/')
}
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <NuxtLink v-for="key in props.images" :key="key" :to="`#${key}`" class="transition-all  hover:scale-150">
      <img
        :src="`/_ipx${keyToPath(key)}?h=300`"
        :title="keyToPath(key)"
        width="100"
        loading="lazy"
        decoding="async"
        draggable="false"
        class="prevent-drag rounded border select-none pointer-events-none border-slate-100 w-[150px] h-[150px] preview bg-white object-scale-down"
      >
    </NuxtLink>
  </div>
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
