import { FlowfileAttributeRowSchema } from '../utils/schemas';
import { Button, ButtonGroup, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { Nf2tSnackbarProps } from './Nf2tSnackbar';
import { Link } from '@tanstack/react-router';
import Nf2tTable, { Nf2tTableColumnSpec, useNf2tTable } from './Nf2tTable';

export interface AttributesTableProps extends Nf2tSnackbarProps {
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    canEdit: boolean,
}

export function AttributesTable(props: AttributesTableProps) {
    const { rows, setRows, submitSnackbarMessage } = props;
    const [editIndex, setEditIndex] = useState(-1);
    const columns: Nf2tTableColumnSpec<FlowfileAttributeRowSchema>[] = useMemo(() => {
        const newColumns: Nf2tTableColumnSpec<FlowfileAttributeRowSchema>[] = [
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
                bodyRow: ({row, columnIndex, filteredColumnIndex}) => {
                    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                        const newRow: FlowfileAttributeRowSchema = {
                            key: row.key,
                            value: event.target.value,
                        }
                        rows[columnIndex] = newRow;
                        setRows([...rows]);
                    }
        
                    const isEditing = filteredColumnIndex === editIndex;
                    return (isEditing) ? (
                        <TextField onChange={onChange} defaultValue={row.value} />
                    ) : (
                        <>{row.value}</>
                    );
                },
                rowToString: (row) => row.value,
            },
        ];

        if(props.canEdit) {
            newColumns.push({
                columnName: "Functions",
                rowToString: (row) => row.key,
                bodyRow: ({columnIndex, filteredColumnIndex}) => {
                    const isEditing = filteredColumnIndex === editIndex;
                    return (    
                        <ButtonGroup variant="contained" aria-label="outlined primary button group">
                            <Button onClick={() => deleteRow(columnIndex)} variant="outlined" startIcon={<DeleteIcon />}>Delete</Button>
                            <Button onClick={() => setEditIndex(isEditing ? -1 : columnIndex)} variant="outlined" startIcon={isEditing ? <SaveIcon /> : <EditIcon />}>{isEditing ? "Save" : "Edit"}</Button>
                        </ButtonGroup>                 
                    )
                }
            });
        }

        return newColumns;
    }, [props.canEdit, setRows, rows])


    const deleteRow = (index: number) => {
        const deletedRows = rows.splice(index, 1);
        setRows([...rows]);
        submitSnackbarMessage(`Deleted Attributes: ${deletedRows.map(x => x.key).join(", ")}`, "info");
    }

    const tableProps = useNf2tTable<FlowfileAttributeRowSchema>({
        canEditColumn: false,
        columns: columns,
        rows: rows,
    });

    return (
        <Nf2tTable {...tableProps} />
    )
}

export default AttributesTable;
