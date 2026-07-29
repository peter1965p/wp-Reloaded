export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const base   = config.public.wpApiBase.replace('/wp/v2', '')
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch<Record<string, { new_version: string; url: string; slug: string }>>(
    `${base}/wp2026/v1/check-plugin-updates`,
    { method: 'POST', headers: { Authorization: `Basic ${creds}` } }
  )
})
