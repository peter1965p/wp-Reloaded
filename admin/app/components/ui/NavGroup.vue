<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="mb-4">
    <p class="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{{ label }}</p>
    <slot />
  </div>
</template>
