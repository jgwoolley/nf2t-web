import { useState } from "react";

export type UpdateCurrentType = (current?: number, total?:number) => void;

export interface Nf2tLinearProgressProps {
    currentProgress?:number,
    setCurrentProgress: React.Dispatch<React.SetStateAction<number | undefined>>,
    totalProgress?:number,
    setTotalProgress: React.Dispatch<React.SetStateAction<number | undefined>>,
    updateCurrent: UpdateCurrentType,
}

export default function useNf2tLinearProgress(): Nf2tLinearProgressProps{
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