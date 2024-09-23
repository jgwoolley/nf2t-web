import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FlowFile } from "@nf2t/flowfiletools-js";

export interface AttributeDialogProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    flowFile: FlowFile | null,
    setFlowFile: React.Dispatch<React.SetStateAction<FlowFile | null>>,
}

const attributeDialogRow = z.object({
    key: z.string(),
    value: z.string(),
})

export type AttributeDialogRowSchema = z.infer<typeof attributeDialogRow>;

export function AttributeDialog(props: AttributeDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, },
    } = useForm<AttributeDialogRowSchema>({
        resolver: zodResolver(attributeDialogRow),
    });

    const handleClose = () => {
        props.setOpen(false);
        reset();
    };

    const onSubmit: SubmitHandler<AttributeDialogRowSchema> = (data) => {
        const {flowFile} = props;
        if(flowFile != undefined) {
            props.setFlowFile({
                status: "success",
                content: flowFile.content,
                attributes: [...flowFile.attributes, [data.key, data.value]],
            })
        }

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