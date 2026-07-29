<script setup lang="ts">
definePageMeta({ title: 'Beitrag bearbeiten' })

const route = useRoute()
const router = useRouter()
const { fetchPost } = useWordPress()

const { data: post, error: fetchError } = await useAsyncData(
  `edit-${route.params.slug}`,
  () => fetchPost(route.params.slug as string)
)

if (fetchError.value) throw createError({ statusCode: 404, message: 'Beitrag nicht gefunden' })

const title      = ref(post.value?.title.rendered ?? '')
const content    = ref(post.value?.content.rendered ?? '')
const saving     = ref(false)
const saved      = ref(false)
const saveError  = ref('')

async function save() {
  if (!post.value) return
  saving.value    = true
  saved.value     = false
  saveError.value = ''
  try {
    await $fetch(`/api/post/${post.value.id}`, {
      method: 'PUT',
      body: { title: title.value, content: content.value },
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
  <div class="max-w-3xl space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <NuxtLink
        :to="`/posts/${route.params.slug}`"
        class="text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        ← Zurück
      </NuxtLink>
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

    <!-- Title -->
    <div class="bg-[#161b22] border border-white/10 rounded-[6px] px-5 py-4">
      <label class="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Titel</label>
      <input
        v-model="title"
        type="text"
        class="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 outline-none"
        placeholder="Beitragstitel…"
      />
    </div>

    <!-- Fehlermeldung -->
    <div v-if="saveError" class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[6px] text-sm text-red-400">
      {{ saveError }}
    </div>

    <!-- TipTap Editor -->
    <div>
      <label class="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Inhalt</label>
      <UiTipTapEditor v-model="content" />
    </div>
  </div>
</template>
