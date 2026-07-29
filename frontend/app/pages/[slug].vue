<script setup lang="ts">
const decodeHtml = (s: string) => (s ?? '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")

interface WpPage {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  date: string
}

const route = useRoute()
const config = useRuntimeConfig()
const base = config.public.wpApiBase as string

const { data: page, error } = await useAsyncData(`page-${route.params.slug}`, async () => {
  const pages = await $fetch<WpPage[]>(`${base}/pages?slug=${route.params.slug}`)
  if (!pages.length) throw createError({ statusCode: 404 })
  return pages[0]!
})

if (error.value) throw createError({ statusCode: 404, message: 'Seite nicht gefunden' })

useSeoMeta({
  title: () => `${page.value?.title.rendered ?? ''} — Päffgen IT`,
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-16">
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-xs text-pit-muted hover:text-white transition-colors mb-10 group">
      <svg class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
      </svg>
      Zurück
    </NuxtLink>

    <article v-if="page">
      <h1 class="text-3xl font-bold text-white mb-8">{{ decodeHtml(page.title.rendered) }}</h1>
      <div class="h-px bg-white/[0.07] mb-8" />
      <div class="wp-content" v-html="page.content.rendered" />
    </article>
  </div>
</template>
