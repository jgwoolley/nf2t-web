import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from "@mui/material";
import { ReactNode, useMemo, useState } from "react";

export interface Nf2tTableColumnSpec<R> {
    columnName: string,
    createBodyRow: (row: R) => ReactNode,
    rowToString: (row: R) => string,
    compareFn?: (a: R, b: R) => number,
}

export interface Nf2tTableColumn<R> extends Nf2tTableColumnSpec<R> {
    sortDirection: "asc" | "desc" | "ignored",
    filter: string,
}

export interface Nf2tTableParams<R> {
    columns: Nf2tTableColumnSpec<R>[],
    rows: R[],
}

export interface Nf2tTableProps<R> {
    columns: Nf2tTableColumn<R>[],
    setColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn<R>[]>>,
    rows: R[],
}

function createColumn<R>(column: Nf2tTableColumnSpec<R>): Nf2tTableColumn<R> {
    return {
        ...column,
        sortDirection: "ignored",
        filter: "",
    }
}

export function useNf2tTable<R>({ rows, columns: incomingColumns }: Nf2tTableParams<R>): Nf2tTableProps<R> {
    const [columns, setColumns] = useState<Nf2tTableColumn<R>[]>(incomingColumns.map(createColumn));

    return {
        columns,
        setColumns,
        rows,
    }
}

export default function <R>({ columns, setColumns, rows }: Nf2tTableProps<R>) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState<Nf2tTableColumn<R>>();

    const handleClickOpen = (column: Nf2tTableColumn<R>) => {
        setActiveColumn(column);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredRows = useMemo(
        () => {
            let newRows = rows;

            for (let index = 0; index < columns.length; index++) {
                const column = columns[index];
                const {filter} = column;
                if( filter.length <= 0) {
                    continue;
                }

                newRows = newRows.filter((row) => column.rowToString(row).match(column.filter));
            }

            for (let index = 0; index < columns.length; index++) {
                const column = columns[index];
                const { sortDirection, compareFn } = column;
                if (compareFn == undefined || sortDirection === "ignored") {
                    continue;
                }
                newRows = newRows.sort(sortDirection === "asc" ? compareFn : (a, b) => compareFn(b, a));
            }
            return [...newRows];
        },
        [columns, rows],
    )

    const visibleRows = useMemo(
        () => filteredRows.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        ),
        [filteredRows, page, rowsPerPage],
    );


    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column, columnIndex) => (
                                <TableCell
                                    key={columnIndex}
                                    sortDirection={column.sortDirection === "ignored" ? false : column.sortDirection}
                                    onClick={() => handleClickOpen(column)}
                                >
                                    {column.compareFn == undefined ? (
                                        <>{column.columnName}{column.filter.length > 0 && " *"}</>
                                    ) : (
                                        <TableSortLabel
                                            active={column.sortDirection !== "ignored"}
                                            direction={column.sortDirection === "ignored" ? undefined : column.sortDirection}
                                        >
                                            {column.columnName}{column.filter.length > 0 && " *"}
                                        </TableSortLabel>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map((column, columnIndex) => (
                                    <TableCell key={columnIndex}>
                                        {column.createBodyRow(row)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{activeColumn?.columnName}</DialogTitle>
                <DialogContent>
                    {activeColumn?.compareFn != undefined && (
                        <>
                            <InputLabel id="demo-simple-select-label">Sort Direction</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={activeColumn?.sortDirection}
                                label="Sort Direction"
                                onChange={(event) => {
                                    if (activeColumn == undefined) {
                                        return;
                                    }
                                    const value = event.target.value;
                                    if (value === "asc" || value === "desc" || value === "ignored") {
                                        activeColumn.sortDirection = value;
                                    }

                                    setColumns([...columns]);
                                }}
                            >
                                <MenuItem value="ignored">Ignored</MenuItem>
                                <MenuItem value="asc">Ascending</MenuItem>
                                <MenuItem value="desc">Descending</MenuItem>
                            </Select>
                        </>
                    )}
                    <TextField label="Filter" value={activeColumn?.filter} onChange={(e) => {
                        if(activeColumn == undefined) {
                            return;
                        }
                        activeColumn.filter = e.target.value;

                        setColumns([...columns]);
                    }}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        if(activeColumn == undefined) {
                            return;
                        }
                        handleClose();
                        activeColumn.filter = "";
                        activeColumn.sortDirection = "ignored";
                        setColumns([...columns]);
                    }}>Clear</Button>
                    <Button onClick={handleClose} autoFocus>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}