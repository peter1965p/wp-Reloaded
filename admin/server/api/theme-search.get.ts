export default defineEventHandler(async (event) => {
  const query  = getQuery(event)
  const search = String(query.search || '').trim()
  const page   = Number(query.page || 1)
  if (!search) return { themes: [], total: 0, pages: 0 }

  const res = await $fetch<{
    themes: Record<string, unknown>[]
    info: { results: number; page: number; pages: number }
  }>('https://api.wordpress.org/themes/info/1.2/', {
    query: {
      action: 'query_themes',
      'request[search]': search,
      'request[per_page]': 12,
      'request[page]': page,
      'request[fields][screenshot_url]': 1,
      'request[fields][description]': 1,
      'request[fields][active_installs]': 1,
      'request[fields][versions]': 0,
      'request[fields][sections]': 0,
      'request[fields][tags]': 0,
    },
  })

  return {
    themes: res?.themes ?? [],
    total:  res?.info?.results ?? 0,
    pages:  res?.info?.pages   ?? 1,
    page,
  }
})
