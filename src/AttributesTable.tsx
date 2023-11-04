import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { FlowfileAttributeRowSchema } from './schemas';
import { Button, ButtonGroup } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export interface AttributesTableProps {
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    submitAlert: (message: string) => void,
    canEdit: boolean,
}

export function AttributesTable(props: AttributesTableProps) {
    const deleteRow = (index: number) => {
        const deletedRows = props.rows.splice(index, 1);
        props.setRows(props.rows);
        props.submitAlert(`Deleted Attributes: ${deletedRows.map(x => x.key).join(", ")}`);
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
                        {props.rows.map((row, index) => (
                            <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">{row.key}</TableCell>
                                <TableCell>{row.value}</TableCell>
                                {props.canEdit &&
                                    <TableCell>
                                        <ButtonGroup variant="contained" aria-label="outlined primary button group">
                                            <Button onClick={() => deleteRow(index)} variant="outlined" startIcon={<DeleteIcon />}>Delete</Button>
                                            <Button variant="outlined" startIcon={<EditIcon />}>Edit</Button>
                                        </ButtonGroup>
                                    </TableCell>
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default AttributesTable;
