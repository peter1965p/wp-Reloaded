<script setup lang="ts">
useSeoMeta({
  title: 'Päffgen IT — Individuelle WordPress-Lösungen aus der Vulkaneifel',
  description: 'Professionelle WordPress-Entwicklung, individuelle Webprojekte und IT-Beratung aus der Eifel.',
})

const config = useRuntimeConfig()
const base    = config.public.wpApiBase as string
const baseRoot = base.replace('/wp/v2', '')

interface Post {
  id: number; slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  date: string
  categories: number[]
}

interface Slide {
  id: number
  title: { rendered: string }
  status: string
  slide_data: { subtitle: string; button_text: string; button_link: string; image_url: string }
  featured_image_url: string | null
}

const [{ data: posts }, { data: slides }, { data: sliderStatus }] = await Promise.all([
  useAsyncData('home-posts', () =>
    $fetch<Post[]>(`${base}/posts?per_page=3&status=publish&_embed=1`)
  ),
  useAsyncData('home-slides', () =>
    $fetch<Slide[]>(`${base}/slides?per_page=20&orderby=menu_order&order=asc&status=publish`)
  ),
  useAsyncData('slider-status', () =>
    $fetch<{ enabled: boolean }>(`${baseRoot}/wp2026/v1/slider-status`).catch(() => ({ enabled: true }))
  ),
])

const leistungen = [
  {
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
    title: 'WordPress-Entwicklung',
    desc: 'Individuelle Themes, Plugins und komplette Website-Projekte — maßgeschneidert für dein Business.',
  },
  {
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12-1a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z',
    title: 'Headless CMS',
    desc: 'WordPress als leistungsstarkes Backend, dein Frontend in Nuxt oder Next.js — maximale Performance.',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'IT-Beratung',
    desc: 'Von der Konzeption bis zum Launch — technische Beratung und Planung für dein digitales Projekt.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Performance & SEO',
    desc: 'Optimierung für Ladezeit, Core Web Vitals und Suchmaschinen — damit deine Website gefunden wird.',
  },
]
</script>

<template>
  <div>
    <!-- Slider (wenn Slides vorhanden und global aktiviert) -->
    <HeroSlider v-if="slides?.length && sliderStatus?.enabled !== false" :slides="slides" />

    <!-- Hero -->
    <section class="relative overflow-hidden">
      <!-- Background glow -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div class="relative max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          IT-Lösungen aus der Vulkaneifel
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
          Websites die<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">wirklich funktionieren</span>
        </h1>

        <p class="text-lg text-pit-sub max-w-xl mx-auto mb-10 leading-relaxed">
          Individuelle WordPress-Entwicklung, Headless CMS und IT-Beratung — persönlich, zuverlässig, aus der Eifel.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="#kontakt" class="pit-btn-primary">
            Projekt starten
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </a>
          <a href="#leistungen" class="pit-btn-ghost">Leistungen ansehen</a>
        </div>

        <!-- Stats -->
        <div class="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div class="text-center">
            <p class="text-3xl font-bold text-white">10+</p>
            <p class="text-xs text-pit-muted mt-1">Projekte</p>
          </div>
          <div class="text-center border-x border-white/10">
            <p class="text-3xl font-bold text-white">100%</p>
            <p class="text-xs text-pit-muted mt-1">Individuell</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-white">1:1</p>
            <p class="text-xs text-pit-muted mt-1">Betreuung</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Leistungen -->
    <section id="leistungen" class="pit-section">
      <div class="text-center mb-12">
        <p class="text-xs font-semibold text-pit-blue uppercase tracking-widest mb-3">Was ich anbiete</p>
        <h2 class="text-3xl font-bold text-white">Leistungen</h2>
        <p class="text-pit-sub mt-3 max-w-lg mx-auto text-sm leading-relaxed">
          Von der kleinen Firmenwebsite bis zum komplexen Headless-Setup — ich begleite dich durch das gesamte Projekt.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(l, i) in leistungen"
          :key="i"
          class="pit-card p-6 hover:border-white/15 hover:bg-white/[0.02] transition-all duration-200"
        >
          <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-pit-blue" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" :d="l.icon"/>
            </svg>
          </div>
          <h3 class="font-semibold text-white text-sm mb-2">{{ l.title }}</h3>
          <p class="text-xs text-pit-sub leading-relaxed">{{ l.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Über uns -->
    <section id="ueber-uns" class="py-20 px-6 bg-pit-dark/50 border-y border-white/[0.05]">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-xs font-semibold text-pit-blue uppercase tracking-widest mb-3">Wer steckt dahinter</p>
          <h2 class="text-3xl font-bold text-white mb-5">Päffgen IT</h2>
          <p class="text-pit-sub text-sm leading-relaxed mb-4">
            Hallo, ich bin Peter — freiberuflicher Web-Entwickler und IT-Consultant aus der Vulkaneifel. Seit Jahren entwickle ich maßgeschneiderte WordPress-Projekte für kleine und mittelständische Unternehmen.
          </p>
          <p class="text-pit-sub text-sm leading-relaxed mb-8">
            Mein Ansatz: Kein Baukastensystem, kein One-Size-Fits-All. Jedes Projekt bekommt die Lösung, die es wirklich braucht — technisch sauber, performant und wartbar.
          </p>
          <a href="#kontakt" class="pit-btn-primary">Kontakt aufnehmen</a>
        </div>

        <!-- Feature list -->
        <div class="space-y-4">
          <div
            v-for="(f, i) in ['WordPress & Headless CMS', 'Nuxt.js / Next.js Frontend', 'Performance-Optimierung', 'SEO & Barrierefreiheit', 'Langfristige Betreuung']"
            :key="i"
            class="flex items-center gap-3 p-4 pit-card"
          >
            <div class="w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-sm text-pit-sub">{{ f }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog -->
    <section v-if="posts?.length" class="pit-section">
      <div class="flex items-center justify-between mb-10">
        <div>
          <p class="text-xs font-semibold text-pit-blue uppercase tracking-widest mb-2">Aktuelles</p>
          <h2 class="text-3xl font-bold text-white">Blog</h2>
        </div>
        <NuxtLink to="/blog" class="pit-btn-ghost !py-2 !px-4 !text-xs">
          Alle Beiträge →
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </section>

    <!-- Kontakt -->
    <section id="kontakt" class="py-20 px-6 bg-pit-dark/50 border-y border-white/[0.05]">
      <div class="max-w-2xl mx-auto text-center">
        <p class="text-xs font-semibold text-pit-blue uppercase tracking-widest mb-3">Bereit loszulegen?</p>
        <h2 class="text-3xl font-bold text-white mb-4">Lass uns reden</h2>
        <p class="text-pit-sub text-sm leading-relaxed mb-10">
          Du hast ein Projekt im Kopf? Schreib mir einfach — ich melde mich zeitnah zurück.
        </p>

        <div class="pit-card p-8 text-left">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs text-pit-muted uppercase tracking-wider mb-1.5">Name</label>
              <input
                type="text"
                placeholder="Max Mustermann"
                class="w-full bg-pit-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-pit-muted outline-none focus:border-pit-blue transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs text-pit-muted uppercase tracking-wider mb-1.5">E-Mail</label>
              <input
                type="email"
                placeholder="max@beispiel.de"
                class="w-full bg-pit-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-pit-muted outline-none focus:border-pit-blue transition-colors"
              />
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-xs text-pit-muted uppercase tracking-wider mb-1.5">Nachricht</label>
            <textarea
              rows="4"
              placeholder="Erzähl mir von deinem Projekt…"
              class="w-full bg-pit-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-pit-muted outline-none focus:border-pit-blue transition-colors resize-none"
            />
          </div>
          <button class="pit-btn-primary w-full justify-center">
            Nachricht senden
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
