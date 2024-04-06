import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from "@mui/material";
import { ReactNode, useEffect, useMemo, useState } from "react";

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

interface Nf2tTableColumnHeadCellProps<R> {
    columns: Nf2tTableColumn<R>[],
    setColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn<R>[]>>,
    filteredColumns: number[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<number[]>>,
    columnIndex: number,
    filteredColumnIndex: number,
    handleClickOpen: () => void,
}

function Nf2tTableColumnHeadCell<R>({ columns, columnIndex, handleClickOpen }: Nf2tTableColumnHeadCellProps<R>) {
    const column = columns[columnIndex];

    return (
        <TableCell
            sortDirection={column.sortDirection === "ignored" ? false : column.sortDirection}
            onClick={handleClickOpen}
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
    )
}

type Nf2tColumnEditDialogMemoErrorType = { errorMessage: string }
type Nf2tColumnEditDialogMemoSuccessType<R> = { errorMessage: undefined, filteredColumnIndex: number, columnIndex: number, column: Nf2tTableColumn<R> };
type Nf2tColumnEditDialogMemoType<R> = Nf2tColumnEditDialogMemoErrorType | Nf2tColumnEditDialogMemoSuccessType<R>;


interface Nf2tColumnEditDialogContentProps<R> {
    columns: Nf2tTableColumn<R>[],
    setColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn<R>[]>>,
    filteredColumns: number[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<number[]>>,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    handleChange: (event: React.ChangeEvent<unknown>, value: number) => void,
}

function Nf2tColumnEditDialogContent<R>({ page, setPage, handleChange, filteredColumns, columns, setColumns, setFilteredColumns }: Nf2tColumnEditDialogContentProps<R>) {
    const columnMemoResult = useMemo<Nf2tColumnEditDialogMemoType<R>>(() => {
        const filteredColumnIndex = page - 1;
        if (filteredColumnIndex < 0 || filteredColumnIndex >= filteredColumns.length) {
            return {
                errorMessage: "No column available. Please create a new column.",
            }
        }
        const columnIndex = filteredColumns[filteredColumnIndex];
        if (columnIndex == undefined) {
            return {
                errorMessage: `columnIndex undefined for index ${columnIndex}.`,
            }
        }
        const column = columns[columnIndex];
        if (column == undefined) {
            return {
                errorMessage: `column undefined for index ${columnIndex}.`,
            }
        }

        return {
            errorMessage: undefined,
            filteredColumnIndex: filteredColumnIndex,
            columnIndex: columnIndex,
            column: column,
        };
    }, [columns, filteredColumns, page]);

    if (columnMemoResult.errorMessage !== undefined) {
        return columnMemoResult.errorMessage;
    }

    const {
        filteredColumnIndex,
        columnIndex,
        column,
    } = columnMemoResult;

    return (
        <>
            <TextField
                value={columnIndex}
                label="Column"
                select
                fullWidth
                variant="standard"
                margin="dense"
                onChange={(event) => {
                    const value = event.target.value;
                    filteredColumns[filteredColumnIndex] = parseInt(value);
                    setColumns([...columns]);
                }}
            >
                {columns.map((column, columnIndex) => (
                    <MenuItem key={columnIndex} value={columnIndex}>{column.columnName}</MenuItem>
                ))}
            </TextField>

            <TextField
                value={column.sortDirection}
                label="Sort Direction"
                select
                fullWidth
                variant="standard"
                margin="dense"
                onChange={(event) => {
                    const value = event.target.value;
                    if (value === "asc" || value === "desc" || value === "ignored") {
                        column.sortDirection = value;
                    }

                    setColumns([...columns]);
                }}
            >
                <MenuItem value="ignored">Ignored</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
            </TextField>

            <TextField
                fullWidth
                label="Regex Filter"
                value={column.filter}
                variant="standard"
                margin="dense"
                onChange={(e) => {
                    column.filter = e.target.value;
                    setColumns([...columns]);
                }}
            />

            <ButtonGroup >
                <Button
                    variant={column.filter.length > 0 || column.sortDirection !== "ignored" ? "contained" : "outlined"}
                    onClick={() => {
                        column.filter = "";
                        column.sortDirection = "ignored";
                        setColumns([...columns]);
                    }}
                >Clear</Button>
                <Button onClick={() => {
                    filteredColumns.splice(filteredColumnIndex, 1);
                    setPage(1);
                    setFilteredColumns([...filteredColumns]);
                }}>Remove</Button>
            </ButtonGroup>
            <Pagination count={filteredColumns.length} page={page} onChange={handleChange} />
        </>
    )
}

interface Nf2tColumnEditDialogProps<R> {
    open: boolean,
    handleClose: () => void,
    columns: Nf2tTableColumn<R>[],
    setColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn<R>[]>>,
    filteredColumns: number[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<number[]>>,
    restoreDefaultFilteredColumns: () => void,
}

function Nf2tColumnEditDialog<R>({ open, handleClose, filteredColumns, columns, setColumns, setFilteredColumns, restoreDefaultFilteredColumns }: Nf2tColumnEditDialogProps<R>) {
    const [page, setPage] = useState(1);
    const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        setPage(1);
    }, [filteredColumns.length, columns.length])

    const addFilteredColumns = () => {
        filteredColumns.push(1);
        setPage(filteredColumns.length);
        setFilteredColumns([...filteredColumns]);
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Edit Columns</DialogTitle>
            <DialogContent>
                <Nf2tColumnEditDialogContent
                    columns={columns}
                    setColumns={setColumns}
                    filteredColumns={filteredColumns}
                    setFilteredColumns={setFilteredColumns}
                    page={page}
                    setPage={setPage}
                    handleChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={addFilteredColumns}>Add Column</Button>
                <Button onClick={restoreDefaultFilteredColumns}>Restore</Button>
                <Button onClick={handleClose} autoFocus>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default function <R>({ columns, setColumns, rows }: Nf2tTableProps<R>) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [filteredColumns, setFilteredColumns] = useState<number[]>([]);
    const maxColumns = 10;

    const restoreDefaultFilteredColumns = () => {
        const keys = columns.keys();
        const newFilteredColumns = Array.from(keys);
        newFilteredColumns.splice(maxColumns);
        setFilteredColumns(newFilteredColumns);
    }

    useEffect(() => restoreDefaultFilteredColumns, [])

    const handleClickOpen = () => {
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
        setPage(1);
    };

    const filteredRows = useMemo(
        () => {
            let newRows = rows;

            for (let filteredColumnIndex = 0; filteredColumnIndex < filteredColumns.length; filteredColumnIndex++) {
                const index = filteredColumns[filteredColumnIndex];
                const column = columns[index];
                const { filter } = column;
                if (filter.length <= 0) {
                    continue;
                }

                newRows = newRows.filter((row) => column.rowToString(row).match(column.filter));
            }

            for (let filteredColumnIndex = 0; filteredColumnIndex < filteredColumns.length; filteredColumnIndex++) {
                const index = filteredColumns[filteredColumnIndex];
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

    if(visibleRows.length === 0 || filteredColumns.length === 0) {
        return (
            <Button onClick={handleClickOpen}
            >Upadate Columns</Button>
        )
    }


    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {filteredColumns.map((columnIndex, filteredColumnIndex) => (
                                <Nf2tTableColumnHeadCell
                                    key={filteredColumnIndex}
                                    columns={columns}
                                    setColumns={setColumns}
                                    filteredColumns={filteredColumns}
                                    setFilteredColumns={setFilteredColumns}
                                    columnIndex={columnIndex}
                                    filteredColumnIndex={filteredColumnIndex}
                                    handleClickOpen={handleClickOpen} />
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {filteredColumns.map((columnIndex, filteredColumnIndex) => {
                                    const column = columns[columnIndex];
                                    return (
                                        <TableCell key={filteredColumnIndex}>
                                            {column.createBodyRow(row)}
                                        </TableCell>
                                    )
                                })}
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
            <Nf2tColumnEditDialog
                open={open}
                handleClose={handleClose}
                filteredColumns={filteredColumns}
                columns={columns}
                setColumns={setColumns}
                setFilteredColumns={setFilteredColumns}
                restoreDefaultFilteredColumns={restoreDefaultFilteredColumns}
            />
        </>
    )
}