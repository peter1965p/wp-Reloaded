export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch(`${config.public.wpApiBase}/settings`, {
    headers: { 'Authorization': `Basic ${credentials}` },
  })
})
