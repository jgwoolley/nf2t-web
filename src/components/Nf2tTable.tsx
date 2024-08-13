import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from "@mui/material";
import { useEffect, useMemo } from "react";
import Nf2tSnackbar from "./Nf2tSnackbar";
import { Nf2tOnClickColumn, Nf2tTableColumn, Nf2tTableColumnEmptyFilterTypeDefault, Nf2tTableColumnHeadCellProps, Nf2tTableColumnSortDirectionDefault, Nf2tTableColumnSpec, Nf2tTableProps } from "../hooks/useNf2tTable";

function isColumnDefault(filteredColumn: Nf2tTableColumn) {
    return filteredColumn.regexFilter.length > 0 || filteredColumn.sortDirection !== Nf2tTableColumnSortDirectionDefault || filteredColumn.emptyFilter !== Nf2tTableColumnEmptyFilterTypeDefault;
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
                errorMessage: `columnIndex undefined for index ${filteredColumn.columnIndex}.`,
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
            <Pagination count={filteredColumns.length} page={columnPage} onChange={(_, newPage) => {
                onClickColumn(newPage);
            }} />
        </>
    )
}


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
    }, [filteredColumns.length, columns.length, onClickColumn])

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