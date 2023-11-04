import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const jobId = process.env.GITHUB_JOB;

let base = undefined;
const repository = process.env.GITHUB_REPOSITORY;
if (repository !== undefined) {
  const repositorySplit = repository.split("/");
  base = repositorySplit.length <= 0 ? undefined: repositorySplit[1];
}

console.log({jobId, repository, base});

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
  plugins: [react()],
})
