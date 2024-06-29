import { createContext, useContext, useMemo, useState } from "react";
import { NarAttributeLut, Nars, createAttributeLut } from "../utils/readNars";

export type Nf2tContextType = {
    nars: Nars,
    setNars: React.Dispatch<React.SetStateAction<Nars>>,
    attributes: NarAttributeLut,
    reactRouterDebug: boolean,
    setReactRouterDebug: React.Dispatch<React.SetStateAction<boolean>>,
    // colorMode: "light" | "dark",
    // setColorMode: React.Dispatch<React.SetStateAction<"light" | "dark">>,
}

export const Nf2tContext = createContext<Nf2tContextType | null>(null);

export function useNf2tContext(): Nf2tContextType{
    const result = useContext(Nf2tContext);
    if(result == undefined) {
        throw new Error("Context was not created");
    }

    return result;
}

export default function Nf2tContextProvider({children}: React.PropsWithChildren) {
    const [nars, setNars] = useState<Nars>([]);
    const [reactRouterDebug, setReactRouterDebug] = useState<boolean>(false);
    // const [colorMode, setColorMode] = useState<"light" | "dark">('light');

    const attributes: NarAttributeLut = useMemo(() => {
        const results: NarAttributeLut = new Map();
        nars.forEach((nar, nar_index) => {
            nar.extensions.forEach((extension, extension_index) => {
                createAttributeLut(results, extension, "readsAttributes", nar_index, extension_index);
                createAttributeLut(results, extension, "writesAttributes", nar_index, extension_index);
            })
        })

        return results;

    }, [nars])

    const nf2tContext: Nf2tContextType = {
        nars, setNars, attributes, reactRouterDebug, setReactRouterDebug, 
        // colorMode, 
        // setColorMode,
    };

    return (
        <Nf2tContext.Provider value={nf2tContext}>
            {children}
        </Nf2tContext.Provider>
    )
}