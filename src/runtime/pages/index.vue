<script setup lang="ts">
import { ref, computed } from 'vue'
// @ts-ignore
import { useRouter, useRoute, useAsyncData, useHead } from '#app'
import { onKeyStroke } from '@vueuse/core'

import MediaGallery from '../components/MediaGallery.vue'
import MediaPreview from '../components/MediaPreview.vue'
import MediaDropPlaceholder from '../components/MediaDropPlaceholder.vue'
import { keyToPath } from '../shared'

// keep track of the current image in hash so we can use the history
const router = useRouter()
const route = useRoute()
const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')

// list available assets
const { data: assets } = useAsyncData(async () => {
  const data = await $fetch<string[]>('/_media-viewer/ls')

  // sort by path/name to keep same order as in file system
  data.sort()

  return data
})

// extract directories/extensions filters
const directoriesKeysPrefix = computed(() => {
  return (assets.value ?? [])
    .map((item) => {
      const parts = item.split(':')
      parts.pop()
      return parts.join(':')
    })
    .reduce((acc, item) => {
      if (item !== 'root:public' && !acc.includes(item)) {
        acc.push(item)
      }
      return acc
    }, [])
    .sort()
})
const extensions = computed(() => {
  return (assets.value ?? [])
    .map((item: string) => {
      const parts = item.split(':')
      const last = parts.pop()
      if (!last?.includes('.')) {
        return ''
      }
      const name = last.split('.')
      const ext = name.pop()

      return ext
    })
    .reduce((acc: string[], item: string) => {
      if (item && !acc.includes(item)) {
        acc.push(item)
      }
      return acc
    }, [])
    .sort()
})

// filter assets by either directory or extension
const filterDirectoryKey = ref('')
const filterExtension = ref('')
const hasFilter = computed(() => Boolean(filterDirectoryKey.value || filterExtension.value))
const assetsKeysFiltered = computed(() => {
  if (!hasFilter.value) {
    return assets.value
  }

  return assets.value
    .filter((item: string) => {
      if (!filterDirectoryKey.value) {
        return true
      }
      return item.startsWith(filterDirectoryKey.value)
    })
    .filter((item: string) => {
      if (!filterExtension.value) {
        return true
      }
      return item.endsWith(filterExtension.value)
    })
})
function resetFilters () {
  filterDirectoryKey.value = ''
  filterExtension.value = ''
}

// keyboard navigation (left/right/close)
const tags = ['input', 'textarea', 'select']
onKeyStroke('Escape', (e) => {
  // only blur if not in input/textarea/select
  if (tags.includes((e.target as Element).tagName.toLowerCase())) {
    (e.target as HTMLInputElement).blur()
    return
  }

  // otherwise, close the modal
  if (route.hash) {
    router.push('/_media-viewer')
  }
})
onKeyStroke('ArrowRight', (e) => {
  // do nothing if in input/textarea/select
  if (tags.includes((e.target as Element).tagName.toLowerCase())) {
    return
  }

  // otherwise, open preview to next image
  if (!assetsKeysFiltered.value?.length) {
    router.push('/_media-viewer')
    return
  }

  if (!selectedAssetKey.value) {
    router.push(`#${assetsKeysFiltered.value[0]}`)
    return
  }

  const index = assetsKeysFiltered.value.indexOf(selectedAssetKey.value)
  const nextIndex = index + 1
  if (nextIndex < assetsKeysFiltered.value.length) {
    router.push(`#${assetsKeysFiltered.value[nextIndex]}`)
    return
  }

  router.push('/_media-viewer')
})
onKeyStroke('ArrowLeft', (e) => {
  // do nothing if in input/textarea/select
  if (tags.includes((e.target as Element).tagName.toLowerCase())) {
    return
  }

  // otherwise, openw preview to previous image
  if (!assetsKeysFiltered.value?.length) {
    router.push('/_media-viewer')
    return
  }

  if (!selectedAssetKey.value) {
    router.push(`#${assetsKeysFiltered.value[assetsKeysFiltered.value.length - 1]}`)
    return
  }

  const index = assetsKeysFiltered.value.indexOf(selectedAssetKey.value)
  const prevIndex = index - 1
  if (prevIndex >= 0) {
    router.push(`#${assetsKeysFiltered.value[prevIndex]}`)
    return
  }

  router.push('/_media-viewer')
})

// add tailwind cdn header
useHead({
  script: [
    {
      src: 'https://cdn.tailwindcss.com'
    }
  ]
})
</script>

<template>
  <div class="p-16 bg-slate-50 min-h-[100vh] relative">
    <!-- assets filters -->
    <form class="pb-16 flex items-center justify-between w-full" @submit.prevent>
      <div class="flex gap-4">
        <select v-model="filterDirectoryKey" class="rounded border border-slate-100 py-1 px-2">
          <option value="">
            /
          </option>
          <option v-for="key in directoriesKeysPrefix" :key="key" :value="key">
            {{ keyToPath(key) }}
          </option>
        </select>
        <select v-model="filterExtension" class="rounded border border-slate-100 py-1 px-2">
          <option value="">
            all
          </option>
          <option v-for="ext in extensions" :key="ext" :value="ext">
            {{ ext }}
          </option>
        </select>
        <button
          v-if="hasFilter"
          type="reset"
          @click.prevent="resetFilters"
        >
          clear
        </button>
      </div>
      <div class="text-slate-400">
        Viewing <span class="text-slate-700">{{ assetsKeysFiltered?.length }}</span>
        of <span class="text-slate-700">{{ assets?.length }}</span>
      </div>
    </form>

    <!-- assets gallery -->
    <MediaGallery :assets-keys="assetsKeysFiltered" />

    <!-- image preview modal -->
    <MediaPreview />

    <!-- upload drag handler -->
    <MediaDropPlaceholder v-if="!selectedAssetKey" />
  </div>
</template>
