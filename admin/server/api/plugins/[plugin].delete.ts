export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const plugin = getRouterParam(event, 'plugin')!

  const base  = config.public.wpApiBase.replace('/wp/v2', '')
  const creds = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  const res = await $fetch(`${base}/wp/v2/plugins/${encodeURIComponent(plugin)}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${creds}` },
    query: { force: true },
  })

  return res
})
