import { Box, LinearProgress } from "@mui/material";
import { useMemo } from "react";
import { Nf2tLinearProgressProps } from "../hooks/useNf2tLinearProgress";

export default function Nf2tLinearProgress({currentProgress, totalProgress}: Nf2tLinearProgressProps) {
    const value = useMemo(() => {
        if(currentProgress == undefined || totalProgress == undefined) {
            return -1;
        }

        return (currentProgress / totalProgress) * 100;

    }, [currentProgress, totalProgress])

    if(value < 0) {
        return null;
    }

    return (
        <Box sx={{display: "flex", alignItems: "cemter"}}>
            <Box sx={{width: "100%", mr: 1}}>
                <LinearProgress variant="determinate" value={value}/>
            </Box>
            <Box sx={{minWidth: 70}}>
                {Math.round(value)}% ({currentProgress}/{totalProgress})
            </Box>
        </Box>
    )
}