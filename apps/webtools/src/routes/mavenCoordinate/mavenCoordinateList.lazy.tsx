import Nf2tHeader from "../../components/Nf2tHeader";
import { createLazyRoute } from "@tanstack/react-router";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { useNf2tSnackbar } from '../../hooks/useNf2tSnackbar';
import { Link as MuiLink } from "@mui/material";
import { Link } from '@tanstack/react-router';

import useQueryMavenCoordinates, { MavenCoordinate } from "../../hooks/useQueryAllMavenDB";
import Nf2tTable from "../../components/Nf2tTable";
import { useNf2tTable } from "../../hooks/useNf2tTable";

const routeId = "/mavenCoordinateList" as const;

export const MavenCoordinateListRoute = createLazyRoute(routeId)({
    component: BuildProcess,
})

function RowLink({row, label}: {row: MavenCoordinate, label: keyof MavenCoordinate}) {
    return (
        <Link to="/mavenCoordinate" search={row}>
            <MuiLink component="span">{row[label]}</MuiLink>
        </Link>
    )
}

export default function BuildProcess() {
    const snackbarProps = useNf2tSnackbar();

    const coordinateResult = useQueryMavenCoordinates();

    const tableProps = useNf2tTable({
        childProps: null,
        snackbarProps: snackbarProps,
        canEditColumn: false,
        columns: [
            {
                columnName: "Endpoint",
                bodyRow: (x) => <RowLink row={x.row} label="endpoint"/>,
                rowToString: (row) => row.endpoint,
            },
            {
                columnName: "GroupId",
                bodyRow: (x) => <RowLink row={x.row} label="groupId"/>,
                rowToString: (row) => row.groupId,
            },
            {
                columnName: "ArtifactId",
                bodyRow: (x) => <RowLink row={x.row} label="artifactId"/>,
                rowToString: (row) => row.artifactId,
            },
            {
                columnName: "Packaging",
                bodyRow: (x) => <RowLink row={x.row} label="packaging"/>,
                rowToString: (row) => row.packaging,
            },
            {
                columnName: "Version",
                bodyRow: (x) => <RowLink row={x.row} label="version"/>,
                rowToString: (row) => row.version,
            },
        ],
        rows: coordinateResult.data?.coordinates || [],
    });

    return (
        <>
            <Nf2tHeader to={routeId} />

            <Nf2tTable {...tableProps} />

            <Nf2tSnackbar {...snackbarProps} />
        </>
    );
}