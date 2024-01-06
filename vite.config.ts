import { defineConfig } from 'vite'
import path from 'node:path';
import fs from 'node:fs';
import child_process from 'child_process';
import react from '@vitejs/plugin-react'

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

function calculateGithub() {
  const jobId = process.env.GITHUB_JOB;
  let base = undefined;
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository !== undefined) {
    const repositorySplit = repository.split("/");
    base = repositorySplit.length <= 0 ? undefined: repositorySplit[1];
  }

  return {
    jobId, 
    repository, 
    base,
  };
}

const { jobId, repository, base } = calculateGithub()

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
  plugins: [
    react(),
    {
      name: "buildinfo",
      closeBundle: () => {
        const gitlog_path = path.join(__dirname, "dist", "buildinfo.json");
        const gitlog_text = child_process.execSync(`git log -1 --pretty=format:\'{${gitShowPlaceholders.map(x => `\"${x}\": \"%${x}\"`).join(", ")}}\'`)
        const gitlog = JSON.parse(gitlog_text.toString());
        const buildinfo = {
          git: gitlog,
          github: calculateGithub(),
        }

        fs.writeFileSync(gitlog_path, JSON.stringify(buildinfo));
      },
    }
  ],
})
