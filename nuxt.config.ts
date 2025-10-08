export default defineNuxtConfig({
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
  modules: ['@pinia/nuxt', 'nuxt-quasar-ui'],
  quasar: {
    plugins: ['Notify', 'Dialog', 'Loading', 'LoadingBar'],
    extras: {
      fontIcons: ['material-icons'],
    },
  },
  css: ['~/assets/css/instant.css'],
});
