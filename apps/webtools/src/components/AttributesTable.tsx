import { FlowFileAttribute as FlowfileAttributeRowSchema } from '@nf2t/flowfiletools-js';

import { AlertColor, Button, ButtonGroup, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useMemo, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { Nf2tSnackbarProps, useNf2tSnackbar } from '../hooks/useNf2tSnackbar';
import { Link } from '@tanstack/react-router';
import { BodyRowComponentProps, Nf2tTableColumnSpec, useNf2tTable } from '../hooks/useNf2tTable';
import Nf2tTable from './Nf2tTable';
import { convertBytes } from '../utils/convertBytes';
import ExternalLink from './ExternalLink';
import { FlowFile, FlowFileResult } from '@nf2t/flowfiletools-js';
import { Link as MuiLink } from "@mui/material";

export interface AttributesTableProps extends Nf2tSnackbarProps {
    flowFile: FlowFileResult,
    setFlowFile: (newFlowFile: FlowFile) => void,
    canEdit: boolean,
}

type AttributesTableChildProps = {
    editIndex: number,
    setEditIndex: React.Dispatch<React.SetStateAction<number>>,
    flowFile: FlowFileResult,
    setFlowFile: (newValue: FlowFile) => void,
    deleteRow: (index: number) => void,
    submitSnackbarMessage: (message: string, type: AlertColor, data?: unknown) => void,
}

function AttributeValue({row}: {row: FlowfileAttributeRowSchema}) {
    const [key, value] = row;
    try {
        if(key === "uploadTime") {
            return (<>{value}</>);
        }
        else if(key === "lastModified") {
            return (<>{value}</>);
        } else if(key === "size") {
            return (<>{convertBytes(parseInt(value))}</>);
        } else if(key === "mime.type") {
            return (<ExternalLink href={`https://mimetype.io/${value}`}>{value}</ExternalLink>)
        }
    } catch(e) {
        console.error(e);
    }

    return (<>{value}</>);

}

function AttributeValueRow({childProps, row, rowIndex, filteredRowIndex, childProps: {flowFile, setFlowFile, submitSnackbarMessage, }}: BodyRowComponentProps<FlowfileAttributeRowSchema, AttributesTableChildProps>) {
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if(flowFile == undefined) {
            submitSnackbarMessage("No FlowFile provided", "error");
            return;
        }
        if(flowFile.status !== "success") {
            submitSnackbarMessage("No FlowFile provided", "error");
            return;
        }

        flowFile.attributes[rowIndex][1] = event.target.value;
        setFlowFile({
            status: "success",
            parentId: flowFile.parentId,
            content: flowFile.content,
            attributes: [...flowFile.attributes],
        })
        console.log("test")
    },[flowFile, rowIndex, setFlowFile, submitSnackbarMessage]);

    const isEditing = filteredRowIndex === childProps.editIndex;

    return (isEditing) ? (
        <TextField onChange={onChange} value={row[1]} />
    ) : (
        <AttributeValue row={row} />
    );
}

function FunctionsRow({childProps, rowIndex, filteredRowIndex, childProps: {deleteRow, setEditIndex}}: BodyRowComponentProps<FlowfileAttributeRowSchema, AttributesTableChildProps>) {
    const isEditing = filteredRowIndex === childProps.editIndex;
    return (    
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button onClick={() => deleteRow(rowIndex)} variant="outlined" startIcon={<DeleteIcon />}>Delete</Button>
            <Button 
                variant="outlined" 
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={() => {
                    const newEditIndex = isEditing ? -1 : filteredRowIndex;
                    setEditIndex(newEditIndex);
                }}
                >{isEditing ? "Save" : "Edit"}</Button>
        </ButtonGroup>   
    );
}

export function AttributesTable({flowFile, setFlowFile, submitSnackbarMessage, canEdit}: AttributesTableProps) {
    const snackbarProps = useNf2tSnackbar();
    const [ editIndex, setEditIndex ] = useState(-1);

    const deleteRow = useCallback((index: number) => {
        if(flowFile == undefined) {
            submitSnackbarMessage("No FlowFile", "error");
            return;
        }
        if(flowFile.status !== "success") {
            submitSnackbarMessage("No FlowFile", "error");
            return;
        }

        const deletedRows = flowFile.attributes.splice(index, 1);

        setFlowFile({
            status: "success",
            parentId: flowFile.parentId,
            content: flowFile.content,
            attributes: flowFile.attributes,
        })
        submitSnackbarMessage(`Deleted Attributes: ${deletedRows.map(x => x[0]).join(", ")}`, "info");
    }, [flowFile, setFlowFile, submitSnackbarMessage]);

    const childProps: AttributesTableChildProps = {
        flowFile, 
        setFlowFile,
        editIndex,
        setEditIndex,
        deleteRow,
        submitSnackbarMessage,
    }

    const columns: Nf2tTableColumnSpec<FlowfileAttributeRowSchema, AttributesTableChildProps>[] = useMemo(() => {
        const newColumns: Nf2tTableColumnSpec<FlowfileAttributeRowSchema, AttributesTableChildProps>[] = [
            {
                columnName: "Attribute Key",
                bodyRow: ({row}) => {
                    return (
                        <Link to="/attributesLookup" search={{ name: row[0] }}>
                            <MuiLink component="span">{row[0]}</MuiLink>
                        </Link>
                    )
                },
                rowToString: (row) => row[0],
            },
            {
                columnName: "Attribute Value",
                bodyRow: AttributeValueRow,
                rowToString: (row) => row[1],
            },
        ];

        if(canEdit) {
            newColumns.push({
                columnName: "Functions",
                rowToString: (row) => row[0],
                bodyRow: FunctionsRow,
                hideFilter: true,
            });
        }

        return newColumns;
    }, [canEdit]);

    const tableProps = useNf2tTable<FlowfileAttributeRowSchema, AttributesTableChildProps>({
        childProps: childProps,
        snackbarProps: snackbarProps,
        canEditColumn: false,
        columns: columns,
        rows: flowFile?.status === "success" ? (flowFile?.attributes || []): [],
    });

    return (
        <Nf2tTable {...tableProps} />
    )
}

export default AttributesTable;
