export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const plugin = getRouterParam(event, 'plugin')!
  const base   = config.public.wpApiBase.replace('/wp/v2', '')
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch(`${base}/wp/v2/plugins/${plugin}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${creds}` },
    query: { force: true },
  })
})
