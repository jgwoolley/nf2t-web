import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../components/Nf2tContextProvider";
import { Table, TableBody, TableCell, TableHead, TableRow, TablePagination, TableContainer, Paper } from "@mui/material";
import { useMemo, useState } from "react";

export const routeId = "/narList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
})

export default function RouteComponent() {
    const { nars } = useNf2tContext();
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
        () => nars.sort().slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        ),
        [nars, page, rowsPerPage],
    );

    return (
        <>
            <Nf2tHeader to={routeId} />

            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nar</TableCell>
                        <TableCell>Last Modified</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>groupId</TableCell>
                        <TableCell>rtifactId</TableCell>
                        <TableCell>version</TableCell>
                        <TableCell>buildTag</TableCell>
                        <TableCell>buildTimestamp</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {visibleRows.map((nar, nar_index) => (
                        <TableRow key={nar_index}>
                            <TableCell>
                                <Link search={{ nar_index: nar_index }} to="/narLookup">{nar.name}</Link>
                            </TableCell>
                            <TableCell>{nar.lastModified}</TableCell>
                            <TableCell>{nar.size}</TableCell>
                            <TableCell>{nar.groupId}</TableCell>
                            <TableCell>{nar.artifactId}</TableCell>
                            <TableCell>{nar.version}</TableCell>
                            <TableCell>{nar.buildTag}</TableCell>
                            <TableCell>{nar.buildTimestamp}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={nars.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            </TableContainer>
        </>
    )
}