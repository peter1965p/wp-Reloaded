export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)
  const base   = config.public.wpApiBase.replace('/wp/v2', '')
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch(`${base}/wp2026/v1/plugin-updates`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ plugin: body.plugin }),
  })
})
