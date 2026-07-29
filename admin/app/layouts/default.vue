<script setup lang="ts">
import { Wifi, ExternalLink } from 'lucide-vue-next'

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

        <!-- Dynamische Plugin-Menüs -->
        <UiNavGroup v-if="pluginMenu?.length" label="Erweiterungen">
          <a
            v-for="item in pluginMenu"
            :key="item.page"
            :href="`${wpAdminBase}/wp-admin/admin.php?page=${item.page}`"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors group"
          >
            <ExternalLink :size="15" class="flex-shrink-0 opacity-60 group-hover:opacity-100" />
            <span class="truncate">{{ item.title }}</span>
          </a>
        </UiNavGroup>

        <UiNavGroup label="System">
          <UiNavItem to="/plugins" icon="Puzzle" label="Plugins" />
          <UiNavItem to="/settings" icon="Settings" label="Einstellungen" />
          <!-- WP Admin Direktlink -->
          <a
            :href="`${wpAdminBase}/wp-admin/`"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors group"
          >
            <ExternalLink :size="15" class="flex-shrink-0 opacity-60 group-hover:opacity-100" />
            <span>WP Admin</span>
          </a>
        </UiNavGroup>
      </nav>

      <!-- Footer -->
      <div class="px-5 py-4 border-t border-white/10">
        <p class="text-xs font-semibold text-white/80 tracking-tight">WP-2026 <span class="text-pit-muted font-normal">| V2.0</span></p>
        <p class="text-[10px] text-pit-muted mt-0.5">by Peter Päffgen</p>
      </div>
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
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
