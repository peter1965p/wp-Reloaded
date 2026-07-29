export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch(`${config.public.wpApiBase}/tags/${id}?force=true`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${credentials}` },
  })
})
