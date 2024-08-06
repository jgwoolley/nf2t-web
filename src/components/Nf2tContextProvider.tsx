import { useState } from "react";
import useNarQuery from "../hooks/useQueryAllNf2tDB";
import { useNarDeleteAll } from "../hooks/useClear";
import useNarParse from "../hooks/useNarsParse";
import { Nf2tContext, Nf2tContextType } from "../hooks/useNf2tContext";

export default function Nf2tContextProvider({children}: React.PropsWithChildren) {
    const queryResults = useNarQuery();
    const narsDeleteAll = useNarDeleteAll();
    const narsParse = useNarParse();
    const [reactRouterDebug, setReactRouterDebug] = useState<boolean>(false);
    // const [colorMode, setColorMode] = useState<"light" | "dark">('light');

    const nf2tContext: Nf2tContextType = {
        queryResults,
        narsDeleteAll,
        narsParse: narsParse,
        reactRouterDebug, 
        setReactRouterDebug, 
        // colorMode, 
        // setColorMode,
    };


    return (
        <Nf2tContext.Provider value={nf2tContext}>
            {children}
        </Nf2tContext.Provider>

    )
}