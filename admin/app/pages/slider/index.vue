<script setup lang="ts">
import { decodeHtml } from '~/composables/useWordPress'
definePageMeta({ title: 'Slider' })

interface Slide {
  id: number
  title: { rendered: string }
  status: string
  menu_order: number
  slide_data: { subtitle: string; button_text: string; button_link: string; image_url: string }
  featured_image_url: string | null
}

const [{ data: slides, refresh }, { data: design, refresh: refreshDesign }] = await Promise.all([
  useAsyncData('all-slides', () => $fetch<Slide[]>('/api/slide')),
  useAsyncData('slider-design', () => $fetch<Record<string, string>>('/api/design')),
])

const sliderEnabled  = computed(() => design.value?.pit_slider_enabled !== '0')
const toggleSaving   = ref(false)

async function toggleSlider() {
  toggleSaving.value = true
  try {
    await $fetch('/api/design', {
      method: 'POST',
      body: { pit_slider_enabled: sliderEnabled.value ? '0' : '1' },
    })
    await refreshDesign()
  } finally {
    toggleSaving.value = false
  }
}

const deleting    = ref<number | null>(null)
const deleteError = ref('')

async function deleteSlide(id: number) {
  if (!confirm('Slide wirklich löschen?')) return
  deleting.value    = id
  deleteError.value = ''
  try {
    await $fetch(`/api/slide/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    deleteError.value = (e as Error)?.message ?? 'Fehler'
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="pit-card overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 class="font-semibold text-white">Alle Slides</h2>
        <div class="flex items-center gap-4">

          <!-- Slider Aktiv / Inaktiv Toggle -->
          <button
            @click="toggleSlider"
            :disabled="toggleSaving"
            class="flex items-center gap-2.5 group"
            :title="sliderEnabled ? 'Slider deaktivieren' : 'Slider aktivieren'"
          >
            <span class="text-xs font-medium" :class="sliderEnabled ? 'text-slate-300' : 'text-slate-500'">
              Slider
            </span>
            <!-- Toggle Track -->
            <div
              class="relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
              :class="[
                sliderEnabled ? 'bg-emerald-500' : 'bg-white/10',
                toggleSaving ? 'opacity-50' : ''
              ]"
            >
              <!-- Knob -->
              <div
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                :class="sliderEnabled ? 'left-[18px]' : 'left-0.5'"
              />
            </div>
            <span class="text-[11px]" :class="sliderEnabled ? 'text-emerald-400' : 'text-slate-600'">
              {{ sliderEnabled ? 'Aktiv' : 'Aus' }}
            </span>
          </button>

          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400">
            {{ slides?.length ?? 0 }} gesamt
          </span>
          <NuxtLink to="/slider/new" class="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
            + Neuer Slide
          </NuxtLink>
        </div>
      </div>

      <div v-if="deleteError" class="px-5 py-2 text-sm text-red-400 bg-red-500/10 border-b border-red-500/20">{{ deleteError }}</div>

      <div class="divide-y divide-white/5">
        <div v-if="!slides?.length" class="px-5 py-10 text-center text-pit-muted text-sm">
          Noch keine Slides vorhanden.
        </div>
        <div
          v-for="slide in slides"
          :key="slide.id"
          class="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
          :class="!sliderEnabled ? 'opacity-40' : ''"
        >
          <!-- Vorschau-Bild -->
          <div class="rounded-md overflow-hidden bg-white/5 flex-shrink-0" style="width:72px;height:44px;min-width:72px">
            <img
              v-if="slide.featured_image_url || slide.slide_data?.image_url"
              :src="slide.featured_image_url || slide.slide_data?.image_url"
              style="width:72px;height:44px;object-fit:cover;display:block"
            />
            <div v-else class="flex items-center justify-center h-full text-[10px] text-pit-muted">kein Bild</div>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ decodeHtml(slide.title.rendered) }}</p>
            <p class="text-xs text-pit-muted truncate mt-0.5">{{ slide.slide_data?.subtitle || '—' }}</p>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <span :class="slide.status === 'publish' ? 'pit-badge-green' : 'pit-badge-muted'">
              {{ slide.status === 'publish' ? 'Aktiv' : 'Inaktiv' }}
            </span>
            <NuxtLink
              :to="`/slider/edit/${slide.id}`"
              class="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              Bearbeiten
            </NuxtLink>
            <button
              @click="deleteSlide(slide.id)"
              :disabled="deleting === slide.id"
              class="px-2.5 py-1 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
            >
              {{ deleting === slide.id ? '…' : 'Löschen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
