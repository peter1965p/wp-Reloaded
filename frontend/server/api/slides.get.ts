// Server-seitiger Proxy zur WordPress-REST-API (siehe posts.get.ts)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  return $fetch(`${config.wpApiBase}/slides`, { query })
})
