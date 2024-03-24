import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { FlowfileAttributeRowSchema } from '../utils/schemas';
import { Button, ButtonGroup, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { Nf2tSnackbarProps } from './Nf2tSnackbar';
import { Link } from '@tanstack/react-router';

export interface AttributesTableProps extends Nf2tSnackbarProps {
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    canEdit: boolean,
}

interface AttributeRowProps extends AttributesTableProps {
    index: number,
    editIndex: number,
    setEditIndex: React.Dispatch<React.SetStateAction<number>>,
    row: FlowfileAttributeRowSchema,
    deleteRow: (index: number) => void,
}

function AttributeRow({ index, rows, row, canEdit, deleteRow, editIndex, setEditIndex, setRows }: AttributeRowProps) {
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRow: FlowfileAttributeRowSchema = {
            key: row.key,
            value: event.target.value,
        }
        rows[index] = newRow;
        setRows(rows);
    }

    const isEditing = index === editIndex;

    return (
        <TableRow
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row">
                <Link to="/lookupAttribute" search={{ name: row.key }}>
                    {row.key}
                </Link>
            </TableCell>
            <TableCell>
                {(isEditing) ? (
                    <TextField onChange={onChange} defaultValue={row.value} />
                ) : (
                    <>{row.value}</>
                )}
            </TableCell>
            {canEdit &&
                <TableCell>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button onClick={() => deleteRow(index)} variant="outlined" startIcon={<DeleteIcon />}>Delete</Button>
                        <Button onClick={() => setEditIndex(isEditing ? -1 : index)} variant="outlined" startIcon={isEditing ? <SaveIcon /> : <EditIcon />}>{isEditing ? "Save" : "Edit"}</Button>
                    </ButtonGroup>
                </TableCell>
            }
        </TableRow>
    )
}

export function AttributesTable(props: AttributesTableProps) {
    const [editIndex, setEditIndex] = useState(-1);

    const deleteRow = (index: number) => {
        const deletedRows = props.rows.splice(index, 1);
        props.setRows(props.rows);
        props.submitSnackbarMessage(`Deleted Attributes: ${deletedRows.map(x => x.key).join(", ")}`);
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Attribute Key</TableCell>
                            <TableCell>Attribute Value</TableCell>
                            {props.canEdit && <TableCell>Functions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.rows.map((row, index) =>
                            <AttributeRow
                                key={index}
                                index={index}
                                row={row}
                                deleteRow={deleteRow}
                                editIndex={editIndex}
                                setEditIndex={setEditIndex}
                                {...props}
                            />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default AttributesTable;
