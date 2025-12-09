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
      yandexSecret: process.env.NUXT_PUBLIC_YANDEX_METRIKA_ID,
      siteUrl:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'https://estate-k1ex.vercel.app/',
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
        // Open Graph теги
        { property: 'og:title', content: 'EstateMetrics - Управление недвижимостью' },
        { property: 'og:description', content: 'Управление недвижимостью и инвестициями' },
        { property: 'og:image', content: '/favicon.png' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://estate-k1ex.vercel.app/' },
        { property: 'og:locale', content: 'ru_RU' },
        { property: 'og:site_name', content: 'EstateMetrics' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'canonical', href: 'https://estate-k1ex.vercel.app/' },
      ],
      script: [
        // JSON-LD для сайта
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'EstateMetrics',
            url: 'https://estate-k1ex.vercel.app/',
            description: 'Управление недвижимостью и инвестициями',
            publisher: {
              '@type': 'Organization',
              name: 'EstateMetrics',
              logo: {
                '@type': 'ImageObject',
                url: '/favicon.png',
              },
            },
          }),
        },
      ],
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
