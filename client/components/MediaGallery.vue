<script setup lang="ts">
import MediaGalleryItem from './MediaGalleryItem.vue'

const props = defineProps<{
  assetsKeys: string[]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <MediaGalleryItem
      v-for="key in props.assetsKeys"
      :key="key"
      :asset-key="key"
    />
  </div>
</template>
