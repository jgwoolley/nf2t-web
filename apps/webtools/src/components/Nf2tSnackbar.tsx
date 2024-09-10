import { Alert, Snackbar } from "@mui/material";
import { Nf2tSnackbarResult } from "../hooks/useNf2tSnackbar";

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