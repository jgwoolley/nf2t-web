import React from 'react'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { useTheme } from '@mui/material/styles'
import { TablePaginationActionsProps } from '@mui/material/TablePagination/TablePaginationActions'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import {
  Column,
  Table as ReactTable,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'

export type NewNf2tTableProps<D> = {
    data: D[],
    columns: ColumnDef<D>[],
}

export function NewNf2tTable<D>({ data, columns }: NewNf2tTableProps<D>) {
  const table = useReactTable<D>({
    data,
    columns,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    //
    debugTable: true,
  })

  const rerender = React.useReducer(() => ({}), {})[1]

  const { pageSize, pageIndex } = table.getState().pagination
  console.log(table.getState().sorting)
  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableCell key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div>
                            <div
                                style={{cursor: header.column.getCanSort() ? "pointer" : undefined}}
                                onClick={header.column.getToggleSortingHandler()}
                                title={
                                    header.column.getCanSort()
                                        ? header.column.getNextSortingOrder() === 'asc'
                                        ? 'Sort ascending'
                                        : header.column.getNextSortingOrder() === 'desc'
                                            ? 'Sort descending'
                                            : 'Clear sort'
                                        : undefined
                                }
                            >
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                            )}
                                {{
                                    asc: ' 🔼',
                                    desc: ' 🔽',
                                }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          
                            {header.column.getIsSorted() ? "true" : "false"}
                            {header.column.getCanFilter() ? (
                                <div>
                                <Filter column={header.column} table={table} />
                                </div>
                            ) : null}
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: data.length }]}
        component="div"
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        slotProps={{
          select: {
            inputProps: { 'aria-label': 'rows per page' },
            native: true,
          },
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => {
          const size = e.target.value ? Number(e.target.value) : 10
          table.setPageSize(size)
        }}
        ActionsComponent={TablePaginationActions}
      />
      <pre>{JSON.stringify(table.getState().pagination, null, 2)}</pre>
      <pre>{JSON.stringify(table.getRowModel().rows.map(x => x.original))}</pre>
      <button onClick={() => rerender()}>Force Rerender</button>
    </Box>
  )
}

type FilterProps<TData, TValue> = {
    column: Column<TData, TValue>
    table: ReactTable<TData>
}

function Filter<TData, TValue>({ column, table, }: FilterProps<TData, TValue>) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <InputBase
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <InputBase
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
        inputProps={{ 'aria-label': 'search' }}
      />
    </div>
  ) : (
    <InputBase
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
      inputProps={{ 'aria-label': 'search' }}
    />
  )
}

const TablePaginationActions = (props: TablePaginationActionsProps) => {
    const theme = useTheme()
    const { count, page, rowsPerPage, onPageChange } = props
  
    const handleFirstPageButtonClick = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      onPageChange(event, 0)
    }
  
    const handleBackButtonClick = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      onPageChange(event, page - 1)
    }
  
    const handleNextButtonClick = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      onPageChange(event, page + 1)
    }
  
    const handleLastPageButtonClick = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
    }
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    )
  }