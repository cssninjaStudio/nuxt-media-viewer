import { defineEventHandler } from 'h3'
// @ts-ignore
// eslint-disable-next-line import/named
import { useStorage } from '#imports'

export default defineEventHandler(async () => {
  const storage = useStorage()
  const keys = await storage.getKeys('root:public')

  // sort by path/name to keep same order as in file system
  keys.sort()

  return keys
})
