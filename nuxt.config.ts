import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET || 'mysecretapikey123',
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://176.123.168.27:8085',
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'EstateMetrics',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Управление недвижимостью и инвестициями' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    },
  },
  typescript: {
    typeCheck: true,
  },
  modules: ['@pinia/nuxt', 'nuxt-quasar-ui', '@vueuse/nuxt'],
  quasar: {
    plugins: ['Notify', 'Dialog', 'Loading', 'LoadingBar'],
    extras: {
      fontIcons: ['material-icons'],
    },
  },
  css: ['~/assets/css/instant.css'],
});
