import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
  ssr: true,
  devServer: {
    port: 3000,
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://176.123.168.27:8085',
        changeOrigin: true,
        headers: {
          'X-API-Key': process.env.NUXT_API_SECRET || '',
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NODE_ENV === 'development' ? '/api' : 'http://176.123.168.27:8085',
      apiSecret: process.env.NUXT_API_SECRET,
    },
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
