import { generateGitHubInfo, GitHubInfo } from "./generateGitHubInfo";
import generateGitInfo, { GitInfo } from "./generateGitInfo";
import { generateNodeVersions } from "./generateNodeVersions";

export type BuildInfo = {
    base?: string,
    git: GitInfo,
    github: GitHubInfo,
    node: NodeJS.ProcessVersions,
}

export function generateBuildinfo() {
    const git = generateGitInfo();
    const github = generateGitHubInfo();
    const node = generateNodeVersions();

    const base = github.base;

    const buildinfo: BuildInfo = {
        base,
        git: git,
        github: github,
        node: node,
    }

    return buildinfo;
}

export default generateBuildinfo;