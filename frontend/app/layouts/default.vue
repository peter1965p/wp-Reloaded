<script setup lang="ts">
const route = useRoute()
const isOpen = ref(false)

const nav = [
  { label: 'Leistungen', to: '/#leistungen' },
  { label: 'Blog', to: '/blog' },
  { label: 'Über uns', to: '/#ueber-uns' },
  { label: 'Kontakt', to: '/#kontakt' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-pit-bg/80 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-lg bg-pit-blue flex items-center justify-center font-bold text-white text-sm group-hover:bg-pit-blue-h transition-colors">
            P
          </div>
          <span class="font-bold text-white text-sm tracking-tight">Päffgen <span class="text-pit-blue">IT</span></span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="px-3.5 py-2 rounded-md text-sm text-pit-sub hover:text-white hover:bg-white/5 transition-all"
          >
            {{ item.label }}
          </NuxtLink>
          <a
            href="/#kontakt"
            class="ml-3 pit-btn-primary !py-2 !px-4 !text-xs"
          >
            Projekt starten
          </a>
        </nav>

        <!-- Mobile toggle -->
        <button
          class="md:hidden p-2 rounded-md text-pit-sub hover:text-white hover:bg-white/5 transition-colors"
          @click="isOpen = !isOpen"
        >
          <svg v-if="!isOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isOpen" class="md:hidden border-t border-white/[0.06] bg-pit-bg px-6 py-4 space-y-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="block px-3 py-2.5 rounded-md text-sm text-pit-sub hover:text-white hover:bg-white/5 transition-all"
          @click="isOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 pt-16">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/[0.06] bg-pit-dark mt-20">
      <div class="max-w-6xl mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-2.5 mb-3">
              <div class="w-8 h-8 rounded-lg bg-pit-blue flex items-center justify-center font-bold text-white text-sm">P</div>
              <span class="font-bold text-white text-sm">Päffgen <span class="text-pit-blue">IT</span></span>
            </div>
            <p class="text-xs text-pit-muted leading-relaxed">
              Individuelle WordPress-Lösungen<br>aus der Vulkaneifel.
            </p>
          </div>

          <!-- Navigation -->
          <div>
            <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <div class="space-y-2">
              <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="block text-sm text-pit-muted hover:text-white transition-colors">
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>

          <!-- Legal -->
          <div>
            <h4 class="text-xs font-semibold text-white uppercase tracking-wider mb-3">Rechtliches</h4>
            <div class="space-y-2">
              <NuxtLink to="/impressum" class="block text-sm text-pit-muted hover:text-white transition-colors">Impressum</NuxtLink>
              <NuxtLink to="/datenschutz" class="block text-sm text-pit-muted hover:text-white transition-colors">Datenschutz</NuxtLink>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-pit-muted">© {{ new Date().getFullYear() }} Päffgen IT. Alle Rechte vorbehalten.</p>
          <p class="text-xs text-pit-muted/50">WP-2026 | V2.0 by Peter Päffgen</p>
        </div>
      </div>
    </footer>
  </div>
</template>
