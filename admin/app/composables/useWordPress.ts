export interface WpPost {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  date: string
  status: string
  categories: number[]
  tags: number[]
  _embedded?: Record<string, unknown>
}

export interface WpPage {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  date: string
  status: string
}

export interface WpCategory {
  id: number
  name: string
  slug: string
  count: number
  description: string
}

export interface WpTag {
  id: number
  name: string
  slug: string
  count: number
}

export interface WpMedia {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  source_url: string
  media_type: string
  mime_type: string
  media_details: { width?: number; height?: number; sizes?: Record<string, { source_url: string }> }
}

export function useWordPress() {
  const config = useRuntimeConfig()
  const base = config.public.wpApiBase as string

  function toQuery(params: Record<string, string | number>) {
    return new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])))
  }

  // Posts
  async function fetchPosts(params: Record<string, string | number> = {}): Promise<WpPost[]> {
    return $fetch<WpPost[]>(`${base}/posts?${toQuery({ per_page: '50', _embed: '1', ...params })}`)
  }

  async function fetchPost(slug: string): Promise<WpPost> {
    const posts = await $fetch<WpPost[]>(`${base}/posts?slug=${slug}&_embed=1`)
    if (!posts.length) throw new Error('Post nicht gefunden')
    return posts[0]!
  }

  // Pages
  async function fetchPages(params: Record<string, string | number> = {}): Promise<WpPage[]> {
    return $fetch<WpPage[]>(`${base}/pages?${toQuery({ per_page: '50', ...params })}`)
  }

  async function fetchPage(slug: string): Promise<WpPage> {
    const pages = await $fetch<WpPage[]>(`${base}/pages?slug=${slug}`)
    if (!pages.length) throw new Error('Seite nicht gefunden')
    return pages[0]!
  }

  // Categories
  async function fetchCategories(): Promise<WpCategory[]> {
    return $fetch<WpCategory[]>(`${base}/categories?per_page=100`)
  }

  // Tags
  async function fetchTags(): Promise<WpTag[]> {
    return $fetch<WpTag[]>(`${base}/tags?per_page=100`)
  }

  // Media
  async function fetchMedia(params: Record<string, string | number> = {}): Promise<WpMedia[]> {
    return $fetch<WpMedia[]>(`${base}/media?${toQuery({ per_page: '50', ...params })}`)
  }

  return { fetchPosts, fetchPost, fetchPages, fetchPage, fetchCategories, fetchTags, fetchMedia }
}
