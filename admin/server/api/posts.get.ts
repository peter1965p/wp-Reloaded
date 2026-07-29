export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)
  const base   = config.public.wpApiBase
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch(`${base}/posts`, {
    headers: { Authorization: `Basic ${creds}` },
    query: {
      per_page: query.per_page ?? 50,
      status:   query.status   ?? 'any',
      orderby:  'date',
      order:    'desc',
      _embed:   1,
    },
  })
})
