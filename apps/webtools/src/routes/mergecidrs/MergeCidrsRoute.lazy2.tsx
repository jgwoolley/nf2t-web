import Nf2tHeader from "../../components/Nf2tHeader";
import { createLazyRoute } from "@tanstack/react-router";
import { TextareaAutosize } from '@mui/material';
import { useMemo, useState } from "react";
import { deduplicateCIDRs } from "./mergeCidrs";

export const Route = createLazyRoute("/mergecidrs")({
    component: Nf2tHome,
})

export default function Nf2tHome() {
    const [inputArea, setInputArea] = useState<string>("1.1.0.0/24\n1.1.0.0/16\n");
    const cidrs = useMemo(() => {
        const sortedCidrs = deduplicateCIDRs(inputArea.split("\n"));
        return sortedCidrs;
    },[inputArea]);

    return (
        <>
            <Nf2tHeader to="/mergecidrs" />
            <TextareaAutosize value={inputArea} onChange={(e) => {
                setInputArea(e.target.value);
            }}/>
            <ul>
                {cidrs.map((x, index) => <li key={index}>{x}</li>)}
            </ul>
        </>
    )
}