<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
const isDropping = ref(false)

let dragCount = 0
function onDragEnter (e) {
  console.log('onDragEnter', e?.dataTransfer?.files?.length, e?.dataTransfer?.items?.length)
  dragCount += 1
  if (dragCount === 1) {
    isDropping.value = true
  }
}
function onDragLeave (e) {
  console.log('onDragLeave', e?.dataTransfer?.files?.length, e?.dataTransfer?.items?.length)
  dragCount -= 1
  if (dragCount === 0) {
    isDropping.value = false
  }
}
function onDragOver (e) {
  // console.log('onDragOver', e?.dataTransfer?.files?.length)
  e.preventDefault()
}
function onDrop (e) {
  console.log('onDragLeave', e?.dataTransfer?.files?.length, e?.dataTransfer?.items?.length)
  e.preventDefault()
  isDropping.value = false
  dragCount = 0

  if (e.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...e.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile()
        console.log(`… file[${i}].name = ${file.name}`, file)
      }
    })
  } else {
    // Use DataTransfer interface to access the file(s)
    [...e.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`, file)
    })
  }
}

onMounted(() => {
  document.documentElement.addEventListener('dragenter', onDragEnter, false)
  document.documentElement.addEventListener('dragleave', onDragLeave, false)
  document.documentElement.addEventListener('dragover', onDragOver, false)
  document.documentElement.addEventListener('drop', onDrop)
})

onBeforeUnmount(() => {
  document.documentElement.removeEventListener('dragenter', onDragEnter)
  document.documentElement.removeEventListener('dragleave', onDragLeave)
  document.documentElement.removeEventListener('dragover', onDragOver)
  document.documentElement.removeEventListener('drop', onDrop)
})
</script>

<template>
  <div>
    <div v-if="isDropping" class="fixed inset-0 transition-all hover:backdrop-blur-none backdrop-blur-sm bg-white/30" />
    <div v-show="isDropping" class="fixed inset-0 my-24 mx-32">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-0 opacity-0"
        enter-to-class="transform scale-1 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-1 opacity-100"
        leave-to-class="transform scale-0 opacity-0"
      >
        <div v-if="isDropping" class="h-full flex-1 flex items-center justify-center">
          <div class="rounded border border-slate-100 drop-shadow-sm flex bg-white items-center justify-center w-[500px] h-[230px] mx-auto">
            <div class="text-2xl">
              Drop your files
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
