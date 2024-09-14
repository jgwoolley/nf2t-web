import { Link } from "@mui/material"


export type ExternalLinkProps = React.PropsWithChildren<{ 
    href: string, 
    style?: React.CSSProperties | undefined,
}>

export default function ExternalLink({ href, children, style }: ExternalLinkProps) {
    return <Link
        style={style}
        target="_blank"
        rel="noopener"
        href={href}
    >
        {children}
    </Link>
}