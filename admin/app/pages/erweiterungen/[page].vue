<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

definePageMeta({ title: 'Plugin-Einstellungen' })

const route  = useRoute()
const page   = computed(() => route.params.page as string)
const ready  = ref(false)
const error  = ref('')

const config    = useRuntimeConfig()
const wpBase    = config.public.wpApiBase
  .replace('/wp-json/wp/v2', '')
  .replace('/wp/v2', '')

const iframeSrc = computed(
  () => `${wpBase}/wp-admin/admin.php?page=${page.value}&pit_embed=1`
)

onMounted(async () => {
  try {
    await $fetch('/api/wp-admin-cookie')
    ready.value = true
  } catch {
    error.value = 'Authentifizierung fehlgeschlagen'
  }
})
</script>

<template>
  <!-- Kein eigenes Padding — iframe füllt den gesamten Hauptbereich -->
  <div class="absolute inset-0">
    <div v-if="error" class="flex items-center justify-center h-full text-red-400 text-sm">
      {{ error }}
    </div>
    <div v-else-if="!ready" class="flex items-center justify-center h-full gap-2 text-pit-muted text-sm">
      <RefreshCw class="w-4 h-4 animate-spin" />
      Plugin-Einstellungen werden geladen…
    </div>
    <iframe
      v-else
      :src="iframeSrc"
      class="w-full h-full border-0 bg-[#1d2330]"
    />
  </div>
</template>
