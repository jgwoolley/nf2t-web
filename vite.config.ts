import { defineConfig } from 'vite'
import child_process from 'child_process';
import react from '@vitejs/plugin-react'
import generateFile from 'vite-plugin-generate-file'
import { VitePWA } from 'vite-plugin-pwa'

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
    VitePWA(),
    react(),
    generateFile([{
      type: 'json',
      output: './buildinfo.json',
      data: buildinfo,
    }]),
  ],
})
