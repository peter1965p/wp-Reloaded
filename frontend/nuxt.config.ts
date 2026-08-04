export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Server-only — läuft nie im Browser, damit gibt's kein Cross-Origin-Problem,
    // wenn WordPress und dieses Frontend auf unterschiedlichen Domains laufen.
    wpApiBase: 'http://localhost/wp-json/wp/v2',
    public: {
      siteUrl: 'http://localhost:3001',
    },
  },
  typescript: { strict: true },
  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },
})
