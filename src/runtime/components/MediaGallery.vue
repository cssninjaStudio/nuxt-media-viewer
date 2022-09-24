<script setup lang="ts">
import MediaGalleryItem from './MediaGalleryItem.vue'

const props = defineProps<{
  assetsKeys: string[]
}>()
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <MediaGalleryItem
      v-for="key in props.assetsKeys"
      :asset-key="key"
      :key="key"
    />
  </div>
</template>
