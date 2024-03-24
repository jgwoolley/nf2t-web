import { createContext, useContext, useMemo, useState } from "react";
import { Nar, NarAttributeLuv, createAttributeLut } from "../utils/readNars";

export type Nf2tContextType = {
    nars: Nar[],
    setNars: React.Dispatch<React.SetStateAction<Nar[]>>,
    attributes: Map<string, NarAttributeLuv[]>,
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
    const [nars, setNars] = useState<Nar[]>([]);
    const attributes: Map<string, NarAttributeLuv[]> = useMemo(() => {
        const results = new Map<string, NarAttributeLuv[]>();
        nars.forEach((nar, nar_index) => {
            nar.extensions.forEach((extension, extension_index) => {
                createAttributeLut(results, extension, "readsAttributes", nar_index, extension_index);
                createAttributeLut(results, extension, "writesAttributes", nar_index, extension_index);
            })
        })

        return results;

    }, [nars])

    return (
        <Nf2tContext.Provider value={{nars, setNars, attributes}}>
            {children}
        </Nf2tContext.Provider>
    )
}