import { AlertColor } from "@mui/material";
import { useState } from "react";

export type SubmitSnackbarMessageType = (message: string, type: AlertColor, data?: unknown) => void;
export type SnackbarHandleClose = (event: React.SyntheticEvent | Event, reason?: string) => void;

export interface Nf2tSnackbarProps {
    submitSnackbarMessage: SubmitSnackbarMessageType,
}
//submitSnackbarMessage, submitSnackbarError

export interface Nf2tSnackbarResult extends Nf2tSnackbarProps {
    snackbarOpen: boolean,
    setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>,
    snackbarMessage: string,
    setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>,
    alertColor: AlertColor,
    setAlertColor: React.Dispatch<React.SetStateAction<AlertColor>>,
    handleClose: SnackbarHandleClose,
}

export function useNf2tSnackbar(): Nf2tSnackbarResult {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("No Message");
    const [alertColor, setAlertColor] = useState<AlertColor>("info");

    const submitSnackbarMessage: SubmitSnackbarMessageType = (message, type, data) => {
        console.log(data || message);
        setAlertColor(type);
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    }

    const handleClose: SnackbarHandleClose = (_event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbarOpen(false);
    };

    return {
        snackbarOpen: snackbarOpen,
        setSnackbarOpen: setSnackbarOpen,
        snackbarMessage: snackbarMessage,
        setSnackbarMessage: setSnackbarMessage,
        submitSnackbarMessage: submitSnackbarMessage,
        alertColor: alertColor,
        setAlertColor: setAlertColor,
        handleClose: handleClose,
    }
}
