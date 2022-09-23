<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
// @ts-ignore
import { useRouter, useRoute, useAsyncData } from '#app'
import { onKeyStroke } from '@vueuse/core'

const router = useRouter()
const route = useRoute()

const { data } = useAsyncData(async () => {
  const data = await $fetch<string[]>('/_media-viewer/ls')
  return data.sort()
})

function keyToPath (key: string) {
  return key.replace(/:/g, '/').replace('root/public/', '/')
}

const selectedPathKey = ref('')
const selectedExt = ref('')

const hasFilter = computed(() => Boolean(selectedPathKey.value || selectedExt.value))
const selectedAssetKey = computed(() => route.hash ? route.hash.substring(1) : '')

const folderKeys = computed(() => {
  return (data.value ?? [])
    .map((item) => {
      const parts = item.split(':')
      parts.pop()
      return parts.join(':')
    })
    .reduce((acc, item) => {
      if (!acc.includes(item)) {
        acc.push(item)
      }
      return acc
    }, [])
    .sort()
})

const extensions = computed(() => {
  return (data.value ?? [])
    .map((item) => {
      const parts = item.split(':')
      const last = parts.pop()
      if (!last.includes('.')) {
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
    }, [])
    .sort()
})

const filtered = computed(() => {
  if (!hasFilter.value) {
    return data.value
  }

  return data.value
    .filter((item) => {
      if (!selectedPathKey.value) {
        return true
      }
      return item.startsWith(selectedPathKey.value)
    })
    .filter((item) => {
      if (!selectedExt.value) {
        return true
      }
      return item.endsWith(selectedExt.value)
    })
})

watchEffect(() => {
  // @ts-ignore
  if (process.server) {
    return
  }

  if (selectedAssetKey.value) {
    document.documentElement.classList.add('overflow-hidden')
  } else {
    document.documentElement.classList.remove('overflow-hidden')
  }
})

onKeyStroke('Escape', (e) => {
  if ((e.target as Element).tagName === 'INPUT' || (e.target as Element).tagName === 'TEXTAREA' || (e.target as Element).tagName === 'SELECT') {
    (e.target as HTMLInputElement).blur()
    return
  }
  if (route.hash) {
    router.push('/_media-viewer')
  }
})
onKeyStroke('ArrowRight', (e) => {
  if ((e.target as Element).tagName === 'INPUT' || (e.target as Element).tagName === 'TEXTAREA' || (e.target as Element).tagName === 'SELECT') {
    return
  }

  if (!filtered.value?.length) {
    router.push('/_media-viewer')
    return
  }

  if (!selectedAssetKey.value) {
    router.push(`#${filtered.value[0]}`)
    return
  }

  const index = filtered.value.indexOf(selectedAssetKey.value)
  const nextIndex = index + 1
  if (nextIndex < filtered.value.length) {
    router.push(`#${filtered.value[nextIndex]}`)
    return
  }

  router.push('/_media-viewer')
})
onKeyStroke('ArrowLeft', (e) => {
  if ((e.target as Element).tagName === 'INPUT' || (e.target as Element).tagName === 'TEXTAREA' || (e.target as Element).tagName === 'SELECT') {
    return
  }

  if (!filtered.value?.length) {
    router.push('/_media-viewer')
    return
  }

  if (!selectedAssetKey.value) {
    router.push(`#${filtered.value[filtered.value.length - 1]}`)
    return
  }

  const index = filtered.value.indexOf(selectedAssetKey.value)
  const prevIndex = index - 1
  if (prevIndex >= 0) {
    router.push(`#${filtered.value[prevIndex]}`)
    return
  }

  router.push('/_media-viewer')
})
</script>

<template>
  <div class="p-16 bg-slate-50 min-h-[100vh] relative">
    <form class="pb-16 flex items-center justify-between w-full" @submit.prevent>
      <div class="flex gap-4">
        <select v-model="selectedPathKey" class="rounded border border-slate-100 py-1 px-2">
          <option value="">
            /
          </option>
          <option v-for="key in folderKeys" :key="key" :value="key">
            {{ keyToPath(key) }}
          </option>
        </select>
        <select v-model="selectedExt" class="rounded border border-slate-100 py-1 px-2">
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
          @click.prevent="() => {
            selectedPathKey = ''
            selectedExt = ''
          }"
        >
          clear
        </button>
      </div>
      <div class="text-slate-400">
        Viewing <span class="text-slate-700">{{ filtered?.length }}</span> of <span class="text-slate-700">{{ data?.length }}</span>
      </div>
    </form>

    <MediaGallery :images="filtered" />
    <MediaPreview />
    <MediaDropPlaceholder v-if="!selectedAssetKey" />
  </div>
</template>
