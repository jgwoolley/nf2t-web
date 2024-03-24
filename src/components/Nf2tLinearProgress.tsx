import { Box, LinearProgress } from "@mui/material";
import { useMemo, useState } from "react";

export type UpdateCurrentType = (current?: number, total?:number) => void;

export interface Nf2tLinearProgressProps {
    currentProgress?:number,
    setCurrentProgress: React.Dispatch<React.SetStateAction<number | undefined>>,
    totalProgress?:number,
    setTotalProgress: React.Dispatch<React.SetStateAction<number | undefined>>,
    updateCurrent: UpdateCurrentType,
}

export function useNf2tLinearProgress(): Nf2tLinearProgressProps{
    const [currentProgress, setCurrentProgress] = useState<number>();
    const [totalProgress, setTotalProgress] = useState<number>();

    const updateCurrent: UpdateCurrentType = (current, total) => {
        setCurrentProgress(current);
        setTotalProgress(total);
    }

    return {
        currentProgress, setCurrentProgress,
        totalProgress, setTotalProgress,
        updateCurrent,
    }
}

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