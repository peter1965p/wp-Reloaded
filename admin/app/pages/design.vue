<script setup lang="ts">
import { Save, RotateCcw, Palette, Type, Sliders, Monitor } from 'lucide-vue-next'

definePageMeta({ title: 'Design' })

const FONTS = ['Inter', 'Poppins', 'Roboto', 'DM Sans', 'Plus Jakarta Sans', 'Nunito', 'Outfit', 'Manrope']
const HEADER_STYLES = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'solid',       label: 'Solid / Undurchsichtig' },
  { value: 'blur',        label: 'Blur / Glassmorphism' },
]

interface DesignSettings {
  pit_primary_color:  string
  pit_accent_color:   string
  pit_font_family:    string
  pit_border_radius:  string
  pit_header_style:   string
}

const defaults: DesignSettings = {
  pit_primary_color: '#3b82f6',
  pit_accent_color:  '#8b5cf6',
  pit_font_family:   'Inter',
  pit_border_radius: '8',
  pit_header_style:  'transparent',
}

const { data: saved, refresh } = await useAsyncData('design', () =>
  $fetch<DesignSettings>('/api/design')
)

const form   = reactive<DesignSettings>({ ...defaults })
const saving = ref(false)
const saved_ = ref(false)
const err    = ref('')

watch(saved, (val) => { if (val) Object.assign(form, val) }, { immediate: true })

async function save() {
  saving.value = true
  saved_.value = false
  err.value    = ''
  try {
    await $fetch('/api/design', { method: 'POST', body: { ...form } })
    await refresh()
    saved_.value = true
    setTimeout(() => saved_.value = false, 2500)
  } catch (e: unknown) {
    err.value = (e as Error)?.message ?? 'Fehler beim Speichern'
  } finally {
    saving.value = false
  }
}

function reset() {
  Object.assign(form, defaults)
}

// Preview CSS
const previewStyle = computed(() => ({
  '--preview-primary': form.pit_primary_color,
  '--preview-accent':  form.pit_accent_color,
  '--preview-radius':  form.pit_border_radius + 'px',
  fontFamily: `'${form.pit_font_family}', system-ui, sans-serif`,
}))
</script>

<template>
  <div class="max-w-4xl">
    <div v-if="err" class="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">{{ err }}</div>

    <div class="grid grid-cols-[1fr_280px] gap-5">
      <!-- Einstellungen -->
      <div class="space-y-4">

        <!-- Farben -->
        <div class="pit-card overflow-hidden">
          <div class="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Palette class="w-4 h-4 text-pit-blue" />
            <h2 class="font-semibold text-white">Farben</h2>
          </div>
          <div class="p-5 space-y-5">
            <!-- Primary -->
            <div>
              <label class="block text-xs font-medium text-pit-muted uppercase tracking-wider mb-2">Primärfarbe</label>
              <div class="flex items-center gap-3">
                <div class="relative">
                  <input
                    v-model="form.pit_primary_color"
                    type="color"
                    class="w-10 h-10 rounded-[6px] border border-white/10 bg-transparent cursor-pointer p-0.5"
                  />
                </div>
                <input
                  v-model="form.pit_primary_color"
                  type="text"
                  maxlength="7"
                  class="flex-1 bg-pit-bg border border-white/10 rounded-[6px] px-3 py-2 text-sm text-pit-text font-mono focus:outline-none focus:border-pit-blue/50"
                />
                <!-- Swatches -->
                <div class="flex gap-1.5">
                  <button
                    v-for="c in ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6']"
                    :key="c"
                    @click="form.pit_primary_color = c"
                    :style="{ background: c }"
                    :class="['w-6 h-6 rounded-full border-2 transition-all', form.pit_primary_color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105']"
                  />
                </div>
              </div>
            </div>

            <!-- Accent -->
            <div>
              <label class="block text-xs font-medium text-pit-muted uppercase tracking-wider mb-2">Akzentfarbe</label>
              <div class="flex items-center gap-3">
                <input
                  v-model="form.pit_accent_color"
                  type="color"
                  class="w-10 h-10 rounded-[6px] border border-white/10 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  v-model="form.pit_accent_color"
                  type="text"
                  maxlength="7"
                  class="flex-1 bg-pit-bg border border-white/10 rounded-[6px] px-3 py-2 text-sm text-pit-text font-mono focus:outline-none focus:border-pit-blue/50"
                />
                <div class="flex gap-1.5">
                  <button
                    v-for="c in ['#8b5cf6','#a855f7','#f43f5e','#06b6d4','#84cc16','#f97316','#eab308']"
                    :key="c"
                    @click="form.pit_accent_color = c"
                    :style="{ background: c }"
                    :class="['w-6 h-6 rounded-full border-2 transition-all', form.pit_accent_color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105']"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Typografie -->
        <div class="pit-card overflow-hidden">
          <div class="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Type class="w-4 h-4 text-pit-blue" />
            <h2 class="font-semibold text-white">Typografie</h2>
          </div>
          <div class="p-5">
            <label class="block text-xs font-medium text-pit-muted uppercase tracking-wider mb-2">Schriftart</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="font in FONTS"
                :key="font"
                @click="form.pit_font_family = font"
                :style="{ fontFamily: `'${font}', system-ui` }"
                :class="[
                  'px-4 py-2.5 rounded-[6px] text-sm border transition-all text-left',
                  form.pit_font_family === font
                    ? 'border-pit-blue/50 bg-pit-blue/10 text-white'
                    : 'border-white/6 bg-pit-bg text-pit-muted hover:border-white/15 hover:text-white'
                ]"
              >
                {{ font }}
              </button>
            </div>
          </div>
        </div>

        <!-- Layout -->
        <div class="pit-card overflow-hidden">
          <div class="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Sliders class="w-4 h-4 text-pit-blue" />
            <h2 class="font-semibold text-white">Layout</h2>
          </div>
          <div class="p-5 space-y-5">
            <!-- Border Radius -->
            <div>
              <label class="block text-xs font-medium text-pit-muted uppercase tracking-wider mb-3">
                Eckenradius — {{ form.pit_border_radius }}px
              </label>
              <div class="flex items-center gap-3">
                <span class="text-[11px] text-pit-muted">0</span>
                <input
                  v-model="form.pit_border_radius"
                  type="range" min="0" max="24" step="2"
                  class="flex-1 accent-pit-blue"
                />
                <span class="text-[11px] text-pit-muted">24</span>
              </div>
              <div class="flex gap-3 mt-3">
                <div v-for="r in ['0','4','8','12','16','24']" :key="r"
                  @click="form.pit_border_radius = r"
                  :style="{ borderRadius: r + 'px', background: form.pit_border_radius === r ? form.pit_primary_color + '20' : undefined, borderColor: form.pit_border_radius === r ? form.pit_primary_color : undefined }"
                  class="w-10 h-10 border border-white/10 bg-white/5 cursor-pointer hover:border-white/25 transition-all"
                />
              </div>
            </div>

            <!-- Header Style -->
            <div>
              <label class="block text-xs font-medium text-pit-muted uppercase tracking-wider mb-2">Header-Stil</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="s in HEADER_STYLES"
                  :key="s.value"
                  @click="form.pit_header_style = s.value"
                  :class="[
                    'px-3 py-2 rounded-[6px] text-xs border transition-all',
                    form.pit_header_style === s.value
                      ? 'border-pit-blue/50 bg-pit-blue/10 text-white'
                      : 'border-white/6 bg-pit-bg text-pit-muted hover:border-white/15 hover:text-white'
                  ]"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Aktionen -->
        <div class="flex gap-3">
          <button
            @click="save"
            :disabled="saving"
            class="flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-medium bg-pit-blue hover:bg-pit-blue-h text-white transition-colors disabled:opacity-50"
          >
            <Save class="w-4 h-4" />
            {{ saving ? 'Speichert…' : saved_ ? '✓ Gespeichert' : 'Speichern' }}
          </button>
          <button
            @click="reset"
            class="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-medium border border-white/10 text-pit-muted hover:text-white hover:border-white/20 transition-colors"
          >
            <RotateCcw class="w-4 h-4" />
            Zurücksetzen
          </button>
        </div>
      </div>

      <!-- Live Preview -->
      <div class="space-y-3">
        <div class="flex items-center gap-2 px-1">
          <Monitor class="w-4 h-4 text-pit-muted" />
          <span class="text-xs font-medium text-pit-muted uppercase tracking-wider">Vorschau</span>
        </div>

        <div
          :style="previewStyle"
          class="bg-[#080b10] border border-white/8 rounded-[10px] overflow-hidden text-sm"
        >
          <!-- Fake Header -->
          <div :style="{ background: form.pit_header_style === 'solid' ? '#0d1117' : 'transparent', backdropFilter: form.pit_header_style === 'blur' ? 'blur(12px)' : undefined }"
            class="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <span class="font-bold text-white text-xs">Päffgen IT</span>
            <div class="flex gap-2">
              <span v-for="n in ['Start','Blog','Kontakt']" :key="n" class="text-[10px] text-white/50">{{ n }}</span>
            </div>
          </div>

          <!-- Fake Hero -->
          <div class="px-4 py-6 text-center">
            <div class="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-medium mb-2"
              :style="{ background: form.pit_primary_color + '20', color: form.pit_primary_color }">
              Willkommen
            </div>
            <h2 class="text-white font-bold text-sm mb-1 leading-snug">IT-Lösungen für<br />Ihr Unternehmen</h2>
            <p class="text-[10px] text-white/40 mb-3">Professionelle IT-Dienstleistungen</p>
            <button
              :style="{ background: form.pit_primary_color, borderRadius: form.pit_border_radius + 'px' }"
              class="px-4 py-1.5 text-white text-[10px] font-semibold"
            >
              Mehr erfahren
            </button>
          </div>

          <!-- Fake Cards -->
          <div class="grid grid-cols-2 gap-2 px-4 pb-4">
            <div v-for="i in 2" :key="i"
              :style="{ borderRadius: form.pit_border_radius + 'px', borderColor: form.pit_primary_color + '20' }"
              class="bg-white/[0.03] border p-3">
              <div :style="{ background: form.pit_accent_color + '20', borderRadius: '4px' }"
                class="w-6 h-6 mb-2 flex items-center justify-center">
                <div :style="{ background: form.pit_accent_color }" class="w-3 h-3 rounded-sm" />
              </div>
              <div class="h-2 bg-white/20 rounded mb-1.5 w-3/4" />
              <div class="h-1.5 bg-white/10 rounded w-full" />
            </div>
          </div>
        </div>

        <p class="text-[10px] text-pit-muted/50 text-center px-1">
          Änderungen werden im Frontend übernommen sobald du speicherst.
        </p>
      </div>
    </div>
  </div>
</template>
