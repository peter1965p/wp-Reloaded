<script setup lang="ts">
import { Wifi } from 'lucide-vue-next'

interface PluginMenuItem { title: string; page: string; icon: string }

const config      = useRuntimeConfig()
const wpAdminBase = config.public.wpApiBase.replace('/wp-json/wp/v2', '').replace('/wp/v2', '')

const { data: pluginMenu } = await useAsyncData<PluginMenuItem[]>(
  'plugin-menu',
  () => $fetch<PluginMenuItem[]>('/api/plugin-menu').catch(() => []),
)
</script>

<template>
  <div class="flex h-screen bg-pit-bg overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-56 flex-shrink-0 bg-pit-dark border-r border-white/10 flex flex-col">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div class="w-8 h-8 bg-pit-blue rounded-md flex items-center justify-center text-white font-black text-lg">P</div>
        <span class="font-bold text-white tracking-tight">Päffgen <span class="text-pit-blue">IT</span></span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <UiNavGroup label="Website">
          <UiNavItem to="/" icon="LayoutDashboard" label="Dashboard" />
          <UiNavItem to="/posts" icon="FileText" label="Beiträge" />
          <UiNavItem to="/seiten" icon="File" label="Seiten" />
          <UiNavItem to="/slider" icon="GalleryHorizontal" label="Slider" />
          <UiNavItem to="/media" icon="Image" label="Medien" />
        </UiNavGroup>
        <UiNavGroup label="Inhalt">
          <UiNavItem to="/categories" icon="Tag" label="Kategorien" />
          <UiNavItem to="/tags" icon="Hash" label="Tags" />
        </UiNavGroup>
        <UiNavGroup label="Design">
          <UiNavItem to="/themes" icon="Layers" label="Themes" />
          <UiNavItem to="/design" icon="Palette" label="Design" />
        </UiNavGroup>

        <!-- Dynamische Plugin-Menüs — intern, kein WP Admin -->
        <UiNavGroup v-if="pluginMenu?.length" label="Erweiterungen">
          <NuxtLink
            v-for="item in pluginMenu"
            :key="item.page"
            :to="`/erweiterungen/${item.page}`"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            active-class="!text-white !bg-blue-500/20 font-medium"
          >
            <component :is="'div'" class="w-4 h-4 flex-shrink-0 opacity-60">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
              </svg>
            </component>
            <span class="truncate">{{ item.title }}</span>
          </NuxtLink>
        </UiNavGroup>

        <UiNavGroup label="System">
          <UiNavItem to="/plugins" icon="Puzzle" label="Plugins" />
          <UiNavItem to="/settings" icon="Settings" label="Einstellungen" />
        </UiNavGroup>
      </nav>

    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="h-14 bg-pit-dark border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
        <h1 class="text-white font-semibold text-lg">{{ $route.meta.title ?? 'Dashboard' }}</h1>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <Wifi :size="13" class="text-emerald-400" />
          <span>WordPress API</span>
        </div>
      </header>

      <!-- Page content -->
      <main
        class="flex-1 overflow-hidden relative"
        :class="$route.path.startsWith('/erweiterungen/') ? '' : 'overflow-y-auto p-6'"
      >
        <slot />
      </main>

      <!-- Footer -->
      <footer class="flex-shrink-0 border-t border-white/[0.06] bg-pit-dark px-6 py-2.5 flex items-center justify-between">
        <p class="text-[11px] text-pit-muted/70">
          <span class="font-semibold text-white/60">WP-2026</span>
          <span class="mx-1.5 text-white/20">|</span>
          V2.0 · a Project by Peter Päffgen
          <span class="mx-1.5 text-white/20">·</span>
          © 2026 Manderscheid · Vulkaneifel
        </p>
        <div class="flex items-center gap-4">
          <a
            href="https://www.paeffgen-it.de"
            target="_blank"
            rel="noopener"
            class="text-[11px] text-pit-muted/50 hover:text-pit-muted transition-colors"
          >www.paeffgen-it.de</a>
          <!-- Notausgang -->
          <a
            :href="`${wpAdminBase}/wp-admin/`"
            target="_blank"
            rel="noopener"
            class="text-[9px] text-white/10 hover:text-white/25 transition-colors"
          >wp-admin</a>
        </div>
      </footer>
    </div>
  </div>
</template>
