import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generateFile from 'vite-plugin-generate-file'
import { VitePWA } from 'vite-plugin-pwa'
import generateBuildinfo from "./scripts/generateBuildInfo"

const buildinfo = generateBuildinfo();

// https://vitejs.dev/config/
export default defineConfig({
  base: buildinfo.data.base,
  plugins: [
    VitePWA({
      includeAssets: ['favicon.svg', '180.png', '512.svg'],
      manifest: {
        name: 'Nifi FlowFile Tools',
        short_name: 'FlowFile Tools',
        description: 'This is a ReactJS web app that will allow you to package and unpackage Apache Nifi FlowFiles. All the processing occurs in the browser locally.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }, 
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
        ]
      }
    }),
    react(),
    generateFile([
      buildinfo,
      // await generateNarJson(),
    ]),
  ],
})
