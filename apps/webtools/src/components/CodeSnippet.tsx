import { SubmitSnackbarMessageType } from '../hooks/useNf2tSnackbar';

export type CodeSnippetProps = {
    code: string,
    submitSnackbarMessage?: SubmitSnackbarMessageType,
}

export default function CodeSnippet({code, submitSnackbarMessage}: CodeSnippetProps) {
    const onClick = () => {
        navigator.clipboard.writeText(code);
        if(submitSnackbarMessage) {
            submitSnackbarMessage("Copied to clipboard.", "info");
        }
    }

    return (
        <code onClick={onClick} style={{cursor: "pointer"}}>{code}</code>
    )
}