export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    wpUser: '',
    wpAppPassword: '',
    public: {
      wpApiBase: 'http://localhost/wp-json/wp/v2',
    },
  },

  typescript: {
    strict: true,
  },
})
