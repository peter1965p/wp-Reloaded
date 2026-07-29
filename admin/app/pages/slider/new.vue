<script setup lang="ts">
definePageMeta({ title: 'Neuer Slide' })

const router  = useRouter()
const saving  = ref(false)
const error   = ref('')
const status  = ref<'publish' | 'draft'>('publish')

const form = reactive({
  title:       '',
  subtitle:    '',
  button_text: '',
  button_link: '',
  image_url:   '',
  order:       0,
})

async function save() {
  if (!form.title.trim()) return
  saving.value = true
  error.value  = ''
  try {
    await $fetch('/api/slide', {
      method: 'POST',
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
    await router.push('/slider')
  } catch (e: unknown) {
    error.value = (e as Error)?.message ?? 'Fehler'
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
        <button @click="save" :disabled="saving || !form.title.trim()" class="px-4 py-2 rounded-md text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-40">
          {{ saving ? 'Speichern…' : 'Speichern' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">{{ error }}</div>

    <div class="pit-card px-5 py-5 space-y-4">
      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Titel *</label>
        <input v-model="form.title" type="text" autofocus placeholder="Slide-Titel…" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
      </div>
      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Untertitel / Beschreibung</label>
        <textarea v-model="form.subtitle" rows="2" placeholder="Kurze Beschreibung…" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors resize-none" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Button-Text</label>
          <input v-model="form.button_text" type="text" placeholder="z. B. Mehr erfahren" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Button-Link</label>
          <input v-model="form.button_link" type="url" placeholder="https://…" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Bild-URL</label>
          <input v-model="form.image_url" type="url" placeholder="https://… oder aus Medienbibliothek" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Reihenfolge</label>
          <input v-model.number="form.order" type="number" min="0" class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors" />
        </div>
      </div>
      <!-- Bildvorschau -->
      <div v-if="form.image_url" class="rounded-md overflow-hidden border border-white/10 h-40">
        <img :src="form.image_url" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>
