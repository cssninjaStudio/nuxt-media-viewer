<script setup lang="ts">
import { provide, ref, computed } from 'vue'
// @ts-ignore
import { useRouter, useRoute, useFetch, useRuntimeConfig } from '#app'
import { onKeyStroke } from '@vueuse/core'

import MediaGallery from '../components/MediaGallery.vue'
import MediaPreview from '../components/MediaPreview.vue'
import MediaDropPlaceholder from '../components/MediaDropPlaceholder.vue'
import { keyPath, useKeyPath } from '~~/composables/keys'

// keep track of the current image in hash so we can use the history
const router = useRouter()
const route = useRoute()
const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')
const mvBaseURL = useRuntimeConfig().public.mvBaseURL

// list available assets
const { data: assets } = useFetch<string[]>('/__media_viewer/ls', {
  baseURL: mvBaseURL,
  default: () => [] as string[]
})

const { data: config } = useFetch<any>('/__media_viewer/config', {
  baseURL: mvBaseURL,
  default: () => ({})
})

provide('mediaViewerConfig', config)

// extract directories/extensions filters
const directoriesKeysPrefix = computed(() => {
  return (assets?.value ?? [])
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
    }, [] as string[])
    .sort()
})

const extensions = computed(() => {
  return (assets?.value ?? [])
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
    .reduce((acc, item) => {
      if (item && !acc.includes(item)) {
        acc.push(item)
      }
      return acc
    }, [] as string[])
    .sort()
})

// filter assets by either directory or extension
const filterDirectoryKey = ref('')
const filterExtension = ref('')
const hasFilter = computed(() => Boolean(filterDirectoryKey.value || filterExtension.value))
const assetsKeysFiltered = computed(() => {
  if (!hasFilter.value) {
    return assets?.value ?? []
  }

  return (assets?.value ?? [])
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
    router.push('/')
  }
})
onKeyStroke('ArrowRight', (e) => {
  // do nothing if in input/textarea/select
  if (tags.includes((e.target as Element).tagName.toLowerCase())) {
    return
  }

  // otherwise, open preview to next image
  if (!assetsKeysFiltered.value?.length) {
    router.push('/')
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

  router.push('/')
})
onKeyStroke('ArrowLeft', (e) => {
  // do nothing if in input/textarea/select
  if (tags.includes((e.target as Element).tagName.toLowerCase())) {
    return
  }

  // otherwise, openw preview to previous image
  if (!assetsKeysFiltered.value?.length) {
    router.push('/')
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

  router.push('/')
})
</script>

<template>
  <div class="p-4 n-bg-base min-h-[100vh] relative">
    <!-- assets filters -->
    <form class="pb-4 flex items-center justify-between w-full" @submit.prevent>
      <div class="flex gap-4">
        <NSelect v-model="filterDirectoryKey">
          <option value="">
            {{ useKeyPath('/').value }}
          </option>
          <option v-for="key in directoriesKeysPrefix" :key="key" :value="key">
            {{ useKeyPath(key).value }}
          </option>
        </NSelect>
        <NSelect v-model="filterExtension">
          <option value="">
            all
          </option>
          <option v-for="ext in extensions" :key="ext" :value="ext">
            {{ ext }}
          </option>
        </NSelect>
        <NButton v-if="hasFilter" type="reset" @click.prevent="resetFilters">
          clear
        </NButton>
      </div>
      <div class="n-header-upper flex gap-2">
        <div class="op50">
          Use <kbd>&larr;</kbd> and <kbd>&rarr;</kbd> to navigate
        </div>
        <div>
          Viewing <span class="op50">{{ assetsKeysFiltered?.length }}</span>
          of <span class="op50">{{ assets?.length }}</span>
        </div>
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
