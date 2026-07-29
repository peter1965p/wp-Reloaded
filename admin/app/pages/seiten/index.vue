<script setup lang="ts">
import { decodeHtml } from '~/composables/useWordPress'
definePageMeta({ title: 'Seiten' })

const { fetchPages } = useWordPress()
const { data: pages, pending, refresh } = await useAsyncData('all-pages', () => fetchPages(), {
  dedupe: 'defer',
})

const deleting = ref<number | null>(null)
const deleteError = ref('')

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function deletePage(id: number) {
  if (!confirm('Seite wirklich löschen?')) return
  deleting.value = id
  deleteError.value = ''
  try {
    await $fetch(`/api/page/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    deleteError.value = (e as Error)?.message ?? 'Fehler beim Löschen'
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="pit-card overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
      <h2 class="font-semibold text-white">Alle Seiten</h2>
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400">{{ pages?.length ?? 0 }} gesamt</span>
        <NuxtLink to="/seiten/new" class="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
          + Neue Seite
        </NuxtLink>
      </div>
    </div>

    <div v-if="deleteError" class="px-5 py-2 text-sm text-red-400 bg-red-500/10 border-b border-red-500/20">
      {{ deleteError }}
    </div>

    <div v-if="pending" class="px-5 py-10 text-center text-pit-muted text-sm">Laden…</div>

    <div v-else class="divide-y divide-white/5">
      <div v-if="!pages?.length" class="px-5 py-10 text-center text-pit-muted text-sm">
        Noch keine Seiten vorhanden.
      </div>
      <div
        v-for="page in pages"
        :key="page.id"
        class="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
      >
        <div class="flex-1 min-w-0 mr-4">
          <span class="text-sm font-medium text-white block truncate">{{ decodeHtml(page.title.rendered) }}</span>
          <p class="text-xs text-pit-muted mt-0.5">{{ formatDate(page.date) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span :class="page.status === 'publish' ? 'pit-badge-green' : 'pit-badge-muted'">
            {{ page.status === 'publish' ? 'Veröffentlicht' : 'Entwurf' }}
          </span>
          <NuxtLink
            :to="`/seiten/edit/${page.slug}`"
            class="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            Bearbeiten
          </NuxtLink>
          <button
            @click="deletePage(page.id)"
            :disabled="deleting === page.id"
            class="px-2.5 py-1 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
          >
            {{ deleting === page.id ? '…' : 'Löschen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
