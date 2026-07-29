<script setup lang="ts">
definePageMeta({ title: 'Neuer Beitrag' })

const router = useRouter()

const title     = ref('')
const content   = ref('')
const status    = ref<'publish' | 'draft'>('draft')
const saving    = ref(false)
const saveError = ref('')

async function save() {
  if (!title.value.trim()) return
  saving.value    = true
  saveError.value = ''
  try {
    const post = await $fetch('/api/post', {
      method: 'POST',
      body: { title: title.value, content: content.value, status: status.value },
    }) as { slug: string }
    clearNuxtData('all-posts')
    await router.push(`/posts/${post.slug}`)
  } catch (e: unknown) {
    saveError.value = (e as Error)?.message ?? 'Fehler beim Erstellen'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <NuxtLink to="/posts" class="text-sm text-slate-500 hover:text-slate-300 transition-colors">
        ← Zurück
      </NuxtLink>
      <div class="flex items-center gap-3">
        <!-- Status Toggle -->
        <div class="flex items-center bg-[#161b22] border border-white/10 rounded-md overflow-hidden">
          <button
            @click="status = 'draft'"
            class="px-3 py-1.5 text-xs font-medium transition-colors"
            :class="status === 'draft' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'"
          >
            Entwurf
          </button>
          <button
            @click="status = 'publish'"
            class="px-3 py-1.5 text-xs font-medium transition-colors"
            :class="status === 'publish' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-300'"
          >
            Veröffentlichen
          </button>
        </div>
        <button
          @click="save"
          :disabled="saving || !title.trim()"
          class="px-4 py-2 rounded-md text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-40"
        >
          {{ saving ? 'Speichern…' : 'Speichern' }}
        </button>
      </div>
    </div>

    <!-- Title -->
    <div class="bg-[#161b22] border border-white/10 rounded-[6px] px-5 py-4">
      <label class="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Titel</label>
      <input
        v-model="title"
        type="text"
        autofocus
        class="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 outline-none"
        placeholder="Beitragstitel…"
        @keydown.ctrl.enter="save"
      />
    </div>

    <!-- Fehlermeldung -->
    <div v-if="saveError" class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">
      {{ saveError }}
    </div>

    <!-- Editor -->
    <div>
      <label class="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Inhalt</label>
      <UiTipTapEditor v-model="content" />
    </div>
  </div>
</template>
