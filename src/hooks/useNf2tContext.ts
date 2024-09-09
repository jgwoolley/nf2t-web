import { createContext, useContext } from "react";
import { UseNarDeleteAll } from "../hooks/useClear";
import { UseNarsParseResult } from "../hooks/useNarsParse";
import { UseQueryAllNf2tDBResult } from "./useQueryAllNf2tDB";
import { BulkUnpackageRow } from "../utils/downloadAllUnpackaged";

export type Nf2tContextType = {
    queryResults: UseQueryAllNf2tDBResult,
    narsDeleteAll: UseNarDeleteAll,
    narsParse: UseNarsParseResult,
    // attributes: NarAttributeLut,
    reactRouterDebug: boolean,
    setReactRouterDebug: React.Dispatch<React.SetStateAction<boolean>>,
    // colorMode: "light" | "dark",
    // setColorMode: React.Dispatch<React.SetStateAction<"light" | "dark">>,

    unpackagedRows: BulkUnpackageRow[]
    setUnpackagedRows: React.Dispatch<React.SetStateAction<BulkUnpackageRow[]>>,
}

export const Nf2tContext = createContext<Nf2tContextType | null>(null);

export function useNf2tContext(): Nf2tContextType {
    const result = useContext(Nf2tContext);
    if(result == undefined) {
        throw new Error("Context was not created");
    }

    return result;
}