import { useState } from "react";
import useNarQuery from "../hooks/useQueryAllNf2tDB";
import { useNarDeleteAll } from "../hooks/useClear";
import useNarParse from "../hooks/useNarsParse";
import { ColorMode, Nf2tContext, Nf2tContextType } from "../hooks/useNf2tContext";
import { FlowFile } from "@nf2t/nifitools-js";
import { createTheme, ThemeProvider  } from "@mui/material/styles";
import { CssBaseline, PaletteMode } from "@mui/material";

const colorModeLut: Record<ColorMode, PaletteMode | undefined> = {
    dark: 'dark',
    light: 'light',
    system: undefined
}

export default function Nf2tContextProvider({children}: React.PropsWithChildren) {
    const queryResults = useNarQuery();
    const narsDeleteAll = useNarDeleteAll();
    const narsParse = useNarParse();
    const [reactRouterDebug, setReactRouterDebug] = useState<boolean>(false);
    const [unpackagedRows, setUnpackagedRows] = useState<FlowFile[]>([]);
    const [colorMode, setColorMode] = useState<ColorMode>("system");

    const theme = createTheme({
        palette: {
            mode: colorModeLut[colorMode],
        },    
    });

    const nf2tContext: Nf2tContextType = {
        queryResults,
        narsDeleteAll,
        narsParse: narsParse,
        reactRouterDebug, 
        setReactRouterDebug, 
        colorMode, 
        setColorMode,
        unpackagedRows,
        setUnpackagedRows,
    };


    return (
        <ThemeProvider theme={theme}>
            <Nf2tContext.Provider value={nf2tContext}>
                {children}
            </Nf2tContext.Provider>
            <CssBaseline />
        </ThemeProvider>
    )
}