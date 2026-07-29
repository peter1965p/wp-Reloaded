<script setup lang="ts">
import { decodeHtml } from '~/composables/useWordPress'
definePageMeta({ title: 'Beiträge' })

const { fetchPosts } = useWordPress()
const { data: posts, pending, refresh } = await useAsyncData('all-posts', () => fetchPosts({ per_page: 50 }), {
  dedupe: 'defer',
})

const deleting   = ref<number | null>(null)
const toggling   = ref<number | null>(null)
const actionError = ref('')

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function deletePost(id: number) {
  if (!confirm('Beitrag wirklich löschen?')) return
  deleting.value    = id
  actionError.value = ''
  try {
    await $fetch(`/api/post/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    actionError.value = (e as Error)?.message ?? 'Fehler beim Löschen'
  } finally {
    deleting.value = null
  }
}

async function toggleStatus(id: number, current: string) {
  toggling.value    = id
  actionError.value = ''
  try {
    await $fetch(`/api/post/${id}`, {
      method: 'PUT',
      body: { status: current === 'publish' ? 'draft' : 'publish' },
    })
    await refresh()
  } catch (e: unknown) {
    actionError.value = (e as Error)?.message ?? 'Fehler beim Ändern'
  } finally {
    toggling.value = null
  }
}
</script>

<template>
  <div class="pit-card overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
      <h2 class="font-semibold text-white">Alle Beiträge</h2>
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400">{{ posts?.length ?? 0 }} gesamt</span>
        <NuxtLink to="/posts/new" class="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
          + Neuer Beitrag
        </NuxtLink>
      </div>
    </div>

    <div v-if="actionError" class="px-5 py-2 text-sm text-red-400 bg-red-500/10 border-b border-red-500/20">
      {{ actionError }}
    </div>

    <div v-if="pending" class="px-5 py-10 text-center text-pit-muted text-sm">Laden…</div>

    <div v-else class="divide-y divide-white/5">
      <div v-if="!posts?.length" class="px-5 py-10 text-center text-pit-muted text-sm">
        Noch keine Beiträge vorhanden.
      </div>
      <div
        v-for="post in posts"
        :key="post.id"
        class="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
      >
        <div class="flex-1 min-w-0 mr-4">
          <NuxtLink :to="`/posts/${post.slug}`" class="text-sm font-medium text-white hover:text-pit-blue transition-colors block truncate">
            {{ decodeHtml(post.title.rendered) }}
          </NuxtLink>
          <p class="text-xs text-pit-muted mt-0.5">{{ formatDate(post.date) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="toggleStatus(post.id, post.status)"
            :disabled="toggling === post.id"
            :class="post.status === 'publish' ? 'pit-badge-green' : 'pit-badge-muted'"
            class="cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-40"
            :title="post.status === 'publish' ? 'Auf Entwurf setzen' : 'Veröffentlichen'"
          >
            {{ toggling === post.id ? '…' : post.status === 'publish' ? 'Veröffentlicht' : 'Entwurf' }}
          </button>
          <NuxtLink
            :to="`/posts/edit/${post.slug}`"
            class="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            Bearbeiten
          </NuxtLink>
          <button
            @click="deletePost(post.id)"
            :disabled="deleting === post.id"
            class="px-2.5 py-1 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
          >
            {{ deleting === post.id ? '…' : 'Löschen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
