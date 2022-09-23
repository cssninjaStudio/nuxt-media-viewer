export default defineEventHandler(async () => {
  const storage = useStorage()
  const keys = await storage.getKeys('root:public')

  return keys
})
