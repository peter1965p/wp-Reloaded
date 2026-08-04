// Server-seitiger Proxy zur WordPress-REST-API — verhindert Cross-Origin-Fetches
// aus dem Browser, wenn WordPress und dieses Frontend auf unterschiedlichen
// Domains laufen (z.B. WordPress auf eigenem Webserver, Frontend auf Cloudflare).
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  return $fetch(`${config.wpApiBase}/posts`, { query })
})
