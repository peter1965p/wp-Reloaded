export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const base  = config.public.wpApiBase.replace('/wp/v2', '')
  const creds = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  const res = await $fetch(`${base}/wp/v2/plugins`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slug: body.slug, status: 'inactive' }),
  })

  return res
})
