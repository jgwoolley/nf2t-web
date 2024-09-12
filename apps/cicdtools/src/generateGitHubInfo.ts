/**
 * @see https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
 */
export type GitHubInfo = {
    base?: string,
    GITHUB_JOB?: string,
    GITHUB_REPOSITORY?: string,
    GITHUB_SHA?: string,
    GITHUB_REF?: string,
    GITHUB_WORKFLOW?: string,
    GITHUB_ACTOR?: string,
    GITHUB_WORKSPACE?: string,
}

export function generateGitHubInfo(): GitHubInfo {
    const GITHUB_JOB = process.env.GITHUB_JOB;
    let base = undefined;
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    if (GITHUB_REPOSITORY !== undefined) {
        const repositorySplit = GITHUB_REPOSITORY.split("/");
        base = repositorySplit.length <= 0 ? undefined : repositorySplit[1];
    }

    return {
        base: base,
        GITHUB_JOB: GITHUB_JOB,
        GITHUB_REPOSITORY: GITHUB_REPOSITORY,
        GITHUB_SHA: process.env.GITHUB_SHA,
        GITHUB_REF: process.env.GITHUB_REF,
        GITHUB_WORKFLOW: process.env.GITHUB_WORKFLOW,
        GITHUB_ACTOR: process.env.GITHUB_ACTOR,
        GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE,
    }
}