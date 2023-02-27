<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
const isDropping = ref(false)

// drag file over app handlers, to show drop placeholder
// we need to keep track of how deep the drag is because it raises on each child elements
let dragCount = 0
function onDragenter (e: DragEvent) {
  dragCount += 1
  if (dragCount === 1) {
    isDropping.value = true
  }
}
function onDragleave (e: DragEvent) {
  dragCount -= 1
  if (dragCount === 0) {
    isDropping.value = false
  }
}
function onDragover (e: DragEvent) {
  // prevent file from being opened in new browser tab
  e.preventDefault()
}
function onDrop (event: DragEvent) {
  event.preventDefault()

  isDropping.value = false
  dragCount = 0

  // how handle file upload?
  if (event.dataTransfer?.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...event.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile()
        console.log(`… file[${i}].name = ${file?.name}`, file)
      }
    })
  } else if (event.dataTransfer?.files) {
    // Use DataTransfer interface to access the file(s)
    [...event.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`, file)
    })
  }
}

// register drag events
onMounted(() => {
  document.documentElement.addEventListener('dragenter', onDragenter, false)
  document.documentElement.addEventListener('dragleave', onDragleave, false)
  document.documentElement.addEventListener('dragover', onDragover, false)
  document.documentElement.addEventListener('drop', onDrop)
})

onBeforeUnmount(() => {
  document.documentElement.removeEventListener('dragenter', onDragenter)
  document.documentElement.removeEventListener('dragleave', onDragleave)
  document.documentElement.removeEventListener('dragover', onDragover)
  document.documentElement.removeEventListener('drop', onDrop)
})
</script>

<template>
  <div>
    <div v-if="isDropping" class="fixed inset-0 transition-all hover:backdrop-blur-none backdrop-blur-sm bg-base/30" />
    <div v-show="isDropping" class="fixed inset-0">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-0 opacity-0"
        enter-to-class="transform scale-1 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-1 opacity-100"
        leave-to-class="transform scale-0 opacity-0"
      >
        <div v-if="isDropping" class="h-full flex-1 flex items-center justify-center">
          <div class="rounded border n-border-base drop-shadow-sm flex bg-base items-center justify-center w-[500px] h-[230px] mx-auto">
            <div class="text-2xl">
              Drop your files
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
