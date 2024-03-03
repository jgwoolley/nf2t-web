import { Alert, AlertColor, Snackbar } from "@mui/material";
import { useState } from "react";

export interface NfftSnackbarProps {
    submitSnackbarMessage: (message: string, data?: unknown) => void,
    submitSnackbarError: (message: string, error?: unknown) => void,
}
//submitSnackbarMessage, submitSnackbarError


export interface NfftSnackbarResult extends NfftSnackbarProps {
    snackbarOpen: boolean,
    setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>,
    snackbarMessage: string,
    setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>,
    alertColor: AlertColor,
    setAlertColor: React.Dispatch<React.SetStateAction<AlertColor>>,
    handleClose: (_event: React.SyntheticEvent | Event, reason?: string) => void,
}

export function useNfftSnackbar(): NfftSnackbarResult {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("No Message");
    const [alertColor, setAlertColor] = useState<AlertColor>("info");

    const submitSnackbarMessage = (message: string, data?: unknown) => {
        console.log(data || message);
        setAlertColor("info");
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    }

    const submitSnackbarError = (message: string, error?: unknown) => {
        console.error(error || message);
        setSnackbarMessage(message);
        setAlertColor("error");
        setSnackbarOpen(true);
    }

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
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

export default function NfftSnackbar({snackbarOpen, handleClose, snackbarMessage, alertColor}: NfftSnackbarResult) {
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