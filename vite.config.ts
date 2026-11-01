import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const PORT = 2020
const PRODUCTION_URL = 'https://marmurdoku.vercel.app'

/**
 * Absolute origin of the deployed site. Crawlers reject relative og:image URLs,
 * so index.html carries %SITE_URL% placeholders resolved at build time. Defaults
 * to production rather than localhost: a build without env vars must still ship
 * shareable metadata.
 */
const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : PRODUCTION_URL)
).replace(/\/$/, '')

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'inject-site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: PORT,
    strictPort: true,
  },
  preview: {
    port: PORT,
    strictPort: true,
  },
})
