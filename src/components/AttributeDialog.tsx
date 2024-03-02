import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { FlowfileAttributeRowSchema, flowfileAttributeRow, } from "../utils/schemas";
import { Dispatch, } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export interface AttributeDialogProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    rows: FlowfileAttributeRowSchema[],
    setRows: Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
}

export function AttributeDialog(props: AttributeDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, },
    } = useForm<FlowfileAttributeRowSchema>({
        resolver: zodResolver(flowfileAttributeRow),
    });

    const handleClose = () => {
        props.setOpen(false);
        reset();
    };

    const onSubmit: SubmitHandler<FlowfileAttributeRowSchema> = (data) => {
        props.setRows([...props.rows, data]);
        handleClose();
    }

    return (
            <Dialog open={props.open}>
                <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Add Attribute</DialogTitle>
                <DialogContent>
                    <DialogContentText>Add Attribute Key and Value.</DialogContentText>
                    <TextField
                        {...register("key", {required: true})}
                        autoFocus
                        margin="dense"
                        label="Key"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                    <span style={{color:"red"}}>{errors.key?.message}</span>
                    
                    <TextField
                        {...register("value", {required: true})}
                        margin="dense"
                        label="Value"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                    <span style={{color:"red"}}>{errors.key?.message}</span>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add Attribute</Button>
                </DialogActions>
                </form>
            </Dialog>
    )
}

export default AttributeDialog;