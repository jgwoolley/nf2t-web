import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import Nf2tSnackbar, { useNf2tSnackbar } from "./Nf2tSnackbar";

export interface BodyRowComponentProps<R> {
    row: R,
    columnIndex: number,
    rowIndex: number,
    filteredColumnIndex: number,
}

export interface Nf2tTableColumnSpec<R> {
    columnName: string,
    bodyRow: FC<BodyRowComponentProps<R>>,
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
    canEditColumn: boolean,
}

export interface Nf2tTableProps<R> {
    columns: Nf2tTableColumn<R>[],
    setColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn<R>[]>>,
    rows: R[],
    canEditColumn: boolean,
}

function createColumn<R>(column: Nf2tTableColumnSpec<R>): Nf2tTableColumn<R> {
    return {
        ...column,
        sortDirection: "ignored",
        filter: "",
    }
}

export function useNf2tTable<R>({ rows, columns: incomingColumns, canEditColumn }: Nf2tTableParams<R>): Nf2tTableProps<R> {
    const [columns, setColumns] = useState<Nf2tTableColumn<R>[]>(incomingColumns.map(createColumn));

    return {
        columns,
        setColumns,
        rows,
        canEditColumn,
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
    canEditColumn: boolean,
    onClickColumn: Nf2tOnClickColumn,
}

function Nf2tTableColumnHeadCell<R>({ columns, columnIndex, handleClickOpen, onClickColumn }: Nf2tTableColumnHeadCellProps<R>) {
    const column = columns[columnIndex];

    return (
        <TableCell
            sortDirection={column.sortDirection === "ignored" ? false : column.sortDirection}
            onClick={() => {
                onClickColumn(columnIndex + 1);
                handleClickOpen();
            }}
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
    columnPage: number,
    onClickColumn: Nf2tOnClickColumn,
    canEditColumn: boolean,
}

function Nf2tColumnEditDialogContent<R>({ columnPage, onClickColumn, filteredColumns, columns, setColumns, setFilteredColumns, canEditColumn }: Nf2tColumnEditDialogContentProps<R>) {
    const columnMemoResult = useMemo<Nf2tColumnEditDialogMemoType<R>>(() => {
        const filteredColumnIndex = columnPage - 1;
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
    }, [columns, filteredColumns, columnPage]);

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
            {canEditColumn ? (
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
            ) : (
                <>{column.columnName}</>
            )}


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
                {canEditColumn && (
                    <Button onClick={() => {
                        filteredColumns.splice(filteredColumnIndex, 1);
                        onClickColumn(1);
                        setFilteredColumns([...filteredColumns]);
                    }}>Remove</Button>
                )}

            </ButtonGroup>
            <Pagination count={filteredColumns.length} page={columnPage} onChange={(_, newPage) => onClickColumn(newPage)} />
        </>
    )
}

type Nf2tOnClickColumn = (columnPage: number) => void;

interface Nf2tColumnEditDialogProps<R> {
    open: boolean,
    handleClose: () => void,
    columns: Nf2tTableColumn<R>[],
    setColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn<R>[]>>,
    filteredColumns: number[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<number[]>>,
    restoreDefaultFilteredColumns: () => void,
    canEditColumn: boolean,
    columnPage: number,
    onClickColumn: Nf2tOnClickColumn,
}



function Nf2tColumnEditDialog<R>({ open, handleClose, filteredColumns, columns, setColumns, setFilteredColumns, restoreDefaultFilteredColumns, canEditColumn, onClickColumn, columnPage }: Nf2tColumnEditDialogProps<R>) {
    useEffect(() => {
        onClickColumn(1);
    }, [filteredColumns.length, columns.length])

    const addFilteredColumns = () => {
        filteredColumns.push(1);
        onClickColumn(filteredColumns.length);
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
                    columnPage={columnPage}
                    onClickColumn={onClickColumn}
                    canEditColumn={canEditColumn}
                />
            </DialogContent>
            <DialogActions>
                {canEditColumn && (
                    <>
                        <Button onClick={addFilteredColumns}>Add Column</Button>
                        <Button onClick={restoreDefaultFilteredColumns}>Restore</Button>
                    </>
                )}

                <Button onClick={handleClose} autoFocus>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default function <R>({ columns, setColumns, rows, canEditColumn }: Nf2tTableProps<R>) {
    const [rowPage, setRowPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [filteredColumns, setFilteredColumns] = useState<number[]>([]);
    const [columnPage, setColumnPage] = useState(1);
    const snackbarProps = useNf2tSnackbar();

    const onClickColumn = (value: number) => {
        setColumnPage(value);
    };

    const maxColumns = 10;

    const restoreDefaultFilteredColumns = () => {
        const keys = columns.keys();
        const newFilteredColumns = Array.from(keys);
        if(newFilteredColumns.length <= 0) {
            snackbarProps.submitSnackbarMessage("No columns for table configured", "error")
            return;
        }
        newFilteredColumns.splice(maxColumns);
        setFilteredColumns(newFilteredColumns);
    }

    useEffect(() => {
        restoreDefaultFilteredColumns();
    }, [])

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleChangePage = (_event: unknown, newPage: number) => {
        setRowPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        onClickColumn(1);
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
            rowPage * rowsPerPage,
            rowPage * rowsPerPage + rowsPerPage,
        ),
        [filteredRows, rowPage, rowsPerPage],
    );

    if(visibleRows.length === 0 || filteredColumns.length === 0) {
        return (
            <Button 
            variant="outlined" 
            onClick={handleClickOpen}
            >Update Columns</Button>
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
                                    handleClickOpen={handleClickOpen}
                                    canEditColumn={canEditColumn}
                                    onClickColumn={onClickColumn}
                                />
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
                                            <column.bodyRow row={row} columnIndex={columnIndex} rowIndex={rowIndex} filteredColumnIndex={filteredColumnIndex} />
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
                    page={rowPage}
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
                canEditColumn={canEditColumn}
                columnPage={columnPage}
                onClickColumn={onClickColumn}
            />
            <Nf2tSnackbar {...snackbarProps} />
        </>
    )
}