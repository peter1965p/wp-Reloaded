<script setup lang="ts">
definePageMeta({ title: 'Slide bearbeiten' })

interface Slide {
  id: number
  title: { rendered: string }
  status: string
  menu_order: number
  slide_data: { subtitle: string; button_text: string; button_link: string; image_url: string }
  featured_image_url: string | null
}

const route  = useRoute()
const router = useRouter()

const { data: slide, error: fetchError } = await useAsyncData(
  `slide-${route.params.id}`,
  () => $fetch<Slide>(`/api/slide/${route.params.id}`)
)

if (fetchError.value) throw createError({ statusCode: 404, message: 'Slide nicht gefunden' })

const status  = ref<'publish' | 'draft'>((slide.value?.status as 'publish' | 'draft') ?? 'publish')
const saving  = ref(false)
const saved   = ref(false)
const saveErr = ref('')

const form = reactive({
  title:       slide.value?.title.rendered ?? '',
  subtitle:    slide.value?.slide_data?.subtitle ?? '',
  button_text: slide.value?.slide_data?.button_text ?? '',
  button_link: slide.value?.slide_data?.button_link ?? '',
  image_url:   slide.value?.slide_data?.image_url ?? '',
  order:       slide.value?.menu_order ?? 0,
})

const previewUrl = computed(() => form.image_url || slide.value?.featured_image_url || '')

async function save() {
  saving.value = true
  saved.value  = false
  saveErr.value = ''
  try {
    await $fetch(`/api/slide/${slide.value!.id}`, {
      method: 'PUT',
      body: {
        title:      form.title,
        status:     status.value,
        menu_order: form.order,
        meta: {
          pit_subtitle:    form.subtitle,
          pit_button_text: form.button_text,
          pit_button_link: form.button_link,
          pit_image_url:   form.image_url,
        },
      },
    })
    clearNuxtData('all-slides')
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (e: unknown) {
    saveErr.value = (e as Error)?.message ?? 'Fehler'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <div class="flex items-center justify-between">
      <NuxtLink to="/slider" class="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Zurück</NuxtLink>
      <div class="flex items-center gap-3">
        <div class="flex items-center bg-[#161b22] border border-white/10 rounded-md overflow-hidden">
          <button @click="status = 'draft'" class="px-3 py-1.5 text-xs font-medium transition-colors" :class="status === 'draft' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'">Inaktiv</button>
          <button @click="status = 'publish'" class="px-3 py-1.5 text-xs font-medium transition-colors" :class="status === 'publish' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-300'">Aktiv</button>
        </div>
        <button @click="save" :disabled="saving" class="px-4 py-2 rounded-md text-sm font-semibold transition-colors" :class="saved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'">
          {{ saved ? '✓ Gespeichert' : saving ? 'Speichern…' : 'Speichern' }}
        </button>
      </div>
    </div>

    <div v-if="saveErr" class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">{{ saveErr }}</div>

    <div class="pit-card px-5 py-5 space-y-4">
      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Titel</label>
        <input v-model="form.title" type="text" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
      </div>
      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Untertitel</label>
        <textarea v-model="form.subtitle" rows="2" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors resize-none" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Button-Text</label>
          <input v-model="form.button_text" type="text" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Button-Link</label>
          <input v-model="form.button_link" type="url" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Bild-URL</label>
          <input v-model="form.image_url" type="url" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Reihenfolge</label>
          <input v-model.number="form.order" type="number" min="0" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
      </div>
      <div v-if="previewUrl" class="rounded-md overflow-hidden border border-white/10 h-40">
        <img :src="previewUrl" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>
