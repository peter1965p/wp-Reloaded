<script setup lang="ts">
import { Search, Star, Trash2, CheckCircle, ChevronLeft, ChevronRight, Download } from 'lucide-vue-next'

definePageMeta({ title: 'Themes' })

interface WpTheme {
  stylesheet: string
  template: string
  status: { value: 'active' | 'inactive' }
  name: { rendered: string }
  description: { rendered: string }
  author: { rendered: string }
  screenshot: string
  version: string
}

interface WpOrgTheme {
  slug: string
  name: string
  version: string
  author: string
  screenshot_url: string
  description: string
  active_installs: number
}

const { data: themes, refresh } = await useAsyncData('wp-themes', () =>
  $fetch<WpTheme[]>('/api/themes')
)

const installing  = ref<string | null>(null)
const activating  = ref<string | null>(null)
const deleting    = ref<string | null>(null)
const actionErr   = ref('')

const activeTheme   = computed(() => themes.value?.find(t => t.status?.value === 'active'))
const inactiveThemes = computed(() => themes.value?.filter(t => t.status?.value !== 'active') ?? [])
const installedSlugs = computed(() => new Set(themes.value?.map(t => t.stylesheet) ?? []))

async function activateTheme(theme: WpTheme) {
  activating.value = theme.stylesheet
  actionErr.value  = ''
  try {
    await $fetch(`/api/themes/${encodeURIComponent(theme.stylesheet)}`, {
      method: 'PUT', body: { status: 'active' },
    })
    await refresh()
  } catch (e: unknown) {
    actionErr.value = (e as Error)?.message ?? 'Fehler'
  } finally { activating.value = null }
}

async function deleteTheme(theme: WpTheme) {
  if (!confirm(`Theme "${theme.name?.rendered}" wirklich löschen?`)) return
  deleting.value  = theme.stylesheet
  actionErr.value = ''
  try {
    await $fetch(`/api/themes/${encodeURIComponent(theme.stylesheet)}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    actionErr.value = (e as Error)?.message ?? 'Fehler'
  } finally { deleting.value = null }
}

// ── Suche ────────────────────────────────────────────────────────────────────
const searchQuery   = ref('')
const searchResults = ref<WpOrgTheme[]>([])
const searchTotal   = ref(0)
const searchPages   = ref(1)
const searchPage    = ref(1)
const searching     = ref(false)
const searchErr     = ref('')
let   timer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (timer) clearTimeout(timer)
  searchPage.value = 1
  if (!val.trim()) { searchResults.value = []; searchTotal.value = 0; return }
  timer = setTimeout(() => doSearch(val, 1), 380)
})

async function doSearch(q: string, page: number) {
  searching.value = true; searchErr.value = ''
  try {
    const res = await $fetch<{ themes: WpOrgTheme[]; total: number; pages: number; page: number }>(
      '/api/theme-search', { query: { search: q, page } }
    )
    searchResults.value = res.themes
    searchTotal.value   = res.total
    searchPages.value   = res.pages
    searchPage.value    = res.page
  } catch { searchErr.value = 'Suche fehlgeschlagen' }
  finally  { searching.value = false }
}

function goPage(p: number) {
  if (p < 1 || p > searchPages.value) return
  doSearch(searchQuery.value, p)
}

const pageNumbers = computed(() => {
  const total = searchPages.value, cur = searchPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (cur > 3) pages.push('…')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

async function installTheme(slug: string, name: string) {
  installing.value = slug; actionErr.value = ''
  try {
    await $fetch('/api/themes', { method: 'POST', body: { slug } })
    await refresh()
  } catch (e: unknown) {
    actionErr.value = `"${name}" fehlgeschlagen: ` + ((e as Error)?.message ?? 'Fehler')
  } finally { installing.value = null }
}

function fmtInstalls(n: number) {
  if (n >= 1_000_000) return Math.floor(n / 1_000_000) + 'M+'
  if (n >= 1_000)     return Math.floor(n / 1_000) + 'K+'
  return n ? String(n) : ''
}
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <div v-if="actionErr" class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">{{ actionErr }}</div>

    <!-- Aktives Theme -->
    <div v-if="activeTheme" class="pit-card overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 class="font-semibold text-white">Aktives Theme</h2>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-500/15 text-green-400">
          <CheckCircle class="w-3 h-3" /> Aktiv
        </span>
      </div>
      <div class="flex gap-5 p-5">
        <div class="w-48 h-32 rounded-[6px] overflow-hidden bg-white/5 flex-shrink-0">
          <img v-if="activeTheme.screenshot" :src="activeTheme.screenshot" alt="" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-pit-muted">
            <Star class="w-8 h-8 opacity-30" />
          </div>
        </div>
        <div>
          <h3 class="text-base font-semibold text-white mb-1">{{ activeTheme.name?.rendered }}</h3>
          <p class="text-xs text-pit-muted/60 mb-2">v{{ activeTheme.version }} · von {{ activeTheme.author?.rendered?.replace(/<[^>]*>/g, '') }}</p>
          <p class="text-xs text-pit-muted leading-relaxed line-clamp-3" v-html="activeTheme.description?.rendered" />
        </div>
      </div>
    </div>

    <!-- Installierte Themes -->
    <div v-if="inactiveThemes.length" class="pit-card overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 class="font-semibold text-white">Installierte Themes</h2>
        <span class="text-[11px] text-pit-muted">{{ inactiveThemes.length }} inaktiv</span>
      </div>
      <div class="grid grid-cols-3 gap-4 p-4">
        <div
          v-for="t in inactiveThemes"
          :key="t.stylesheet"
          class="bg-pit-bg border border-white/6 rounded-[8px] overflow-hidden hover:border-white/12 transition-colors group"
        >
          <div class="relative h-28 bg-white/5">
            <img v-if="t.screenshot" :src="t.screenshot" alt="" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Star class="w-8 h-8 text-pit-muted opacity-30" />
            </div>
            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                @click="activateTheme(t)"
                :disabled="activating === t.stylesheet"
                class="px-3 py-1.5 rounded text-[11px] font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-40"
              >
                {{ activating === t.stylesheet ? '…' : 'Aktivieren' }}
              </button>
              <button
                @click="deleteTheme(t)"
                :disabled="deleting === t.stylesheet"
                class="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div class="px-3 py-2.5">
            <p class="text-xs font-medium text-white/70 truncate">{{ t.name?.rendered }}</p>
            <p class="text-[10px] text-pit-muted">v{{ t.version }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme installieren -->
    <div class="pit-card overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10">
        <h2 class="font-semibold text-white mb-3">Theme installieren</h2>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pit-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="WordPress.org Themes durchsuchen…"
            class="w-full bg-pit-bg border border-white/10 rounded-[6px] pl-9 pr-4 py-2.5 text-sm text-pit-text placeholder-pit-muted focus:outline-none focus:border-pit-blue/50 transition-colors"
          />
        </div>
      </div>

      <div v-if="searchQuery.trim()" class="px-5 py-4">
        <div v-if="searching" class="py-8 text-center text-pit-muted text-sm animate-pulse">Suche läuft…</div>
        <div v-else-if="!searchResults.length" class="py-8 text-center text-pit-muted text-sm">
          Keine Themes für „{{ searchQuery }}"
        </div>
        <template v-else>
          <p class="text-[11px] text-pit-muted mb-3">{{ searchTotal.toLocaleString('de') }} Themes gefunden</p>

          <!-- 3er Grid mit Screenshots -->
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="t in searchResults"
              :key="t.slug"
              class="bg-pit-bg border border-white/6 rounded-[8px] overflow-hidden hover:border-white/12 transition-colors"
            >
              <!-- Screenshot -->
              <div class="h-32 bg-white/5 overflow-hidden">
                <img
                  v-if="t.screenshot_url"
                  :src="t.screenshot_url"
                  alt=""
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-pit-muted">
                  <Star class="w-8 h-8 opacity-20" />
                </div>
              </div>
              <!-- Info -->
              <div class="p-3">
                <div class="flex items-start justify-between gap-1 mb-1">
                  <p class="text-xs font-semibold text-white leading-tight">{{ t.name }}</p>
                  <span class="text-[10px] text-pit-muted shrink-0">v{{ t.version }}</span>
                </div>
                <p class="text-[11px] text-pit-muted line-clamp-2 mb-2.5" v-html="t.description" />
                <div class="flex items-center justify-between">
                  <span v-if="t.active_installs" class="text-[10px] text-pit-muted/60">{{ fmtInstalls(t.active_installs) }} Installs</span>
                  <span v-else />
                  <span v-if="installedSlugs.has(t.slug)" class="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">✓ Installiert</span>
                  <button
                    v-else
                    @click="installTheme(t.slug, t.name)"
                    :disabled="installing === t.slug"
                    class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-pit-blue/15 text-pit-blue hover:bg-pit-blue/25 transition-colors disabled:opacity-40"
                  >
                    <Download class="w-3 h-3" />
                    {{ installing === t.slug ? '…' : 'Installieren' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="searchPages > 1" class="flex items-center justify-center gap-1 mt-5">
            <button @click="goPage(searchPage - 1)" :disabled="searchPage <= 1"
              class="p-1.5 rounded text-pit-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <template v-for="pg in pageNumbers" :key="String(pg)">
              <span v-if="pg === '…'" class="px-1 text-pit-muted/40 text-xs select-none">…</span>
              <button v-else @click="goPage(pg as number)"
                :class="['w-7 h-7 rounded text-xs font-medium transition-colors', pg === searchPage ? 'bg-pit-blue text-white' : 'text-pit-muted hover:text-white hover:bg-white/5']">
                {{ pg }}
              </button>
            </template>
            <button @click="goPage(searchPage + 1)" :disabled="searchPage >= searchPages"
              class="p-1.5 rounded text-pit-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </template>
      </div>
      <div v-else class="px-5 py-5 text-center text-pit-muted text-xs">
        Suchbegriff eingeben um Themes von WordPress.org zu finden
      </div>
    </div>
  </div>
</template>
