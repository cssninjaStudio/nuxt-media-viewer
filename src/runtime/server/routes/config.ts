import { defineEventHandler } from 'h3'
// @ts-ignore
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
  return useRuntimeConfig().mediaViewer ?? {}
})
