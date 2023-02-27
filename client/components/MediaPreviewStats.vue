<script setup lang="ts">
import { inject, computed } from 'vue'
import prettyBytes from 'pretty-bytes'
import { parseISO, formatDistanceToNow } from 'date-fns'

const previewState = inject<any>('previewState')
const hasUpdatedSize = computed(() => previewState.targetWidth !== previewState.stats.dimensions.width || previewState.targetHeight !== previewState.stats.dimensions.height)

// force height to match aspect ratio on width update
// @todo: option to preserve aspect ratio
function onUpdateWidth (value?: number | string) {
  const targetWidth = value ? Math.min(previewState.stats.dimensions.width, Number(value)) : previewState.stats.dimensions.width
  const ratio = previewState.stats.dimensions.height / previewState.stats.dimensions.width

  previewState.targetWidth = targetWidth
  previewState.targetHeight = Math.ceil(targetWidth * ratio)
}

// force width to match aspect ratio on height update
function onUpdateHeight (value?: number | string) {
  const targetHeight = value ? Math.min(previewState.stats.dimensions.height, Number(value)) : previewState.stats.dimensions.height
  const ratio = previewState.stats.dimensions.width / previewState.stats.dimensions.height

  previewState.targetWidth = Math.ceil(targetHeight * ratio)
  previewState.targetHeight = targetHeight
}
</script>

<template>
  <div class="overflow-y-scroll">
    <NSectionBlock
      v-if="previewState.stats"
      icon="carbon:information"
      :text="previewState?.stats?.name"
      :description="previewState?.stats?.mimetype"
      collapse
      open
    >
      <div class="flex flex-col gap-6">
        <NCard class="p-4">
          <div>File status</div>
          <div class="flex justify-between gap-2 text-sm py-2">
            <div>Size: </div>
            <div>{{ prettyBytes(previewState.stats.stat.size) }}</div>
          </div>
          <div x-divider />
          <div class="flex justify-between gap-2 text-sm py-2">
            <div>Created: </div>
            <div>{{ formatDistanceToNow(parseISO(previewState.stats.stat.ctime), { addSuffix: true }) }}</div>
          </div>
          <div x-divider />
          <div class="flex justify-between gap-2 text-sm py-2">
            <div>Updated: </div>
            <div>{{ formatDistanceToNow(parseISO(previewState.stats.stat.mtime), { addSuffix: true }) }}</div>
          </div>
        </NCard>
        <NCard class="p-4">
          <div>Git status</div>
          <div v-if="previewState.stats.git.versions === 0">
            <span class="text-sm italic">This file is not versionned</span>
          </div>
          <template v-else>
            <div class="flex justify-between gap-2 text-sm py-2">
              <div>Version(s): </div>
              <div>{{ previewState.stats.git.versions }}</div>
            </div>
            <div x-divider />
            <div class="flex justify-between gap-2 text-sm py-2">
              <div>Created: </div>
              <div>{{ formatDistanceToNow(parseISO(previewState.stats.git.ctime), { addSuffix: true }) }}</div>
            </div>
            <div x-divider />
            <div class="flex justify-between gap-2 text-sm py-2">
              <div>Updated: </div>
              <div>{{ formatDistanceToNow(parseISO(previewState.stats.git.mtime), { addSuffix: true }) }}</div>
            </div>
          </template>
        </NCard>
        <NCard v-if="previewState.stats?.dimensions" class="p-4">
          <strong class="text-lg font-semibold">Image dimensions</strong>
          <div class="flex justify-between gap-2 text-sm py-2">
            <span>Width: </span>
            <span>{{ previewState.stats.dimensions.width }}px</span>
          </div>
          <div x-divider />
          <div class="flex justify-between gap-2 text-sm py-2">
            <span>Height: </span>
            <span>{{ previewState.stats.dimensions.height }}px</span>
          </div>
          <div x-divider />
          <div class="flex justify-between gap-2 text-sm py-2">
            <span>Aspect: </span>
            <span>{{ previewState.stats.dimensions.aspect }}</span>
          </div>
          <div x-divider />
          <div class="flex justify-between gap-2 text-sm py-2">
            <span>Mode: </span>
            <span>{{ previewState.stats.dimensions.mode }}</span>
          </div>
        </NCard>
      </div>
    </NSectionBlock>

    <NSectionBlock
      icon="carbon:code"
      text="Snippet"
      description="Generate a snippet to use in your project."
      collapse
      open
    >
      <div class="flex flex-col gap-6">
        <div v-if="previewState.stats?.dimensions" class="flex gap-2">
          <div class="flex gap-2">
            <NTextInput
              :model-value="previewState.targetWidth"
              type="number"
              :max="previewState.stats.dimensions.width"
              :min="1"
              @update:model-value="onUpdateWidth"
            />
            <NTextInput
              :model-value="previewState.targetHeight"
              type="number"
              :max="previewState.stats.dimensions.height"
              :min="1"
              @update:model-value="onUpdateHeight"
            />
          </div>
          <NButton
            :disabled="!hasUpdatedSize"
            type="reset"
            @click="() => {
              previewState.targetWidth = previewState.stats.dimensions.width
              previewState.targetHeight = previewState.stats.dimensions.height
            }"
          >
            reset
          </NButton>
          <NSelect v-model="previewState.snippetType">
            <option value="html">
              html
            </option>
            <option v-if="previewState.stats.mimetype === 'image/svg+xml'" value="inline">
              inline
            </option>
            <option value="@nuxt/image">
              @nuxt/image
            </option>
          </NSelect>
        </div>

        <div v-if="previewState.stats?.dimensions" class="flex gap-2">
          <NTextInput v-model="previewState.alt" placeholder="image description (alt)" type="text" />
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

        <pre
          v-if="previewState.snippet"
          class="w-full select-all overflow-auto n-bg-active rounded border n-border-base p-2 text-sm grow"
        >{{ previewState.snippet }}</pre>
      </div>
    </NSectionBlock>
  </div>
</template>

<style scoped>
.preview {
  background-image: repeating-conic-gradient(#f8fafc 0% 25%, #ffffff 0% 50%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.dark .preview {
  background-image: repeating-conic-gradient(#1c1c1c 0% 25%, #151515 0% 50%);
}
</style>
