import { Snackbar } from "@mui/material";
import CodeSnippet from "../components/CodeSnippet";
import ExternalLink from "../components/ExternalLink";
import NfftHeader, { routeDescriptions, sourceReferences } from "../components/NfftHeader";
import PrevNext from "../components/PrevNext";
import Spacing from "../components/Spacing";
import { useState } from "react";

export default function BuildProcess() {
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("No Message");

    const submitAlert = (message: string) => {
        setMessage(message);
        setOpenAlert(true);
    }

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenAlert(false);
    };

    return (
        <>
            <NfftHeader {...routeDescriptions.buildProcess}/>
            <ol>
                <li>Prerequisites</li>
                <ul>
                    <li>Have access to a linux/macOS/windows terminal.</li>
                    <li>Git is installed.</li>
                    <li>NPM is installed.</li>
                </ul>
                <li>Open your terminal to an optimal location for the code to be installed.</li>
                <li><ExternalLink href="https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository">Clone the following repository from GitHub</ExternalLink>.</li>
                <ol>
                    <li>GitHub Repository Link: <ExternalLink href={sourceReferences.GithubRepository.url}>{sourceReferences.GithubRepository.url}</ExternalLink>.</li>
                </ol>
                <li>Change directories into the newly created repository folder.</li>
                <ol>
                    <li><CodeSnippet submitAlert={submitAlert} code="cd Nifi-Flow-File-Helper" /></li>
                </ol>
                <li>Install the NPM dependencies.</li>
                <ol>
                    <li><CodeSnippet submitAlert={submitAlert} code="npm install" /></li>
                </ol>
                <li>Run the ViteJS development server.</li>
                <ol>
                    <li><CodeSnippet submitAlert={submitAlert}  code="npm run dev" /></li>
                    <li>This command does the following:</li>
                    <ol>
                        <li>Looks in "scripts" for "dev" <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/package.json">package.json</ExternalLink> and runs the <code>vite</code> command as a child process.</li>
                        <li>The <code>vite</code> plugin looks for <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/vite.config.ts">vite.config.ts</ExternalLink>, and runs that script.</li>
                        <ol>
                            <li>Runs <CodeSnippet submitAlert={submitAlert} code="git log" /> to get some build information, which will be writen to <code>buildinfo.json</code>, and read by the Web Site.</li>
                            <li>Runs the <ExternalLink href="https://vite-pwa-org.netlify.app/">VitePWA Plugin</ExternalLink> which creates files needed for the Web Site to be run as a PWA.</li>
                            <li>Runs the <code>react</code> ViteJS plugin to create a ReactJS website.</li>
                            <ol>
                                <li>Locates the <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/index.html">index.html</ExternalLink> file, and utilizes the referenced <ExternalLink href="https://github.com/jgwoolley/Nifi-Flow-File-Helper/blob/main/src/main.tsx">/src/main.tsx</ExternalLink> to create the website.</li>
                            </ol>
                        </ol>
                        <li>Runs the SPA as a website on your local computer. It will run in hot module replace mode, so any changes you make will immediately be deployed.</li>
                    </ol>
                </ol>
                <li>Build the ViteJS SPA.</li>
                <ol>
                    <li><CodeSnippet submitAlert={submitAlert} code="npm run build" /></li>
                    <li>Does everything in the "development server step", except it builds a SPA. This will not create a developer server, just the files needed to deploy the site.</li>
                </ol>
            </ol>
            <Spacing />

            <PrevNext prev={routeDescriptions.technologyTable} next={routeDescriptions.home}/>
            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={handleClose}
                message={message}
            />
        </>
    );
}