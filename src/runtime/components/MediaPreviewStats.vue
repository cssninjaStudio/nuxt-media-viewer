<script setup lang="ts">
import { inject } from 'vue'
import prettyBytes from 'pretty-bytes'
import { parseISO, formatDistanceToNow } from 'date-fns'

const props = defineProps<{
  selectedAssetKey: string
}>()

const previewState = inject<any>('previewState')

function onUpdateWidth (event) {
  const targetWidth = event.target.value ? Math.min(previewState.stats.dimensions.width, event.target.value) : previewState.stats.dimensions.width
  const ratio = previewState.stats.dimensions.height / previewState.stats.dimensions.width

  previewState.targetWidth = targetWidth
  previewState.targetHeight = Math.ceil(targetWidth * ratio)
  event.target.value = targetWidth
}
function onUpdateHeight (event) {
  const targetHeight = event.target.value ? Math.min(previewState.stats.dimensions.height, event.target.value) : previewState.stats.dimensions.height
  const ratio = previewState.stats.dimensions.width / previewState.stats.dimensions.height

  previewState.targetWidth = Math.ceil(targetHeight * ratio)
  previewState.targetHeight = targetHeight
  event.target.value = targetHeight
}
</script>

<template>
  <div class="rounded-r bg-slate-50 p-6 flex flex-col gap-4  w-5/12">
    <div v-if="previewState.stats">
      <div>
        <strong class="text-2xl font-semibold">{{ previewState.stats.name }}</strong>
        <span class="m-2 p-1 text-xs px-2 bg-slate-200 rounded">{{ previewState.stats.mimetype }}</span>
      </div>
      <div class="text-md leading-0">
        <span class="text-slate-400">/public</span>
        <span>{{ previewState.stats.directory }}</span>
        <a href="#" class="text-indigo-400 ml-2">move</a>
        <a href="#" class="text-red-500 ml-2">delete</a>
      </div>
    </div>

    <div v-if="previewState.stats" class="flex">
      <div class="grow">
        <strong class="text-lg font-semibold">File status</strong>
        <div class="text-sm">
          <span>Size: </span>
          <span>{{ prettyBytes(previewState.stats.stat.size) }}</span>
        </div>
        <div class="text-sm">
          <span>Created: </span>
          <span>{{ formatDistanceToNow(parseISO(previewState.stats.stat.ctime), { addSuffix: true }) }}</span>
        </div>
        <div class="text-sm">
          <span>Updated: </span>
          <span>{{ formatDistanceToNow(parseISO(previewState.stats.stat.mtime), { addSuffix: true }) }}</span>
        </div>
      </div>
      <div class="grow">
        <strong class="text-lg font-semibold">Git status</strong>
        <div v-if="previewState.stats.git.versions === 0">
          <span class="text-sm italic">This file is not versionned</span>
        </div>
        <template v-else>
          <div class="text-sm">
            <span>Version(s): </span>
            <span>{{ previewState.stats.git.versions }}</span>
          </div>
          <div class="text-sm">
            <span>Created: </span>
            <span>{{ formatDistanceToNow(parseISO(previewState.stats.git.ctime), { addSuffix: true }) }}</span>
          </div>
          <div class="text-sm">
            <span>Updated: </span>
            <span>{{ formatDistanceToNow(parseISO(previewState.stats.git.mtime), { addSuffix: true }) }}</span>
          </div>
        </template>
      </div>
      <div v-if="previewState.stats?.dimensions" class="grow">
        <strong class="text-lg font-semibold">Image dimensions</strong>
        <div class="text-sm">
          <span>Width: </span>
          <span>{{ previewState.stats.dimensions.width }}px</span>
        </div>
        <div class="text-sm">
          <span>Height: </span>
          <span>{{ previewState.stats.dimensions.height }}px</span>
        </div>
        <div class="text-sm">
          <span>Aspect: </span>
          <span>{{ previewState.stats.dimensions.aspect }}</span>
        </div>
        <div class="text-sm">
          <span>Mode: </span>
          <span>{{ previewState.stats.dimensions.mode }}</span>
        </div>
      </div>
    </div>

    <div v-if="previewState.stats?.dimensions" class="flex gap-2">
      <input
        class="rounded py-1 px-2 border border-slate-200"
        type="number"
        :value="previewState.targetWidth"
        :max="previewState.stats.dimensions.width"
        :min="1"
        @change="onUpdateWidth"
      >
      <input
        class="rounded py-1 px-2 border border-slate-200"
        type="number"
        :value="previewState.targetHeight"
        :max="previewState.stats.dimensions.height"
        :min="1"
        @change="onUpdateHeight"
      >

      <button
        v-if="previewState.targetWidth !== previewState.stats.dimensions.width || previewState.targetHeight !== previewState.stats.dimensions.height"
        type="reset"
        class="rounded py-1 px-2 border border-slate-200"
        @click="() => {
          previewState.targetWidth = previewState.stats.dimensions.width
          previewState.targetHeight = previewState.stats.dimensions.height
        }"
      >
        reset
      </button>
      <div class="grow" />
      <select v-model="previewState.snippetType" class="rounded py-1 px-2 border border-slate-200 leading-3">
        <option value="html">
          html
        </option>
        <option v-if="previewState.stats.mimetype === 'image/svg+xml'" value="inline">
          inline
        </option>
        <option value="@nuxt/image">
          @nuxt/image
        </option>
      </select>
    </div>

    <div v-if="previewState.stats?.dimensions" class="flex gap-2">
      <input v-model="previewState.alt" placeholder="image description (alt)" class="rounded py-1 px-2 border border-slate-200 grow" type="text">
    </div>

    <div v-if="previewState.snippetType === 'inline' && Object.keys(previewState.snippetColors)?.length" class="flex flex-wrap gap-2">
      <label
        v-for="base in Object.keys(previewState.snippetColors)"
        :key="base"
        class="w-6 h-6 rounded cursor-pointer border border-white hover:drop-shadow-md focus-within:drop-shadow-md"
        :style="{ backgroundColor: previewState.snippetColors[base] }"
        :title="previewState.snippetColors[base]"
      >
        <input v-model="previewState.snippetColors[base]" type="color" class="invisible">
      </label>
    </div>

    <!-- <pre class="w-full overflow-auto bg-white rounded max-h-[200px] border border-slate-300 p-2">{{previewState.stats}}</pre> -->
    <pre
      v-if="previewState.snippet"
      class="w-full select-all overflow-auto bg-white rounded border border-slate-200 p-2 text-sm grow"
    >{{ previewState.snippet }}</pre>
  </div>
</template>

<style scoped>
.preview {
  background-image: repeating-conic-gradient(#f8fafc 0% 25%, transparent 0% 50%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
</style>
