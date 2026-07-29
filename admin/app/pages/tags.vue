<script setup lang="ts">
definePageMeta({ title: 'Tags' })

const { fetchTags } = useWordPress()
const { data: tags, refresh } = await useAsyncData('all-tags', () => fetchTags())

const newName     = ref('')
const creating    = ref(false)
const deleting    = ref<number | null>(null)
const actionError = ref('')

async function create() {
  if (!newName.value.trim()) return
  creating.value    = true
  actionError.value = ''
  try {
    await $fetch('/api/tag', { method: 'POST', body: { name: newName.value } })
    newName.value = ''
    await refresh()
  } catch (e: unknown) {
    actionError.value = (e as Error)?.message ?? 'Fehler beim Erstellen'
  } finally {
    creating.value = false
  }
}

async function deleteTag(id: number) {
  if (!confirm('Tag wirklich löschen?')) return
  deleting.value    = id
  actionError.value = ''
  try {
    await $fetch(`/api/tag/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    actionError.value = (e as Error)?.message ?? 'Fehler beim Löschen'
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <!-- Neuer Tag -->
    <div class="pit-card px-5 py-4">
      <h2 class="font-semibold text-white mb-4">Neuer Tag</h2>
      <div class="flex gap-3">
        <input
          v-model="newName"
          type="text"
          placeholder="Tag-Name…"
          class="flex-1 bg-[#05070a] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-pit-blue transition-colors"
          @keydown.enter="create"
        />
        <button
          @click="create"
          :disabled="creating || !newName.trim()"
          class="px-4 py-2 rounded-md text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-40"
        >
          {{ creating ? 'Erstellen…' : 'Erstellen' }}
        </button>
      </div>
      <div v-if="actionError" class="mt-3 text-sm text-red-400">{{ actionError }}</div>
    </div>

    <!-- Liste -->
    <div class="pit-card overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 class="font-semibold text-white">Alle Tags</h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400">{{ tags?.length ?? 0 }} gesamt</span>
      </div>
      <div class="divide-y divide-white/5">
        <div v-if="!tags?.length" class="px-5 py-10 text-center text-pit-muted text-sm">
          Noch keine Tags vorhanden.
        </div>
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors group"
        >
          <div>
            <span class="text-sm font-medium text-white">{{ tag.name }}</span>
            <span class="ml-2 text-xs text-pit-muted">{{ tag.count }} Beiträge</span>
          </div>
          <button
            @click="deleteTag(tag.id)"
            :disabled="deleting === tag.id"
            class="px-2.5 py-1 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
          >
            {{ deleting === tag.id ? '…' : 'Löschen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
