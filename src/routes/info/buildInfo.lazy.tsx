import CodeSnippet from "../../components/CodeSnippet";
import ExternalLink from "../../components/ExternalLink";
import Nf2tHeader from "../../components/Nf2tHeader";
import PrevNext from "../../components/PrevNext";
import Spacing from "../../components/Spacing";
import { useMemo } from "react";
import Slides, { Slide } from "../../components/Nf2tSlides";
import { createLazyRoute } from "@tanstack/react-router";
import { sourceReferences } from "../routeDescriptions";
import Nf2tSnackbar, { useNf2tSnackbar } from "../../components/Nf2tSnackbar";

export const Route = createLazyRoute("/buildInfo")({
    component: BuildProcess,
})

export default function BuildProcess() {
    const snackbarProps = useNf2tSnackbar();

    const slides: Slide[] = useMemo(() => [
        {
            alt: "Prerequisites",
            child: (
                <>
                    <p>Prerequisites</p>
                    <ul>
                        <li>Have access to a linux/macOS/windows terminal.</li>
                        <li>Git is installed.</li>
                        <li>NPM is installed.</li>
                    </ul>
                </>
            ),
        },
        {
            alt: "Open your terminal to an optimal location for the code to be installed."
        },
        {
            alt: "Clone the following repository from GitHub",
            child: (
                <>
                    <ExternalLink href="https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository">Clone the following repository from GitHub</ExternalLink>.
                    <ol>
                        <li>GitHub Repository Link: <ExternalLink href={sourceReferences.GithubRepository.url}>{sourceReferences.GithubRepository.url}</ExternalLink>.</li>
                    </ol>
                </>
            )
        },
        {
            alt: "Change directories into the newly created repository folder.",
            child: (
                <>
                    <p>Change directories into the newly created repository folder.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="cd Nifi-Flow-File-Helper" /></li>
                    </ol>
                </>
            )
        },
        {
            alt: "Install the NPM dependencies.",
            child: (
                <>
                    <p>Install the NPM dependencies.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="npm install" /></li>
                    </ol>
                </>
            )
        },
        {
            alt: "Run the ViteJS development server.",
            child: (
                <>
                    <p>Run the ViteJS development server.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="npm run dev" /></li>
                        <li>This command does the following:</li>
                        <ol>
                            <li>Looks in "scripts" for "dev" <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/package.json">package.json</ExternalLink> and runs the <code>vite</code> command as a child process.</li>
                            <li>The <code>vite</code> plugin looks for <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/vite.config.ts">vite.config.ts</ExternalLink>, and runs that script.</li>
                            <ol>
                                <li>Runs <CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="git log" /> to get some build information, which will be writen to <code>buildinfo.json</code>, and read by the Web Site.</li>
                                <li>Runs the <ExternalLink href="https://vite-pwa-org.netlify.app/">VitePWA Plugin</ExternalLink> which creates files needed for the Web Site to be run as a PWA.</li>
                                <li>Runs the <code>react</code> ViteJS plugin to create a ReactJS website.</li>
                                <ol>
                                    <li>Locates the <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/index.html">index.html</ExternalLink> file, and utilizes the referenced <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/src/main.tsx">/src/main.tsx</ExternalLink> to create the website.</li>
                                </ol>
                            </ol>
                            <li>Runs as a website on your local computer. It will run in hot module replace mode, so any changes you make will immediately be deployed.</li>
                        </ol>
                    </ol>
                </>
            )
        },
        {
            alt: "Build the ViteJS SPA.",
            child: (
                <>
                    <p>Build the ViteJS SPA.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="npm run build" /></li>
                        <li>Does everything in the "development server step", except it builds a SPA. This will not create a developer server, just the files needed to deploy the site.</li>
                    </ol>
                </>
            )
        }
    ], []);

    return (
        <>
            <Nf2tHeader to="/buildInfo" />
            <Slides slides={slides} />
            <Spacing />

            <PrevNext prev="/technologiesInfo" next="/" />
            <Nf2tSnackbar {...snackbarProps} />
        </>
    );
}