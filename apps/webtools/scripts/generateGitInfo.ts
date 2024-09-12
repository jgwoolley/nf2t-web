import {execSync} from 'child_process';

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

export type GitInfo = Record<string, string>;

export function generateGitInfo() {
    const gitlog_text = execSync(`git log -1 --pretty=format:'{${gitShowPlaceholders.map(x => `"${x}": "%${x}"`).join(", ")}}'`)
    const gitlog: Record<string, string> = JSON.parse(gitlog_text.toString());

    for (const key of ["B", "b"]) {
        const value = execSync(`git log -1 --pretty=format:'%${key}'`);
        gitlog[key] = value.toString();
    }

    return gitlog;
}

export default generateGitInfo;