export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const base   = config.public.wpApiBase.replace('/wp/v2', '')
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch(`${base}/wp/v2/themes`, {
    headers: { Authorization: `Basic ${creds}` },
    query: { per_page: 100 },
  })
})
