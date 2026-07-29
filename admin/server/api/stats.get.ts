export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const base = config.public.wpApiBase as string
  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')
  const headers = { 'Authorization': `Basic ${credentials}` }

  const [postsRes, pagesRes, mediaRes, categoriesRes, tagsRes] = await Promise.all([
    $fetch.raw(`${base}/posts?per_page=1&status=any`, { headers }),
    $fetch.raw(`${base}/pages?per_page=1&status=any`, { headers }),
    $fetch.raw(`${base}/media?per_page=1`, { headers }),
    $fetch.raw(`${base}/categories?per_page=1`, { headers }),
    $fetch.raw(`${base}/tags?per_page=1`, { headers }),
  ])

  const postsPublishedRes = await $fetch.raw(`${base}/posts?per_page=1&status=publish`, { headers })

  return {
    posts:     Number(postsRes.headers.get('X-WP-Total') ?? 0),
    pages:     Number(pagesRes.headers.get('X-WP-Total') ?? 0),
    media:     Number(mediaRes.headers.get('X-WP-Total') ?? 0),
    categories: Number(categoriesRes.headers.get('X-WP-Total') ?? 0),
    tags:      Number(tagsRes.headers.get('X-WP-Total') ?? 0),
    published: Number(postsPublishedRes.headers.get('X-WP-Total') ?? 0),
  }
})
