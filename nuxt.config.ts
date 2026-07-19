import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false, // Client-side rendering only for stability in sandbox
  devtools: { enabled: false },

  future: {
    compatibilityVersion: 3
  },

  modules: [
    '@pinia/nuxt'
  ],

  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  css: [
    '~/assets/css/main.css'
  ],

  devServer: {
    port: 3000,
    host: '0.0.0.0'
  },

  app: {
    head: {
      title: 'Luvia - Premium Educational SaaS Platform',
      meta: [
        { name: 'description', content: 'World-class education experience' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' }
      ]
    }
  },

  compatibilityDate: '2026-07-18'
})
