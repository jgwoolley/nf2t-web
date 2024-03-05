import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import NfftHeader, { routeDescriptions } from "../components/NfftHeader";
import Spacing from "../components/Spacing";
import ExternalLink from "../components/ExternalLink";
import PrevNext from "../components/PrevNext";

type Techonology = {
    href : string,
    key: string,
    group: string,
    description: string,
}

const techologies: Techonology[] = [
    {
        href: "https://nifi.apache.org/docs.html",
        key: "Apache Nifi",
        group: "Apache Nifi",
        description: "Apache NiFi automates the flow of data between system."
    },
    {
        href: "https://nifi.apache.org/docs/nifi-docs/html/nifi-in-depth.html#life-of-a-flowfile",
        key: "FlowFile",
        group: "Apache Nifi",
        description: "A FlowFile represents a file's content, and metadata as it flows through Apache Nifi."
    },
    {
        href: "https://en.wikipedia.org/wiki/HTML",
        key: "HTML",
        group: "Web Technology",
        description: "HyperText Markup Language or HTML is the standard markup language for documents designed to be displayed in a web browser."
    },
    {
        href: "https://en.wikipedia.org/wiki/JavaScript",
        key: "JavaScript",
        group: "Web Technology",
        description: "a programming language which can be embedded within HTML webpages to allow dynamic content."
    },
    {
        href: "https://en.wikipedia.org/wiki/TypeScript",
        key: "TypeScript",
        group: "Web Technology",
        description: "a programming language which adds static typing with optional type annotations to JavaScript, TypeScript must be compiled into JavaScript for it to be used in a browser."
    },
    {
        href: "https://en.wikipedia.org/wiki/Static_web_page",
        key: "Static Web Page",
        group: "Web Technology",
        description: "A web page that is delivered to the web browser exactly as it is stored, as opposed to dynamic web pages which require a server to create the page upon request.",
    },
    {
        href: "https://en.wikipedia.org/wiki/CI/CD",
        key: "CI/CD",
        group: "CI/CD",
        description: "Continuous Integration / Continuous Delivery automates the testing and deployment of software."
    },
    {
        href: "https://github.com/features/actions",
        key: "GitHub Actions",
        group: "CI/CD",
        description: "A GitHub repository can be configured to run a CI/CD build pipeline.",
    },
    {
        href: "https://pages.github.com/",
        key: "GitHub Pages",
        group: "CI/CD",
        description: "GitHub Actions can be configured to deploy Static Web Pages.",
    },
    {
        href: "https://en.wikipedia.org/wiki/Single-page_application",
        key: "SPA",
        group: "Web Technology",
        description: "A single-page application (SPA) is a web application or website that interacts with the user by dynamically rewriting the current web page with new data from the web server, instead of the default method of a web browser loading entire new pages."
    },
    {
        href: "https://en.wikipedia.org/wiki/React_(software)",
        key: "ReactJS",
        group: "Web Technology",
        description: "A Javascript framework for creating Web Sites that are responsive to users.",
    },
    {
        href: "https://en.wikipedia.org/wiki/Package_manager",
        key: "Package Manager",
        group: "Programming Technology",
        description: "Enables a programer to install other developers software for use in their project.",
    },
    {
        href: "https://en.wikipedia.org/wiki/Npm",
        key: "Npm",
        group: "Web Technology",
        description: "Node Package Manager is a package manager for JavaScript.",
    },
    {
        href: "https://en.wikipedia.org/wiki/Vite_(software)",
        key: "ViteJS",
        group: "Web Technology",
        description: "A Javascript build tool / bundler which builds the \"Nifi FlowFile Tools\" Static Web Page.",
    },
    {
        href: "https://tanstack.com/router/latest",
        key: "Tanstack Router",
        group: "Web Technology", 
        description: "A ReactJS Router which enabled SPA features.",
    },
];

export default function TechnologyTable() {
    return (
        <>
            <NfftHeader {...routeDescriptions.technologyTable}/>

            <Typography>
                The following techologies / concepts are important for understanding the motivation / implementation of this project.
            </Typography>
            <Spacing />

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Technology</TableCell>
                        <TableCell>Group</TableCell>
                        <TableCell>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {techologies.map((techology, index) => (
                        <TableRow key={index}>
                            <TableCell><ExternalLink href={techology.href}>{techology.key}</ExternalLink></TableCell>
                            <TableCell>{techology.group}</TableCell>
                            <TableCell>{techology.description}</TableCell>
                        </TableRow>   
                    ))}
                </TableBody>
            </Table>

            <Spacing />

            <PrevNext prev={routeDescriptions.home} next={routeDescriptions.buildProcess}/>
        </>
    )
}