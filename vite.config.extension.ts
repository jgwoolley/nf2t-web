import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generateFile from 'vite-plugin-generate-file'
import generateBuildinfo from "./scripts/generateBuildInfo"
import { fileURLToPath } from 'url'

const buildinfo = generateBuildinfo();

// https://vitejs.dev/config/
export default defineConfig({
  base: buildinfo.data.base,
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL("./src/extensions.ts", import.meta.url)),
    }
  },
  plugins: [
    react(),
    generateFile([
      buildinfo,
      // await generateNarJson(),
    ]),
  ],
})
