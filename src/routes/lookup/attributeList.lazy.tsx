import { useMemo, useState } from "react"
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { useNf2tContext } from "../../components/Nf2tContextProvider";
import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";

export const routeId = "/attributeList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
})

export default function RouteComponent() {
    const context = useNf2tContext();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const visibleRows = useMemo(
        () => Array.from(context.attributes.entries()).sort((a, b) => b[1].length - a[1].length).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        ),
        [context.attributes, page, rowsPerPage],
    );

    return (
        <>
            <Nf2tHeader to="/attributeList" />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Attribute</TableCell>
                            <TableCell>Extension Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleRows.map(([attributeName, attributeValues], index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Link to="/attributesLookup" search={{ name: attributeName }}>
                                        {attributeName}
                                    </Link>
                                </TableCell>
                                <TableCell>{attributeValues.length}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={context.attributes.size}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </>
    )
}