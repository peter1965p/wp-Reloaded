export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const plugin = getRouterParam(event, 'plugin')
  const body = await readBody(event)
  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')
  return $fetch(`${config.public.wpApiBase.replace('/wp/v2', '')}/wp/v2/plugins/${plugin}`, {
    method: 'PUT',
    headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
})
