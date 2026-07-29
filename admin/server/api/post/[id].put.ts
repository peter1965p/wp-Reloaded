export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  const res = await $fetch(`${config.public.wpApiBase}/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return res
})
