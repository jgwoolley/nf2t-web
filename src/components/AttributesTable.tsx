import { FlowfileAttributeRowSchema } from '../utils/schemas';
import { Button, ButtonGroup, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { Nf2tSnackbarProps, useNf2tSnackbar } from './Nf2tSnackbar';
import { Link } from '@tanstack/react-router';
import Nf2tTable, { BodyRowComponentProps, Nf2tTableColumnSpec, useNf2tTable } from './Nf2tTable';

export interface AttributesTableProps extends Nf2tSnackbarProps {
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    canEdit: boolean,
}

type AttributesTableChildProps = {
    editIndex: number,
    setEditIndex: React.Dispatch<React.SetStateAction<number>>,
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    deleteRow: (index: number) => void,
}

function AttributeValueRow({childProps, row, columnIndex, filteredRowIndex, childProps: {rows, setRows}}: BodyRowComponentProps<FlowfileAttributeRowSchema, AttributesTableChildProps>) {
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRow: FlowfileAttributeRowSchema = {
            key: row.key,
            value: event.target.value,
        }
        rows[columnIndex] = newRow;
        setRows([...rows]);
    }

    const isEditing = filteredRowIndex === childProps.editIndex;
    return (isEditing) ? (
        <TextField onChange={onChange} defaultValue={row.value} />
    ) : (
        <>{row.value}</>
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

export function AttributesTable(props: AttributesTableProps) {
    const snackbarProps = useNf2tSnackbar();
    const { rows, setRows, submitSnackbarMessage } = props;
    const [editIndex, setEditIndex] = useState(-1);

    const deleteRow = (index: number) => {
        const deletedRows = rows.splice(index, 1);
        setRows([...rows]);
        submitSnackbarMessage(`Deleted Attributes: ${deletedRows.map(x => x.key).join(", ")}`, "info");
    }

    const childProps: AttributesTableChildProps = {
        rows,
        setRows,
        editIndex,
        setEditIndex,
        deleteRow,
    }

    const columns: Nf2tTableColumnSpec<FlowfileAttributeRowSchema, AttributesTableChildProps>[] = useMemo(() => {
        const newColumns: Nf2tTableColumnSpec<FlowfileAttributeRowSchema, AttributesTableChildProps>[] = [
            {
                columnName: "Attribute Key",
                bodyRow: ({row}) => {
                    return (
                        <Link to="/attributesLookup" search={{ name: row.key }}>
                            {row.key}
                        </Link>
                    )
                },
                rowToString: (row) => row.key,
            },
            {
                columnName: "Attribute Value",
                bodyRow: AttributeValueRow,
                rowToString: (row) => row.value,
            },
        ];

        if(props.canEdit) {
            newColumns.push({
                columnName: "Functions",
                rowToString: (row) => row.key,
                bodyRow: FunctionsRow,
                hideFilter: true,
            });
        }

        return newColumns;
    }, [props.canEdit, setRows, rows])

    const tableProps = useNf2tTable<FlowfileAttributeRowSchema, AttributesTableChildProps>({
        childProps: childProps,
        snackbarProps: snackbarProps,
        canEditColumn: false,
        columns: columns,
        rows: rows,
    });

    return (
        <Nf2tTable {...tableProps} />
    )
}

export default AttributesTable;
