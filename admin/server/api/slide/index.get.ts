export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')
  return $fetch(`${config.public.wpApiBase}/slides?per_page=50&orderby=menu_order&order=asc&status=any`, {
    headers: { 'Authorization': `Basic ${credentials}` },
  })
})
