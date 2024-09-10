import child_process from 'child_process';
import { GenerateFile } from 'vite-plugin-generate-file';

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

export default function generateBuildinfo(): GenerateFile {
    const jobId = process.env.GITHUB_JOB;
    let base = undefined;
    const repository = process.env.GITHUB_REPOSITORY;
    if (repository !== undefined) {
        const repositorySplit = repository.split("/");
        base = repositorySplit.length <= 0 ? undefined : repositorySplit[1];
    }

    const gitlog_text = child_process.execSync(`git log -1 --pretty=format:'{${gitShowPlaceholders.map(x => `"${x}": "%${x}"`).join(", ")}}'`)
    const gitlog = JSON.parse(gitlog_text.toString());

    for (const key of ["B", "b"]) {
        const value = child_process.execSync(`git log -1 --pretty=format:'%${key}'`);
        gitlog[key] = value.toString();
    }

    const buildinfo = {
        base,
        git: gitlog,
        github: {
            jobId,
            repository,
        },
    }

    return {
        type: 'json',
        output: './buildinfo.json',
        data: buildinfo,
    }
}