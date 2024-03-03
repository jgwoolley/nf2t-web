import { defineConfig } from 'vite'
import child_process from 'child_process';
import react from '@vitejs/plugin-react'
import generateFile from 'vite-plugin-generate-file'
import { VitePWA } from 'vite-plugin-pwa'

// TODO: Add B (raw body), b (body)

// https://git-scm.com/docs/git-show
const gitShowPlaceholders = [
  "H", "h",
  "T", "t",
  "P", "p",
  "an", "aN",
  "ae", "aE",
  "al", "aL",
  "ad", "aD",
  "ar",
  "at",
  "ai", "aI",
  "as",
  "ah",
  "cn", "cN",
  "ce", "cE",
  "cl", "cL",
  "cd", "cD",
  "cr",
  "ct",
  "ci", "cI",
  "cs",
  "ch",
  "d", "D",
  "f",
]

function generateBuildinfo() {
  const jobId = process.env.GITHUB_JOB;
  let base = undefined;
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository !== undefined) {
    const repositorySplit = repository.split("/");
    base = repositorySplit.length <= 0 ? undefined: repositorySplit[1];
  }

  const gitlog_text = child_process.execSync(`git log -1 --pretty=format:\'{${gitShowPlaceholders.map(x => `\"${x}\": \"%${x}\"`).join(", ")}}\'`)
  const gitlog = JSON.parse(gitlog_text.toString());
  return  {
    base,
    git: gitlog,
    github: {
      jobId, 
      repository, 
    }
  }
}

const buildinfo = generateBuildinfo();

// https://vitejs.dev/config/
export default defineConfig({
  base: buildinfo.base,
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
    generateFile([{
      type: 'json',
      output: './buildinfo.json',
      data: buildinfo,
    }]),
  ],
})
