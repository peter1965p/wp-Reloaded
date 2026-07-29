<script setup lang="ts">
const { data: design } = await useAsyncData('design-tokens', () =>
  $fetch<Record<string, string>>(`${useRuntimeConfig().public.wpApiBase}/settings`)
    .catch(() => ({}))
)

useHead({
  style: computed(() => {
    const d = design.value ?? {}
    const primary = d.pit_primary_color || '#3b82f6'
    const accent  = d.pit_accent_color  || '#8b5cf6'
    const radius  = (d.pit_border_radius || '8') + 'px'
    const font    = d.pit_font_family   || 'Inter'

    return [{
      innerHTML: `
        @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap');
        :root {
          --pit-primary: ${primary};
          --pit-accent: ${accent};
          --pit-radius: ${radius};
          --pit-font: '${font}', system-ui, sans-serif;
        }
      `,
    }]
  }),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
