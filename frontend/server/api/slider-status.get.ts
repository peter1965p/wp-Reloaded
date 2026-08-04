// Server-seitiger Proxy zum eigenen wp2026-slider-Plugin-Endpoint (siehe posts.get.ts)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseRoot = config.wpApiBase.replace('/wp/v2', '')
  try {
    return await $fetch(`${baseRoot}/wp2026/v1/slider-status`)
  } catch {
    return { enabled: true }
  }
})
