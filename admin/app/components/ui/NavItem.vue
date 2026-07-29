<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps<{ to: string; icon: string; label: string }>()

const icon = computed(() => {
  const key = props.icon as keyof typeof LucideIcons
  return LucideIcons[key] ?? LucideIcons.Circle
})
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
    active-class="!text-white !bg-blue-500/20 font-medium"
    exact-active-class="!text-white !bg-blue-500/20 font-medium"
  >
    <component :is="icon" :size="16" class="flex-shrink-0" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>
