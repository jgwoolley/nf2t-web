export type CodeSnippetProps = {
    code: string,
    submitAlert?: (message: string) => void,
}

export default function CodeSnippet({code, submitAlert}: CodeSnippetProps) {
    const onClick = () => {
        navigator.clipboard.writeText(code);
        if(submitAlert) {
            submitAlert("Copied to clipboard.");
        }
    }

    return (
        <code onClick={onClick} style={{cursor: "pointer"}}>{code}</code>
    )
}