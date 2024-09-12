import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generateFile, { GenerateFile } from 'vite-plugin-generate-file';
import { generateBuildinfo } from './scripts/generateBuildInfo';
import { fileURLToPath } from 'url';

const buildInfo = generateBuildinfo();

const buildInfoOptions: GenerateFile = {
  type: 'json',
  output: './buildinfo.json',
  data: buildInfo,
}

// https://vitejs.dev/config/
export default defineConfig({
  base: buildInfo.base,
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL("./src/extensions.ts", import.meta.url)),
    }
  },
  plugins: [
    react(),
    generateFile([
      buildInfoOptions,
    ]),
  ],
})
