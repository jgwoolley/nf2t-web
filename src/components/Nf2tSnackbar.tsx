import { Alert, AlertColor, Snackbar } from "@mui/material";
import { useState } from "react";

export type SubmitSnackbarMessageType = (message: string, data?: unknown) => void;
export type SubmitSnackbarErrorType = (message: string, error?: unknown) => void;
export type SnackbarHandleClose = (event: React.SyntheticEvent | Event, reason?: string) => void;

export interface Nf2tSnackbarProps {
    submitSnackbarMessage: SubmitSnackbarMessageType,
    submitSnackbarError: SubmitSnackbarErrorType,
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

    const submitSnackbarMessage: SubmitSnackbarMessageType = (message, data) => {
        console.log(data || message);
        setAlertColor("info");
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    }

    const submitSnackbarError: SubmitSnackbarErrorType = (message, error) => {
        console.error(error || message);
        setSnackbarMessage(message);
        setAlertColor("error");
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
        submitSnackbarError: submitSnackbarError,
        alertColor: alertColor,
        setAlertColor: setAlertColor,
        handleClose: handleClose,
    }
}

export default function Nf2tSnackbar({snackbarOpen, handleClose, snackbarMessage, alertColor}: Nf2tSnackbarResult) {
    return (
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleClose}
        >
            <Alert
                onClose={handleClose}
                severity={alertColor}
                variant="filled"
                sx={{width: "100%"}}
            >
                {snackbarMessage}
            </Alert>
        </Snackbar>
    )
}