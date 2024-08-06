import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import Nf2tSnackbar, { Nf2tSnackbarResult } from "./Nf2tSnackbar";

export interface BodyRowComponentProps<R,C> {
    filteredRowIndex: number,
    rowIndex: number,
    row: R,
    filteredColumnIndex: number,
    columnIndex: number,
    column: Nf2tTableColumnSpec<R,C>,
    childProps: C,
    hideFilter?: boolean,
}

export interface Nf2tTableColumnSpec<R,C> {
    columnName: string,
    bodyRow: FC<BodyRowComponentProps<R,C>>,
    hideFilter?: boolean,
    rowToString: (row: R) => string,
    compareFn?: (a: R, b: R) => number,
}

type Nf2tTableColumnSortDirectionType = "asc" | "desc" | "ignored";
type Nf2tTableColumnEmptyFilterType = "non-empty" | "empty" | "ignored";

const Nf2tTableColumnSortDirectionDefault: Nf2tTableColumnSortDirectionType = "ignored";
const Nf2tTableColumnEmptyFilterTypeDefault: Nf2tTableColumnEmptyFilterType = "ignored";

export interface Nf2tTableColumn {
    columnIndex: number,
    sortDirection: Nf2tTableColumnSortDirectionType,
    emptyFilter: Nf2tTableColumnEmptyFilterType,
    regexFilter: string, //RegExp
}

export interface Nf2tTableParams<R, C> {
    childProps: C,
    snackbarProps: Nf2tSnackbarResult,
    columns: Nf2tTableColumnSpec<R, C>[],
    rows: R[],
    canEditColumn: boolean,
    ignoreNoColumnsError?: boolean,
    maxColumns?: number,
}

export type VisibleRow<R> = {
    row: R,
    rowIndex: number,
};

export interface Nf2tTableProps<R, C> {
    childProps: C,
    rowsPerPage: number, 
    rowPage: number,
    columns: Nf2tTableColumnSpec<R, C>[],
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

function isColumnDefault(filteredColumn: Nf2tTableColumn) {
    return filteredColumn.regexFilter.length > 0 || filteredColumn.sortDirection !== Nf2tTableColumnSortDirectionDefault || filteredColumn.emptyFilter !== Nf2tTableColumnEmptyFilterTypeDefault;
}

const emptyFilterLut = new Map<"empty" | "non-empty" | "ignored", undefined | ((value: string) => boolean)>();
emptyFilterLut.set("empty", (value) => value.length === 0);
emptyFilterLut.set("non-empty", (value) => value.length !== 0);
emptyFilterLut.set("ignored", undefined);

export function useNf2tTable<R, C>({ childProps, snackbarProps, rows, columns, canEditColumn, ignoreNoColumnsError, maxColumns: incomingMaxColumns}: Nf2tTableParams<R, C>): Nf2tTableProps<R, C> {    
    const [filteredColumns, setFilteredColumns] = useState<Nf2tTableColumn[]>([]);
    const [rowPage, setRowPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [columnPage, setColumnPage] = useState(1);

    const onClickColumn = (value: number) => {
        setColumnPage(value);
    };

    const maxColumns = incomingMaxColumns || 6;

    const restoreDefaultFilteredColumns = () => {
        if(columns.length == 0 || filteredColumns.length !== 0) {
            return;
        }

        if (!ignoreNoColumnsError && columns.length <= 0) {
            snackbarProps.submitSnackbarMessage("No columns for table configured", "error")
            return;
        }
        const keys = columns.keys();
        const newFilteredColumns: Nf2tTableColumn[] = Array.from(keys).map((_value, columnIndex) => {
            const newColumn: Nf2tTableColumn = {
                columnIndex: columnIndex,
                sortDirection: Nf2tTableColumnSortDirectionDefault,
                emptyFilter: Nf2tTableColumnEmptyFilterTypeDefault,
                regexFilter: "",
            }

            return newColumn;
        });


        newFilteredColumns.splice(maxColumns);
        setFilteredColumns(newFilteredColumns);
        console.log("reset columns.")
    }

    useEffect(() => {
        restoreDefaultFilteredColumns();
    }, []);

    useEffect(() => {
        restoreDefaultFilteredColumns();
    }, [columns, filteredColumns]);

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
                const filteredColumn = filteredColumns[filteredColumnIndex];
                if(filteredColumn == undefined) {
                    continue;
                }                

                const column = columns[filteredColumn.columnIndex];

                if(column == undefined) {
                    continue;
                }

                const {compareFn} = column;

                if (compareFn == undefined || filteredColumn.sortDirection === "ignored") {
                    continue;
                }
                newRows = newRows.sort(filteredColumn.sortDirection === "asc" ? compareFn : (a, b) => compareFn(b, a));
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
        childProps,
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

interface Nf2tTableColumnHeadCellProps<R, C> {
    columns: Nf2tTableColumnSpec<R, C>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    columnIndex: number,
    filteredColumnIndex: number,
    handleClickOpen: () => void,
    canEditColumn: boolean,
    onClickColumn: Nf2tOnClickColumn,
}

function Nf2tTableColumnHeadCell<R, C>({ filteredColumns, filteredColumnIndex, columns, columnIndex, handleClickOpen, onClickColumn }: Nf2tTableColumnHeadCellProps<R, C>) {
    const filteredColumn = filteredColumns[filteredColumnIndex];
    if(filteredColumn == undefined) {
        return null;
    }

    const column = columns[columnIndex];
    if(column == undefined) {
        return null;
    }

    return (
        <TableCell
            sortDirection={filteredColumn.sortDirection === "ignored" ? false : filteredColumn.sortDirection}
            onClick={() => {
                onClickColumn(columnIndex + 1);
                handleClickOpen();
            }}
        >
            {column.compareFn == undefined ? (
                <>{column.columnName}{isColumnDefault(filteredColumn) && " *"}</>
            ) : (
                <TableSortLabel
                    active={filteredColumn.sortDirection !== "ignored"}
                    direction={filteredColumn.sortDirection === "ignored" ? undefined : filteredColumn.sortDirection}
                >
                    {column.columnName}{isColumnDefault(filteredColumn) && " *"}
                </TableSortLabel>
            )}
        </TableCell>
    )
}

type Nf2tColumnEditDialogMemoErrorType = { errorMessage: string }
type Nf2tColumnEditDialogMemoSuccessType<R, C> = { errorMessage: undefined, filteredColumnIndex: number, columnIndex: number, column: Nf2tTableColumnSpec<R, C>, filteredColumn: Nf2tTableColumn };
type Nf2tColumnEditDialogMemoType<R, C> = Nf2tColumnEditDialogMemoErrorType | Nf2tColumnEditDialogMemoSuccessType<R, C>;


interface Nf2tColumnEditDialogContentProps<R, C> {
    columns: Nf2tTableColumnSpec<R, C>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    columnPage: number,
    onClickColumn: Nf2tOnClickColumn,
    canEditColumn: boolean,
}

function Nf2tColumnEditDialogContent<R, C>({ columnPage, onClickColumn, filteredColumns, columns, setFilteredColumns, canEditColumn }: Nf2tColumnEditDialogContentProps<R, C>) {
    const columnMemoResult = useMemo<Nf2tColumnEditDialogMemoType<R, C>>(() => {
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

        const result: Nf2tColumnEditDialogMemoSuccessType<R, C> = {
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
                    disabled={column.hideFilter}
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
                disabled={column.hideFilter}
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
                disabled={column.hideFilter}
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
                disabled={column.hideFilter}
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
                    variant={isColumnDefault(filteredColumn)? "contained" : "outlined"}
                    onClick={() => {
                        filteredColumn.regexFilter = "";
                        filteredColumn.sortDirection = "ignored";
                        filteredColumn.emptyFilter = "ignored";
                        setFilteredColumns([...filteredColumns]);
                    }}
                >Clear</Button>
                {canEditColumn && (
                    <Button 
                        disabled={column.hideFilter}
                        onClick={() => {
                            filteredColumns.splice(filteredColumnIndex, 1);
                            onClickColumn(1);
                            setFilteredColumns([...filteredColumns]);
                        }}
                    >Remove</Button>
                )}

            </ButtonGroup>
            <Pagination count={filteredColumns.length} page={columnPage} onChange={(_, newPage) => onClickColumn(newPage)} />
        </>
    )
}

type Nf2tOnClickColumn = (columnPage: number) => void;

interface Nf2tColumnEditDialogProps<R, C> {
    open: boolean,
    handleClose: () => void,
    columns: Nf2tTableColumnSpec<R, C>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    restoreDefaultFilteredColumns: () => void,
    canEditColumn: boolean,
    columnPage: number,
    onClickColumn: Nf2tOnClickColumn,
}



function Nf2tColumnEditDialog<R, C>({ open, handleClose, filteredColumns, columns, setFilteredColumns, restoreDefaultFilteredColumns, canEditColumn, onClickColumn, columnPage }: Nf2tColumnEditDialogProps<R, C>) {
    useEffect(() => {
        onClickColumn(1);
    }, [filteredColumns.length, columns.length])

    const addFilteredColumns = () => {
        filteredColumns.push({
            columnIndex: 1,
            sortDirection: Nf2tTableColumnSortDirectionDefault,
            emptyFilter: Nf2tTableColumnEmptyFilterTypeDefault,
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

export default function Nf2tTable<R, C>({ childProps, columns, filteredColumns, filteredRows, canEditColumn, handleClickOpen, setFilteredColumns, onClickColumn, visibleRows, rowsPerPage, rowPage, handleChangePage, handleChangeRowsPerPage, handleClose, restoreDefaultFilteredColumns, columnPage, snackbarProps, open}: Nf2tTableProps<R, C>) {

    if (filteredColumns.length === 0) {
        return (
            <>
                <Button
                    variant="outlined"
                    onClick={restoreDefaultFilteredColumns}
                >Refresh Table</Button>
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
                                                childProps={childProps}
                                                filteredColumnIndex={filteredColumnIndex}
                                                columnIndex={filteredColumn.columnIndex}
                                                column={column}
                                                filteredRowIndex={filteredRowIndex}
                                                row={rowEntry.row}
                                                rowIndex={rowEntry.rowIndex}
                                                hideFilter={column.hideFilter}
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