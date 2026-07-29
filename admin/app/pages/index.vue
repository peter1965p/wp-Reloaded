<script setup lang="ts">
import { FileText, File, CheckCircle, PenLine, Image, Tag } from 'lucide-vue-next'

definePageMeta({ title: 'Dashboard' })

const { fetchPosts } = useWordPress()

const { data: stats } = await useAsyncData('dashboard-stats', () =>
  $fetch<{ posts: number; pages: number; media: number; categories: number; tags: number; published: number }>('/api/stats')
)

const { data: recentPosts } = await useAsyncData('recent-posts', () => fetchPosts({ per_page: 6 }))

const kpis = [
  { label: 'Beiträge',       key: 'posts',     icon: FileText,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  { label: 'Seiten',         key: 'pages',      icon: File,        color: 'text-green-400',   bg: 'bg-green-500/10' },
  { label: 'Veröffentlicht', key: 'published',  icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Entwürfe',       key: 'drafts',     icon: PenLine,     color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
]

const statValues = computed(() => ({
  posts:     stats.value?.posts ?? 0,
  pages:     stats.value?.pages ?? 0,
  published: stats.value?.published ?? 0,
  drafts:    (stats.value?.posts ?? 0) - (stats.value?.published ?? 0),
}))

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="s in kpis"
        :key="s.key"
        class="bg-[#161b22] border border-white/10 rounded-[6px] p-5 flex items-center gap-4"
      >
        <div :class="[s.bg, 'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0']">
          <component :is="s.icon" :class="[s.color, 'w-5 h-5']" :stroke-width="1.75" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white leading-none">{{ statValues[s.key as keyof typeof statValues] }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Weitere Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-[#161b22] border border-white/10 rounded-[6px] p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <Image class="w-4 h-4 text-purple-400" :stroke-width="1.75" />
        </div>
        <div>
          <p class="text-xl font-bold text-white leading-none">{{ stats?.media ?? 0 }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Medien</p>
        </div>
      </div>
      <div class="bg-[#161b22] border border-white/10 rounded-[6px] p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
          <Tag class="w-4 h-4 text-orange-400" :stroke-width="1.75" />
        </div>
        <div>
          <p class="text-xl font-bold text-white leading-none">{{ stats?.categories ?? 0 }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Kategorien</p>
        </div>
      </div>
      <div class="bg-[#161b22] border border-white/10 rounded-[6px] p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
          <Tag class="w-4 h-4 text-pink-400" :stroke-width="1.75" />
        </div>
        <div>
          <p class="text-xl font-bold text-white leading-none">{{ stats?.tags ?? 0 }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Tags</p>
        </div>
      </div>
    </div>

    <!-- Letzte Beiträge -->
    <div class="bg-[#161b22] border border-white/10 rounded-[6px] overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 class="font-semibold text-white text-sm">Letzte Beiträge</h2>
        <NuxtLink to="/posts" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          Alle ansehen →
        </NuxtLink>
      </div>

      <div class="divide-y divide-white/[0.05]">
        <div v-if="!recentPosts?.length" class="px-5 py-10 text-center text-slate-500 text-sm">
          Noch keine Beiträge vorhanden.
        </div>
        <div
          v-for="post in recentPosts"
          :key="post.id"
          class="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
        >
          <div class="flex-1 min-w-0 mr-4">
            <NuxtLink
              :to="`/posts/${post.slug}`"
              class="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate block"
            >
              {{ post.title.rendered }}
            </NuxtLink>
            <p class="text-xs text-slate-600 mt-0.5">{{ formatDate(post.date) }}</p>
          </div>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0"
            :class="post.status === 'publish'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-white/5 text-slate-400'"
          >
            {{ post.status === 'publish' ? 'Veröffentlicht' : 'Entwurf' }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>
