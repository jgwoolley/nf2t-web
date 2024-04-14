import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import Nf2tSnackbar, { Nf2tSnackbarResult } from "./Nf2tSnackbar";

export interface BodyRowComponentProps<R> {
    filteredRowIndex: number,
    rowIndex: number,
    row: R,
    filteredColumnIndex: number,
    columnIndex: number,
    column: Nf2tTableColumnSpec<R>,
}

export interface Nf2tTableColumnSpec<R> {
    columnName: string,
    bodyRow: FC<BodyRowComponentProps<R>>,
    rowToString: (row: R) => string,
    compareFn?: (a: R, b: R) => number,
}

export interface Nf2tTableColumn {
    columnIndex: number,
    sortDirection: "asc" | "desc" | "ignored",
    emptyFilter: "non-empty" | "empty" | "ignored",
    regexFilter: string, //RegExp
}

export interface Nf2tTableParams<R> {
    snackbarProps: Nf2tSnackbarResult,
    columns: Nf2tTableColumnSpec<R>[],
    rows: R[],
    canEditColumn: boolean,
}

export type VisibleRow<R> = {
    row: R,
    rowIndex: number,
};


export interface Nf2tTableProps<R> {
    rowsPerPage: number, 
    rowPage: number,
    columns: Nf2tTableColumnSpec<R>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    rows: R[],
    filteredRows: R[],
    visibleRows: VisibleRow<R>[],
    canEditColumn: boolean,
    open: boolean,
    columnPage: number,
    handleClickOpen: () => void,
    handleClose: () => void,
    handleChangePage: (event: unknown, newPage: number) => void,
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onClickColumn: (value: number) => void,
    restoreDefaultFilteredColumns: () => void, 
    snackbarProps: Nf2tSnackbarResult,
}

const emptyFilterLut = new Map<"empty" | "non-empty" | "ignored", undefined | ((value: string) => boolean)>();
emptyFilterLut.set("empty", (value) => value.length === 0);
emptyFilterLut.set("non-empty", (value) => value.length !== 0);
emptyFilterLut.set("ignored", undefined);

export function useNf2tTable<R>({ snackbarProps, rows, columns, canEditColumn }: Nf2tTableParams<R>): Nf2tTableProps<R> {
    const [filteredColumns, setFilteredColumns] = useState<Nf2tTableColumn[]>([]);
    const [rowPage, setRowPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [columnPage, setColumnPage] = useState(1);

    const onClickColumn = (value: number) => {
        setColumnPage(value);
    };

    const maxColumns = 10;

    const restoreDefaultFilteredColumns = () => {
        if (columns.length <= 0) {
            snackbarProps.submitSnackbarMessage("No columns for table configured", "error")
            return;
        }
        const keys = columns.keys();
        const newFilteredColumns: Nf2tTableColumn[] = Array.from(keys).map((_value, columnIndex) => {
            const newColumn: Nf2tTableColumn = {
                columnIndex: columnIndex,
                sortDirection: "ignored",
                emptyFilter: "ignored",
                regexFilter: "",
            }

            return newColumn;
        });


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
                const {
                    columnIndex,
                    emptyFilter,
                } = filteredColumns[filteredColumnIndex];
                
                const filter = emptyFilterLut.get(emptyFilter);
                if (filter == undefined) {
                    continue;
                }
                const column = columns[columnIndex];

                newRows = newRows.filter((row) => {
                    const value = column.rowToString(row);
                    return filter(value);
                });
            }

            for (let filteredColumnIndex = 0; filteredColumnIndex < filteredColumns.length; filteredColumnIndex++) {
                const {
                    columnIndex,
                    regexFilter: filter,
                } = filteredColumns[filteredColumnIndex];
                if (filter == undefined) {
                    continue;
                }
                const column = columns[columnIndex];

                newRows = newRows.filter((row) => {
                    const value = column.rowToString(row);
                    return value.match(filter);
                });
            }

            for (let filteredColumnIndex = 0; filteredColumnIndex < filteredColumns.length; filteredColumnIndex++) {
                const {
                    columnIndex,
                    sortDirection,
                } = filteredColumns[filteredColumnIndex];
                const { 
                    compareFn,
                } = columns[columnIndex];
                if (compareFn == undefined || sortDirection === "ignored") {
                    continue;
                }
                newRows = newRows.sort(sortDirection === "asc" ? compareFn : (a, b) => compareFn(b, a));
            }
            return [...newRows];
        },
        [columns, rows],
    )

    const visibleRows: VisibleRow<R>[] = useMemo(
        () => {
            const result: VisibleRow<R>[] = [];
            const startIndex = rowPage * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;

            for(const [rowIndex, row] of filteredRows.entries()) {
                if(rowIndex < startIndex || rowIndex > endIndex) {
                    continue;
                }

                result.push({
                    rowIndex: rowIndex,
                    row: row,
                })
            }

            return result;
        },
        [filteredRows, rowPage, rowsPerPage],
    );


    return {
        rowsPerPage, 
        rowPage,
        columns,
        filteredColumns,
        setFilteredColumns,
        rows,
        filteredRows,
        visibleRows,
        canEditColumn,
        open,
        columnPage,
        handleClickOpen,
        handleClose,
        handleChangePage,
        handleChangeRowsPerPage,
        onClickColumn,
        restoreDefaultFilteredColumns,
        snackbarProps,
    }
}

interface Nf2tTableColumnHeadCellProps<R> {
    columns: Nf2tTableColumnSpec<R>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    columnIndex: number,
    filteredColumnIndex: number,
    handleClickOpen: () => void,
    canEditColumn: boolean,
    onClickColumn: Nf2tOnClickColumn,
}

function Nf2tTableColumnHeadCell<R>({ filteredColumns, filteredColumnIndex, columns, columnIndex, handleClickOpen, onClickColumn }: Nf2tTableColumnHeadCellProps<R>) {
    const {
        sortDirection,
        regexFilter: filter,
    } = filteredColumns[filteredColumnIndex];
    
    const column = columns[columnIndex];

    return (
        <TableCell
            sortDirection={sortDirection === "ignored" ? false : sortDirection}
            onClick={() => {
                onClickColumn(columnIndex + 1);
                handleClickOpen();
            }}
        >
            {column.compareFn == undefined ? (
                <>{column.columnName}{filter.length > 0 && " *"}</>
            ) : (
                <TableSortLabel
                    active={sortDirection !== "ignored"}
                    direction={sortDirection === "ignored" ? undefined : sortDirection}
                >
                    {column.columnName}{filter.length > 0 && " *"}
                </TableSortLabel>
            )}
        </TableCell>
    )
}

type Nf2tColumnEditDialogMemoErrorType = { errorMessage: string }
type Nf2tColumnEditDialogMemoSuccessType<R> = { errorMessage: undefined, filteredColumnIndex: number, columnIndex: number, column: Nf2tTableColumnSpec<R>, filteredColumn: Nf2tTableColumn };
type Nf2tColumnEditDialogMemoType<R> = Nf2tColumnEditDialogMemoErrorType | Nf2tColumnEditDialogMemoSuccessType<R>;


interface Nf2tColumnEditDialogContentProps<R> {
    columns: Nf2tTableColumnSpec<R>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    columnPage: number,
    onClickColumn: Nf2tOnClickColumn,
    canEditColumn: boolean,
}

function Nf2tColumnEditDialogContent<R>({ columnPage, onClickColumn, filteredColumns, columns, setFilteredColumns, canEditColumn }: Nf2tColumnEditDialogContentProps<R>) {
    const columnMemoResult = useMemo<Nf2tColumnEditDialogMemoType<R>>(() => {
        const filteredColumnIndex = columnPage - 1;
        if (filteredColumnIndex < 0 || filteredColumnIndex >= filteredColumns.length) {
            const result : Nf2tColumnEditDialogMemoErrorType = {
                errorMessage: "No column available. Please create a new column.",
            }

            return result;
        }
        const filteredColumn = filteredColumns[filteredColumnIndex];

        if (filteredColumn.columnIndex == undefined) {
            const result : Nf2tColumnEditDialogMemoErrorType = {
                errorMessage: `columnIndex undefined for index ${columnIndex}.`,
            };

            return result;
        }
        const column = columns[filteredColumn.columnIndex];
        if (column == undefined) {
            const result : Nf2tColumnEditDialogMemoErrorType = {
                errorMessage: `column undefined for index ${filteredColumn.columnIndex}.`,
            }
            return result;
        }

        const result: Nf2tColumnEditDialogMemoSuccessType<R> = {
            errorMessage: undefined,
            filteredColumnIndex: filteredColumnIndex,
            columnIndex: filteredColumn.columnIndex,
            column: column,
            filteredColumn: filteredColumn,
        }

        return result;
    }, [columns, filteredColumns, columnPage]);

    if (columnMemoResult.errorMessage !== undefined) {
        return columnMemoResult.errorMessage;
    }

    const {
        filteredColumnIndex,
        columnIndex,
        column,
        filteredColumn,
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
                        const columnIndex = parseInt(event.target.value);
                        const filteredColumn = filteredColumns[filteredColumnIndex];
                        filteredColumn.columnIndex = columnIndex;
                        setFilteredColumns([...filteredColumns])
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
                value={filteredColumn.sortDirection}
                label="Sort Direction"
                select
                fullWidth
                variant="standard"
                margin="dense"
                onChange={(event) => {
                    const value = event.target.value;
                    if (value === "asc" || value === "desc" || value === "ignored") {
                        filteredColumn.sortDirection = value;
                    }

                    setFilteredColumns([...filteredColumns]);
                }}
            >
                <MenuItem value="ignored">Ignored</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
            </TextField>

            <TextField
                value={filteredColumn.emptyFilter}
                label="Empty Filter"
                select
                fullWidth
                variant="standard"
                margin="dense"
                onChange={(event) => {
                    const value = event.target.value;
                    if (value === "non-empty" || value === "empty" || value === "ignored") {
                        filteredColumn.emptyFilter = value;
                    }

                    setFilteredColumns([...filteredColumns]);
                }}
            >
                <MenuItem value="ignored">Ignored</MenuItem>
                <MenuItem value="non-empty">Non-Empty</MenuItem>
                <MenuItem value="empty">Empty</MenuItem>
            </TextField>

            <TextField
                fullWidth
                label="Regex Filter"
                value={filteredColumn.regexFilter}
                variant="standard"
                margin="dense"
                onChange={(e) => {
                    filteredColumn.regexFilter = e.target.value;
                    setFilteredColumns([...filteredColumns]);
                }}
            />

            <ButtonGroup >
                <Button
                    variant={filteredColumn.regexFilter != undefined || filteredColumn.sortDirection !== "ignored" ? "contained" : "outlined"}
                    onClick={() => {
                        filteredColumn.regexFilter = "";
                        filteredColumn.sortDirection = "ignored";
                        filteredColumn.emptyFilter = "ignored";
                        setFilteredColumns([...filteredColumns]);
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
    columns: Nf2tTableColumnSpec<R>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    restoreDefaultFilteredColumns: () => void,
    canEditColumn: boolean,
    columnPage: number,
    onClickColumn: Nf2tOnClickColumn,
}



function Nf2tColumnEditDialog<R>({ open, handleClose, filteredColumns, columns, setFilteredColumns, restoreDefaultFilteredColumns, canEditColumn, onClickColumn, columnPage }: Nf2tColumnEditDialogProps<R>) {
    useEffect(() => {
        onClickColumn(1);
    }, [filteredColumns.length, columns.length])

    const addFilteredColumns = () => {
        filteredColumns.push({
            columnIndex: 1,
            sortDirection: "ignored",
            emptyFilter: "ignored",
            regexFilter: "",
        });
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

export default function <R>({ columns, filteredColumns, filteredRows, canEditColumn, handleClickOpen, setFilteredColumns, onClickColumn, visibleRows, rowsPerPage, rowPage, handleChangePage, handleChangeRowsPerPage, handleClose, restoreDefaultFilteredColumns, columnPage, snackbarProps, open}: Nf2tTableProps<R>) {

    if (filteredColumns.length === 0) {
        return (
            <>
                <Button
                    variant="outlined"
                    onClick={handleClickOpen}
                >Update Columns</Button>
                {/* <p>columns: {JSON.stringify(columns)}</p>
                <p>filteredColumns: {JSON.stringify(filteredColumns)}</p> */}
            </>
        )
    }


    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {filteredColumns.map((filteredColumn, filteredColumnIndex) => (
                                <Nf2tTableColumnHeadCell
                                    key={filteredColumnIndex}
                                    columns={columns}
                                    filteredColumns={filteredColumns}
                                    setFilteredColumns={setFilteredColumns}
                                    columnIndex={filteredColumn.columnIndex}
                                    filteredColumnIndex={filteredColumnIndex}
                                    handleClickOpen={handleClickOpen}
                                    canEditColumn={canEditColumn}
                                    onClickColumn={onClickColumn}
                                />
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleRows.map((rowEntry, filteredRowIndex) => (
                            <TableRow key={filteredRowIndex}>
                                {filteredColumns.map((filteredColumn, filteredColumnIndex) => {
                                    const column = columns[filteredColumn.columnIndex];
                                    return (
                                        <TableCell key={filteredColumnIndex}>
                                            <column.bodyRow
                                                filteredColumnIndex={filteredColumnIndex}
                                                columnIndex={filteredColumn.columnIndex}
                                                column={column}
                                                filteredRowIndex={filteredRowIndex}
                                                row={rowEntry.row}
                                                rowIndex={rowEntry.rowIndex}
                                            />
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