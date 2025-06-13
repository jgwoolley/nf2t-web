import { createContext, useContext } from "react";
import { UseNarDeleteAll } from "../hooks/useClear";
import { UseNarsParseResult } from "../hooks/useNarsParse";
import { UseQueryAllNf2tDBResult } from "./useQueryAllNf2tDB";
import { FlowFileResults } from "@nf2t/flowfiletools-js";
import { UnpackagedFile } from "../utils/schemas";

export type ColorMode = "dark" | "light" | "system";

export type Nf2tContextType = {
    queryResults: UseQueryAllNf2tDBResult,
    narsDeleteAll: UseNarDeleteAll,
    narsParse: UseNarsParseResult,
    // attributes: NarAttributeLut,
    reactRouterDebug: boolean,
    setReactRouterDebug: React.Dispatch<React.SetStateAction<boolean>>,
    colorMode: ColorMode,
    setColorMode: React.Dispatch<React.SetStateAction<ColorMode>>,
    unpackagedFiles: UnpackagedFile[],
    setUnpackagedFiles: React.Dispatch<React.SetStateAction<UnpackagedFile[]>>,
    flowFileResults: FlowFileResults,
    setFlowFileResults: React.Dispatch<React.SetStateAction<FlowFileResults>>,
}

export const Nf2tContext = createContext<Nf2tContextType | null>(null);

export function useNf2tContext(): Nf2tContextType {
    const result = useContext(Nf2tContext);
    if(result == undefined) {
        throw new Error("Context was not created");
    }

    return result;
}