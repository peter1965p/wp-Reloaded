export default defineEventHandler(async (event) => {
  const query  = getQuery(event)
  const search = String(query.search || '').trim()
  const page   = Number(query.page || 1)
  if (!search) return { plugins: [], total: 0, pages: 0 }

  const res = await $fetch<{ plugins: Record<string, unknown>[]; info: { results: number; page: number; pages: number } }>(
    'https://api.wordpress.org/plugins/info/1.2/',
    {
      query: {
        action: 'query_plugins',
        'request[search]': search,
        'request[per_page]': 12,
        'request[page]': page,
        'request[fields][short_description]': 1,
        'request[fields][icons]': 1,
        'request[fields][active_installs]': 1,
        'request[fields][versions]': 0,
        'request[fields][sections]': 0,
        'request[fields][tags]': 0,
      },
    }
  )

  return {
    plugins: res?.plugins ?? [],
    total:   res?.info?.results ?? 0,
    pages:   res?.info?.pages   ?? 1,
    page,
  }
})
