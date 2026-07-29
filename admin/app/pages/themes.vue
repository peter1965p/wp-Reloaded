<script setup lang="ts">
import { Search, Star, Trash2, CheckCircle, ChevronLeft, ChevronRight, Download, Palette, Sparkles, X } from 'lucide-vue-next'
import { decodeHtml } from '~/composables/useWordPress'

definePageMeta({ title: 'Themes' })

interface WpTheme {
  stylesheet: string
  template: string
  status: 'active' | 'inactive'
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
const analyzing   = ref<string | null>(null)
const actionErr   = ref('')

// ── Design-Import ─────────────────────────────────────────────────────────────
interface AnalyzeResult {
  ok: boolean
  source: 'theme.json' | 'style.css' | 'none'
  themeName: string
  colors: string[]
  fonts: string[]
  tokens: Record<string, string>
}
const importResult  = ref<AnalyzeResult | null>(null)
const importApplied = ref(false)

async function analyzeTheme(stylesheet: string) {
  analyzing.value = stylesheet
  actionErr.value = ''
  importResult.value = null
  importApplied.value = false
  try {
    const res = await $fetch<AnalyzeResult>(`/api/themes/${encodeURIComponent(stylesheet)}/analyze`)
    importResult.value = res
  } catch (e: unknown) {
    actionErr.value = 'Analyse fehlgeschlagen: ' + ((e as Error)?.message ?? 'Fehler')
  } finally {
    analyzing.value = null
  }
}

async function applyDesign() {
  if (!importResult.value?.tokens) return
  try {
    await $fetch('/api/design', { method: 'POST', body: importResult.value.tokens })
    importApplied.value = true
  } catch (e: unknown) {
    actionErr.value = 'Design konnte nicht übernommen werden: ' + ((e as Error)?.message ?? '')
  }
}

const activeTheme    = computed(() => themes.value?.find(t => t.status === 'active'))
const inactiveThemes = computed(() => themes.value?.filter(t => t.status !== 'active') ?? [])
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
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold text-white mb-1">{{ decodeHtml(activeTheme.name?.rendered ?? '') }}</h3>
          <p class="text-xs text-pit-muted/60 mb-2">v{{ activeTheme.version }} · von {{ activeTheme.author?.rendered?.replace(/<[^>]*>/g, '') }}</p>
          <p class="text-xs text-pit-muted leading-relaxed line-clamp-2" v-html="activeTheme.description?.rendered" />
          <button
            @click="analyzeTheme(activeTheme.stylesheet)"
            :disabled="analyzing === activeTheme.stylesheet"
            class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-40"
          >
            <Palette class="w-3.5 h-3.5" />
            {{ analyzing === activeTheme.stylesheet ? 'Analysiere…' : 'Design übernehmen' }}
          </button>
        </div>
      </div>

      <!-- Import-Ergebnis Panel -->
      <div v-if="importResult" class="mx-5 mb-5 border border-white/8 rounded-[8px] overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/8">
          <div class="flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-purple-400" />
            <span class="text-xs font-semibold text-white">
              {{ importResult.ok ? `Design aus ${importResult.source} erkannt` : 'Kein Design gefunden' }}
            </span>
            <span class="text-[10px] text-pit-muted">{{ importResult.themeName }}</span>
          </div>
          <button @click="importResult = null" class="text-pit-muted hover:text-white transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div v-if="importResult.ok" class="p-4 space-y-3">
          <!-- Farben -->
          <div v-if="importResult.colors.length">
            <p class="text-[10px] font-medium text-pit-muted uppercase tracking-wider mb-2">Erkannte Farben</p>
            <div class="flex gap-2 flex-wrap">
              <div v-for="(c, i) in importResult.colors" :key="c" class="flex flex-col items-center gap-1">
                <div :style="{ background: c }" class="w-8 h-8 rounded-[6px] border border-white/10" />
                <span class="text-[9px] text-pit-muted font-mono">{{ c }}</span>
                <span v-if="i === 0" class="text-[9px] text-blue-400">Primär</span>
                <span v-if="i === 1" class="text-[9px] text-purple-400">Akzent</span>
              </div>
            </div>
          </div>

          <!-- Fonts -->
          <div v-if="importResult.fonts.length">
            <p class="text-[10px] font-medium text-pit-muted uppercase tracking-wider mb-2">Erkannte Schriftarten</p>
            <div class="flex gap-2 flex-wrap">
              <span
                v-for="f in importResult.fonts" :key="f"
                :style="{ fontFamily: `'${f}', system-ui` }"
                class="px-2.5 py-1 bg-white/5 border border-white/8 rounded text-xs text-white"
              >{{ f }}</span>
            </div>
          </div>

          <!-- Tokens-Vorschau -->
          <div class="bg-pit-bg rounded-[6px] p-3 font-mono text-[11px] space-y-0.5">
            <div v-for="(val, key) in importResult.tokens" :key="key" class="flex gap-3">
              <span class="text-pit-muted">{{ key }}:</span>
              <span class="text-green-400">{{ val }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-1">
            <button
              v-if="!importApplied"
              @click="applyDesign"
              class="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-xs font-medium bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 transition-colors"
            >
              <Palette class="w-3.5 h-3.5" />
              Design auf Frontend anwenden
            </button>
            <span v-else class="text-xs text-green-400">✓ Design wurde übernommen — Frontend aktualisiert sich beim nächsten Aufruf</span>
          </div>
        </div>

        <div v-else class="px-4 py-5 text-sm text-pit-muted text-center">
          Keine verwertbaren Design-Tokens in <code class="text-xs">theme.json</code> oder <code class="text-xs">style.css</code> gefunden.
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
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div class="flex gap-2">
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
              <button
                @click="analyzeTheme(t.stylesheet)"
                :disabled="analyzing === t.stylesheet"
                class="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-40"
              >
                <Palette class="w-3 h-3" />
                {{ analyzing === t.stylesheet ? '…' : 'Design übernehmen' }}
              </button>
            </div>
          </div>
          <div class="px-3 py-2.5">
            <p class="text-xs font-medium text-white/70 truncate">{{ decodeHtml(t.name?.rendered ?? '') }}</p>
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
