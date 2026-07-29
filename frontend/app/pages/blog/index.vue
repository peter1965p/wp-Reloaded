<script setup lang="ts">
useSeoMeta({
  title: 'Blog — Päffgen IT',
  description: 'Artikel rund um WordPress, Webentwicklung und IT aus der Vulkaneifel.',
})

interface Post {
  id: number; slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  date: string
  categories: number[]
}

const config = useRuntimeConfig()
const base = config.public.wpApiBase as string

const { data: posts } = await useAsyncData('all-blog-posts', () =>
  $fetch<Post[]>(`${base}/posts?per_page=50&status=publish`)
)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-16">
    <!-- Header -->
    <div class="mb-12">
      <p class="text-xs font-semibold text-pit-blue uppercase tracking-widest mb-3">Neuigkeiten & Wissen</p>
      <h1 class="text-4xl font-bold text-white mb-3">Blog</h1>
      <p class="text-pit-sub text-sm">Artikel zu WordPress, Webentwicklung, Headless CMS und mehr.</p>
    </div>

    <!-- Posts grid -->
    <div v-if="posts?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <div v-else class="text-center py-20 text-pit-muted text-sm">
      Noch keine Beiträge vorhanden.
    </div>
  </div>
</template>
