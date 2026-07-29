<script setup lang="ts">
const route = useRoute()
const { fetchPost } = useWordPress()

const { data: post, error } = await useAsyncData(
  `post-${route.params.slug}`,
  () => fetchPost(route.params.slug as string)
)

if (error.value) throw createError({ statusCode: 404, message: 'Beitrag nicht gefunden' })

definePageMeta({ title: 'Beitrag' })
useSeoMeta({ title: () => post.value?.title.rendered ?? 'Beitrag' })

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <!-- Back + Edit -->
    <div class="flex items-center justify-between">
      <NuxtLink to="/posts" class="text-sm text-slate-500 hover:text-slate-300 transition-colors">
        ← Zurück zu Beiträge
      </NuxtLink>
      <NuxtLink
        :to="`/posts/edit/${route.params.slug}`"
        class="px-4 py-1.5 rounded-md text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors"
      >
        Bearbeiten
      </NuxtLink>
    </div>

    <!-- Post Card -->
    <div class="bg-[#161b22] border border-white/10 rounded-[6px] overflow-hidden">
      <div class="px-7 py-6 border-b border-white/10">
        <h1
          class="text-2xl font-bold text-white leading-snug"
          v-html="post?.title.rendered"
        />
        <div class="flex items-center gap-3 mt-3">
          <span class="text-xs text-slate-500">{{ formatDate(post?.date ?? '') }}</span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
            :class="post?.status === 'publish' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-400'"
          >
            {{ post?.status === 'publish' ? 'Veröffentlicht' : 'Entwurf' }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div
        class="px-7 py-6 prose prose-invert prose-sm max-w-none
               prose-headings:text-white prose-p:text-slate-300
               prose-a:text-blue-400 prose-strong:text-white"
        v-html="post?.content.rendered"
      />
    </div>
  </div>
</template>
