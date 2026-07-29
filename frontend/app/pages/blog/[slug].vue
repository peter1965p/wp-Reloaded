<script setup lang="ts">
const decodeHtml = (s: string) => (s ?? '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")

interface Post {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  date: string
  modified: string
  categories: number[]
}

const route = useRoute()
const config = useRuntimeConfig()
const base = config.public.wpApiBase as string

const { data: post, error } = await useAsyncData(`post-${route.params.slug}`, async () => {
  const posts = await $fetch<Post[]>(`${base}/posts?slug=${route.params.slug}&status=publish`)
  if (!posts.length) throw createError({ statusCode: 404 })
  return posts[0]!
})

if (error.value) throw createError({ statusCode: 404, message: 'Beitrag nicht gefunden' })

useSeoMeta({
  title: () => `${post.value?.title.rendered ?? ''} — Päffgen IT`,
  description: () => post.value?.excerpt.rendered.replace(/<[^>]*>/g, '').trim().slice(0, 160) ?? '',
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-16">
    <!-- Back -->
    <NuxtLink to="/blog" class="inline-flex items-center gap-1.5 text-xs text-pit-muted hover:text-white transition-colors mb-10 group">
      <svg class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
      </svg>
      Alle Beiträge
    </NuxtLink>

    <article v-if="post">
      <!-- Meta -->
      <div class="flex items-center gap-3 mb-6">
        <time class="text-xs text-pit-muted">{{ formatDate(post.date) }}</time>
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl font-bold text-white leading-tight mb-10">
        {{ decodeHtml(post.title.rendered) }}
      </h1>

      <!-- Divider -->
      <div class="h-px bg-white/[0.07] mb-10" />

      <!-- Content -->
      <div class="wp-content" v-html="post.content.rendered" />
    </article>

    <!-- CTA nach Artikel -->
    <div class="mt-16 pit-card p-8 text-center">
      <h3 class="font-semibold text-white mb-2">Projekt geplant?</h3>
      <p class="text-sm text-pit-sub mb-5">Ich helfe dir dabei, es umzusetzen.</p>
      <a href="/#kontakt" class="pit-btn-primary">Kontakt aufnehmen</a>
    </div>
  </div>
</template>
