<script setup lang="ts">
import { Search, Download, Trash2, Power, PowerOff, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-vue-next'

definePageMeta({ title: 'Plugins' })

interface WpPlugin {
  plugin: string
  status: string
  name: string
  author: string
  description: { raw: string }
  version: string
}

interface WpOrgPlugin {
  slug: string
  name: string
  short_description: string
  version: string
  author: string
  active_installs: number
  icons: { '1x'?: string; '2x'?: string; default?: string }
}

interface PluginUpdate {
  new_version: string
  url: string
  slug: string
}

const [{ data: plugins, refresh }, { data: updates, refresh: refreshUpdates }] = await Promise.all([
  useAsyncData('wp-plugins', () => $fetch<WpPlugin[]>('/api/plugins')),
  useAsyncData('wp-plugin-updates', () => $fetch<Record<string, PluginUpdate>>('/api/plugin-updates')),
])

const toggling   = ref<string | null>(null)
const deleting   = ref<string | null>(null)
const installing = ref<string | null>(null)
const updating   = ref<string | null>(null)
const actionErr  = ref('')

function getUpdate(plugin: WpPlugin): PluginUpdate | null {
  return updates.value?.[plugin.plugin] ?? null
}

const active   = computed(() => plugins.value?.filter(p => p.status === 'active') ?? [])
const inactive = computed(() => plugins.value?.filter(p => p.status === 'inactive') ?? [])

const installedSlugs = computed(() =>
  new Set(plugins.value?.map(p => p.plugin.split('/')[0]) ?? [])
)

async function toggle(plugin: WpPlugin) {
  toggling.value = plugin.plugin
  actionErr.value = ''
  try {
    await $fetch(`/api/plugins/${plugin.plugin}`, {
      method: 'PUT',
      body: { status: plugin.status === 'active' ? 'inactive' : 'active' },
    })
    await refresh()
    await refreshNuxtData('plugin-menu')
  } catch (e: unknown) {
    actionErr.value = (e as Error)?.message ?? 'Fehler'
  } finally {
    toggling.value = null
  }
}

async function deletePlugin(plugin: WpPlugin) {
  if (!confirm(`Plugin "${plugin.name}" wirklich löschen?`)) return
  deleting.value  = plugin.plugin
  actionErr.value = ''
  try {
    await $fetch(`/api/plugins/${plugin.plugin}`, { method: 'DELETE' })
    await refresh()
    await refreshNuxtData('plugin-menu')
  } catch (e: unknown) {
    actionErr.value = (e as Error)?.message ?? 'Fehler'
  } finally {
    deleting.value = null
  }
}

// ── Suche ────────────────────────────────────────────────────────────────────
const searchQuery   = ref('')
const searchResults = ref<WpOrgPlugin[]>([])
const searchTotal   = ref(0)
const searchPages   = ref(1)
const searchPage    = ref(1)
const searching     = ref(false)
const searchErr     = ref('')
let   debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  searchPage.value = 1
  if (!val.trim()) { searchResults.value = []; searchTotal.value = 0; return }
  debounceTimer = setTimeout(() => doSearch(val, 1), 380)
})

async function doSearch(q: string, page: number) {
  searching.value = true
  searchErr.value = ''
  try {
    const res = await $fetch<{ plugins: WpOrgPlugin[]; total: number; pages: number; page: number }>(
      '/api/plugin-search',
      { query: { search: q, page } }
    )
    searchResults.value = res.plugins
    searchTotal.value   = res.total
    searchPages.value   = res.pages
    searchPage.value    = res.page
  } catch {
    searchErr.value = 'Suche fehlgeschlagen'
  } finally {
    searching.value = false
  }
}

function goPage(p: number) {
  if (p < 1 || p > searchPages.value) return
  doSearch(searchQuery.value, p)
}

const pageNumbers = computed(() => {
  const total = searchPages.value
  const cur   = searchPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (cur > 3)       pages.push('…')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

async function updatePlugin(plugin: WpPlugin) {
  updating.value  = plugin.plugin
  actionErr.value = ''
  try {
    await $fetch('/api/plugin-updates', { method: 'POST', body: { plugin: plugin.plugin } })
    await Promise.all([refresh(), refreshUpdates(), refreshNuxtData('plugin-menu')])
  } catch (e: unknown) {
    actionErr.value = `Update fehlgeschlagen: ` + ((e as Error)?.message ?? 'Fehler')
  } finally {
    updating.value = null
  }
}

async function installPlugin(slug: string, name: string) {
  installing.value = slug
  actionErr.value  = ''
  try {
    await $fetch('/api/plugins', { method: 'POST', body: { slug } })
    await refresh()
    await refreshNuxtData('plugin-menu')
  } catch (e: unknown) {
    actionErr.value = `"${name}" fehlgeschlagen: ` + ((e as Error)?.message ?? 'Fehler')
  } finally {
    installing.value = null
  }
}

function fmtInstalls(n: number) {
  if (n >= 1_000_000) return Math.floor(n / 1_000_000) + 'M+'
  if (n >= 1_000)     return Math.floor(n / 1_000) + 'K+'
  return n ? String(n) : ''
}

function pluginIcon(p: WpOrgPlugin) {
  return p.icons?.['2x'] || p.icons?.['1x'] || p.icons?.default || ''
}
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <div v-if="actionErr" class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">{{ actionErr }}</div>

    <!-- Plugin installieren -->
    <div class="pit-card overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10">
        <h2 class="font-semibold text-white mb-3">Plugin installieren</h2>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pit-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="WordPress.org Plugins durchsuchen…"
            class="w-full bg-pit-bg border border-white/10 rounded-[6px] pl-9 pr-4 py-2.5 text-sm text-pit-text placeholder-pit-muted focus:outline-none focus:border-pit-blue/50 transition-colors"
          />
        </div>
      </div>

      <!-- Suchergebnisse: 3-Spalten-Grid -->
      <div v-if="searchQuery.trim()" class="px-5 py-4">
        <div v-if="searching" class="py-8 text-center text-pit-muted text-sm animate-pulse">Suche läuft…</div>
        <div v-else-if="searchErr" class="py-4 text-sm text-red-400">{{ searchErr }}</div>
        <div v-else-if="!searchResults.length" class="py-8 text-center text-pit-muted text-sm">
          Keine Ergebnisse für „{{ searchQuery }}"
        </div>
        <template v-else>
          <!-- Ergebnisinfo -->
          <p class="text-[11px] text-pit-muted mb-3">{{ searchTotal.toLocaleString('de') }} Plugins gefunden</p>

          <!-- 3er Grid -->
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="p in searchResults"
              :key="p.slug"
              class="bg-pit-bg border border-white/6 rounded-[8px] p-3.5 flex flex-col gap-2.5 hover:border-white/12 transition-colors"
            >
              <!-- Header: Icon + Name -->
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-[6px] bg-white/5 flex-shrink-0 overflow-hidden">
                  <img
                    v-if="pluginIcon(p)"
                    :src="pluginIcon(p)"
                    alt=""
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="w-full h-full flex items-center justify-center text-sm font-bold text-pit-muted">
                    {{ p.name?.[0] ?? '?' }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-white leading-tight truncate" :title="p.name">{{ p.name }}</p>
                  <p class="text-[10px] text-pit-muted">v{{ p.version }}</p>
                </div>
              </div>

              <!-- Beschreibung -->
              <p class="text-[11px] text-pit-muted leading-relaxed line-clamp-2 flex-1" v-html="p.short_description" />

              <!-- Footer -->
              <div class="flex items-center justify-between mt-auto pt-1">
                <span v-if="p.active_installs" class="text-[10px] text-pit-muted/60">{{ fmtInstalls(p.active_installs) }} Installs</span>
                <span v-else class="text-[10px] text-pit-muted/40">—</span>
                <span
                  v-if="installedSlugs.has(p.slug)"
                  class="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full"
                >✓ Installiert</span>
                <button
                  v-else
                  @click="installPlugin(p.slug, p.name)"
                  :disabled="installing === p.slug"
                  class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-pit-blue/15 text-pit-blue hover:bg-pit-blue/25 transition-colors disabled:opacity-40"
                >
                  <Download class="w-3 h-3" />
                  {{ installing === p.slug ? '…' : 'Installieren' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="searchPages > 1" class="flex items-center justify-center gap-1 mt-5">
            <button
              @click="goPage(searchPage - 1)"
              :disabled="searchPage <= 1"
              class="p-1.5 rounded text-pit-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <template v-for="pg in pageNumbers" :key="String(pg)">
              <span v-if="pg === '…'" class="px-1 text-pit-muted/40 text-xs select-none">…</span>
              <button
                v-else
                @click="goPage(pg as number)"
                :class="[
                  'w-7 h-7 rounded text-xs font-medium transition-colors',
                  pg === searchPage
                    ? 'bg-pit-blue text-white'
                    : 'text-pit-muted hover:text-white hover:bg-white/5'
                ]"
              >{{ pg }}</button>
            </template>

            <button
              @click="goPage(searchPage + 1)"
              :disabled="searchPage >= searchPages"
              class="p-1.5 rounded text-pit-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </template>
      </div>

      <div v-else class="px-5 py-5 text-center text-pit-muted text-xs">
        Suchbegriff eingeben um Plugins von WordPress.org zu finden
      </div>
    </div>

    <!-- Aktive Plugins -->
    <div class="pit-card overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 class="font-semibold text-white">Aktive Plugins</h2>
        <div class="flex items-center gap-2">
          <span v-if="Object.keys(updates ?? {}).length" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400">
            {{ Object.keys(updates ?? {}).length }} Update{{ Object.keys(updates ?? {}).length > 1 ? 's' : '' }} verfügbar
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-500/15 text-green-400">{{ active.length }} aktiv</span>
        </div>
      </div>
      <div class="divide-y divide-white/5">
        <div v-if="!active.length" class="px-5 py-6 text-center text-pit-muted text-sm">Keine aktiven Plugins.</div>
        <div
          v-for="p in active"
          :key="p.plugin"
          class="transition-colors group"
          :class="getUpdate(p) ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]' : 'hover:bg-white/[0.02]'"
        >
          <!-- Haupt-Zeile -->
          <div class="flex items-center justify-between px-5 py-3.5">
            <div class="flex-1 min-w-0 mr-4">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-white">{{ p.name }}</span>
                <span class="text-[10px] text-pit-muted bg-white/5 px-1.5 py-0.5 rounded">v{{ p.version }}</span>
                <span v-if="getUpdate(p)" class="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                  <RefreshCw class="w-2.5 h-2.5" />
                  v{{ getUpdate(p)!.new_version }} verfügbar
                </span>
              </div>
              <p class="text-[11px] text-pit-muted/60 mt-0.5">von {{ p.author?.replace(/<[^>]*>/g, '') }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Update-Button: immer sichtbar wenn Update da -->
              <button
                v-if="getUpdate(p)"
                @click="updatePlugin(p)"
                :disabled="updating === p.plugin"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/35 transition-colors disabled:opacity-40"
              >
                <RefreshCw class="w-3.5 h-3.5" :class="updating === p.plugin ? 'animate-spin' : ''" />
                {{ updating === p.plugin ? 'Wird aktualisiert…' : 'Jetzt aktualisieren' }}
              </button>
              <!-- Deaktivieren + Löschen: nur on hover -->
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="toggle(p)"
                  :disabled="toggling === p.plugin"
                  class="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                >
                  <PowerOff class="w-3.5 h-3.5" />
                  {{ toggling === p.plugin ? '…' : 'Deaktivieren' }}
                </button>
                <button
                  @click="deletePlugin(p)"
                  :disabled="deleting === p.plugin"
                  class="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inaktive Plugins -->
    <div v-if="inactive.length" class="pit-card overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 class="font-semibold text-white">Inaktive Plugins</h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400">{{ inactive.length }} inaktiv</span>
      </div>
      <div class="divide-y divide-white/5">
        <div
          v-for="p in inactive"
          :key="p.plugin"
          class="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
        >
          <div class="flex-1 min-w-0 mr-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium text-white/50">{{ p.name }}</span>
              <span class="text-[10px] text-pit-muted/50 bg-white/5 px-1.5 py-0.5 rounded">v{{ p.version }}</span>
              <span v-if="getUpdate(p)" class="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                <RefreshCw class="w-2.5 h-2.5" />
                v{{ getUpdate(p)!.new_version }} verfügbar
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              v-if="getUpdate(p)"
              @click="updatePlugin(p)"
              :disabled="updating === p.plugin"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/35 transition-colors disabled:opacity-40"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="updating === p.plugin ? 'animate-spin' : ''" />
              {{ updating === p.plugin ? '…' : 'Aktualisieren' }}
            </button>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="toggle(p)"
                :disabled="toggling === p.plugin"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-40"
              >
                <Power class="w-3.5 h-3.5" />
                {{ toggling === p.plugin ? '…' : 'Aktivieren' }}
              </button>
              <button
                @click="deletePlugin(p)"
                :disabled="deleting === p.plugin"
                class="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
