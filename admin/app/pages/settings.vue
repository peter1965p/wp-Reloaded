<script setup lang="ts">
definePageMeta({ title: 'Einstellungen' })

interface WpSettings {
  title: string
  description: string
  url: string
  email: string
  timezone: string
}

const { data: settings, error: fetchError } = await useAsyncData('wp-settings', () =>
  $fetch<WpSettings>('/api/settings')
)

const form = reactive({
  title: settings.value?.title ?? '',
  description: settings.value?.description ?? '',
  url: settings.value?.url ?? '',
  email: settings.value?.email ?? '',
  timezone: settings.value?.timezone ?? '',
})

const saving    = ref(false)
const saved     = ref(false)
const saveError = ref('')

async function save() {
  saving.value    = true
  saved.value     = false
  saveError.value = ''
  try {
    await $fetch('/api/settings', {
      method: 'POST',
      body: {
        title: form.title,
        description: form.description,
        url: form.url,
        email: form.email,
        timezone: form.timezone,
      },
    })
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (e: unknown) {
    saveError.value = (e as Error)?.message ?? 'Fehler beim Speichern'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <div v-if="fetchError" class="pit-card px-5 py-4 text-red-400 text-sm">
      Einstellungen konnten nicht geladen werden.
    </div>

    <div v-else class="pit-card px-5 py-6 space-y-5">
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <h2 class="font-semibold text-white">Website-Einstellungen</h2>
        <button
          @click="save"
          :disabled="saving"
          class="px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          :class="saved
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'"
        >
          {{ saved ? '✓ Gespeichert' : saving ? 'Speichern…' : 'Speichern' }}
        </button>
      </div>

      <div v-if="saveError" class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">
        {{ saveError }}
      </div>

      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Website-Titel</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Tagline / Beschreibung</label>
        <input
          v-model="form.description"
          type="text"
          class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Website-URL</label>
        <input
          v-model="form.url"
          type="url"
          class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Admin-E-Mail</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Zeitzone</label>
        <input
          v-model="form.timezone"
          type="text"
          placeholder="z. B. Europe/Berlin"
          class="w-full bg-[#05070a] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-pit-blue transition-colors"
        />
      </div>
    </div>
  </div>
</template>
