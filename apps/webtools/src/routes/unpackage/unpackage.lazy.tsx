import { createLazyRoute, Link } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { IconButton } from "@mui/material";
import { FileUploadOutlined } from "@mui/icons-material";
import { useCallback, useMemo } from "react";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import useUnpackageOnUpload from "../../hooks/useUnpackageOnUpload";
import Nf2tLinearProgress from "../../components/Nf2tLinearProgress";
import useNf2tLinearProgress from "../../hooks/useNf2tLinearProgress";
import { Link as MuiLink } from "@mui/material";
import { UnpackagedFile } from "../../utils/schemas";
import Nf2tTable from "../../components/Nf2tTable";

export const routeId = "/unpackage" as const;

const defaultTotal = -1;
const defaultCurrent = 0;

function Component() {
    const linearProgressProps = useNf2tLinearProgress();

    const snackbarProps = useNf2tSnackbar();
    const { unpackagedRows, setUnpackagedRows, unpackagedFiles, setUnpackagedFiles } = useNf2tContext();

    const rootUnpackagedFiles = useMemo(() => {
        return unpackagedFiles.filter( x => x.parentId == undefined);
    }, [unpackagedFiles]);

    const tableProps = useNf2tTable({
        childProps: undefined,
        snackbarProps: snackbarProps,
        canEditColumn: true,
        columns: [{
            columnName: "File",
            bodyRow: ({row}) => {
                return <Link to="/unpackageFileLookup" search={{ id: row.id }}><MuiLink component="span">{row.name}</MuiLink></Link>;
            },
            rowToString: function (row: UnpackagedFile): string {
                return row.name;
            },
        },
        {
            columnName: "Size",
            bodyRow: ({row}) => {
                return row.size;
            },
            compareFn: (a, b) => {
                return b.size - a.size;
            },
            rowToString: function (row: UnpackagedFile): string {
                return row.size.toString();
            },
        },
        {
            columnName: "MimeType",
            bodyRow: ({row}) => {
                return row.type;
            },
            rowToString: function (row: UnpackagedFile): string {
                return row.type;
            },
        },
    ],
        rows: rootUnpackagedFiles,
        ignoreNoColumnsError: true,
        minColumns: 3,
    });

    const resetProgress = useCallback(() => {
        tableProps.restoreDefaultFilteredColumns();
        linearProgressProps.setTotalProgress(defaultTotal);
        linearProgressProps.setCurrentProgress(defaultCurrent);
    }, []);

    const { onUpload, dragOverProps } = useUnpackageOnUpload({
        resetProgress: resetProgress,
        submitSnackbarMessage: snackbarProps.submitSnackbarMessage,
        setCurrent: linearProgressProps.setCurrentProgress,
        setTotal: linearProgressProps.setTotalProgress,
        setUnpackagedRows: setUnpackagedRows,
        unpackagedRows: unpackagedRows,
        unpackagedFiles: unpackagedFiles,
        setUnpackagedFiles: setUnpackagedFiles,
    });

    return (
        <div
            {...dragOverProps}
        >
            <Nf2tHeader to={routeId} />

            <IconButton component="label">
                <FileUploadOutlined />
                <input
                    multiple={true}
                    style={{ display: "none" }}
                    type="file"
                    hidden
                    onChange={onUpload}
                />
            </IconButton>

            <Nf2tLinearProgress {...linearProgressProps} />

            <Nf2tTable {...tableProps} />
        </div>
    );
}

export const Route = createLazyRoute(routeId)({
    component: Component,
})