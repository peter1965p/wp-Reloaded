<script setup lang="ts">
definePageMeta({ title: 'Medien' })

import type { WpMedia } from '~/composables/useWordPress'

const { fetchMedia } = useWordPress()
const { data: mediaList, refresh } = await useAsyncData('all-media', () => fetchMedia())

const uploading   = ref(false)
const deleting    = ref<number | null>(null)
const uploadError = ref('')
const fileInput   = ref<HTMLInputElement | null>(null)

async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value   = true
  uploadError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    await $fetch('/api/media', { method: 'POST', body: fd })
    await refresh()
  } catch (e: unknown) {
    uploadError.value = (e as Error)?.message ?? 'Fehler beim Upload'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function deleteMedia(id: number) {
  if (!confirm('Mediendatei wirklich löschen?')) return
  deleting.value = id
  try {
    await $fetch(`/api/media/${id}`, { method: 'DELETE' })
    await refresh()
  } catch {
    // ignore
  } finally {
    deleting.value = null
  }
}

function thumb(item: WpMedia) {
  return item.media_details?.sizes?.thumbnail?.source_url ?? item.source_url
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header/Upload -->
    <div class="pit-card px-5 py-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-white">Medienbibliothek</h2>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400">{{ mediaList?.length ?? 0 }} Dateien</span>
          <div v-if="uploadError" class="text-sm text-red-400">{{ uploadError }}</div>
          <label
            class="px-4 py-2 rounded-md text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
            :class="uploading ? 'opacity-50 pointer-events-none' : ''"
          >
            {{ uploading ? 'Hochladen…' : '+ Hochladen' }}
            <input ref="fileInput" type="file" class="hidden" accept="image/*,video/*,audio/*,.pdf" @change="upload" />
          </label>
        </div>
      </div>
    </div>

    <!-- Galerie -->
    <div v-if="!mediaList?.length" class="pit-card px-5 py-10 text-center text-pit-muted text-sm">
      Noch keine Medien vorhanden.
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div
        v-for="item in mediaList"
        :key="item.id"
        class="relative group rounded-[6px] overflow-hidden bg-[#161b22] border border-white/10 aspect-square"
      >
        <img
          v-if="item.media_type === 'image'"
          :src="thumb(item)"
          :alt="item.title.rendered"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-pit-muted text-xs px-2 text-center">
          {{ item.mime_type }}
        </div>

        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <a
            :href="item.source_url"
            target="_blank"
            class="px-2.5 py-1 rounded text-xs text-white bg-white/20 hover:bg-white/30 transition-colors"
          >
            Öffnen
          </a>
          <button
            @click="deleteMedia(item.id)"
            :disabled="deleting === item.id"
            class="px-2.5 py-1 rounded text-xs text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-40"
          >
            {{ deleting === item.id ? '…' : 'Löschen' }}
          </button>
        </div>

        <!-- Filename tooltip -->
        <div class="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 text-[10px] text-slate-300 truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {{ item.title.rendered || item.slug }}
        </div>
      </div>
    </div>
  </div>
</template>
