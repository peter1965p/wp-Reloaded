export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')
  return $fetch(`${config.public.wpApiBase.replace('/wp/v2', '')}/wp/v2/plugins?per_page=100`, {
    headers: { 'Authorization': `Basic ${credentials}` },
  })
})
