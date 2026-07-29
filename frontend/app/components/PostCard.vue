<script setup lang="ts">
const decodeHtml = (s: string) => (s ?? '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")

interface Post {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  date: string
  categories: number[]
}

const props = defineProps<{ post: Post }>()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}
</script>

<template>
  <NuxtLink
    :to="`/blog/${post.slug}`"
    class="pit-card flex flex-col p-6 hover:border-white/15 hover:bg-white/[0.02] transition-all duration-200 group"
  >
    <div class="flex items-center gap-2 mb-4">
      <time class="text-xs text-pit-muted">{{ formatDate(post.date) }}</time>
    </div>
    <h3 class="text-base font-semibold text-white group-hover:text-pit-blue transition-colors mb-2 line-clamp-2">
      {{ decodeHtml(post.title.rendered) }}
    </h3>
    <p class="text-sm text-pit-sub leading-relaxed line-clamp-3 flex-1">
      {{ stripHtml(post.excerpt.rendered) }}
    </p>
    <div class="mt-4 flex items-center gap-1.5 text-xs text-pit-blue font-medium">
      Weiterlesen
      <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
      </svg>
    </div>
  </NuxtLink>
</template>
