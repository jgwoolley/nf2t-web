import { Button, ButtonGroup } from '@mui/material';
import { useCallback, useMemo } from 'react';
import AttributesTable from '../../components/AttributesTable';
import AttributeDownload from '../../components/AttributeDownload';
import Nf2tHeader from '../../components/Nf2tHeader';
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { Nf2tSnackbarProps, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { Download } from '@mui/icons-material';
import { Link, createLazyRoute, getRouteApi } from '@tanstack/react-router';
import Nf2tTable from '../../components/Nf2tTable';
import { useNf2tTable } from '../../hooks/useNf2tTable';
import { useNf2tContext } from '../../hooks/useNf2tContext';
import { findCoreAttributes, FlowFile } from '@nf2t/flowfiletools-js';
import { downloadFile } from '../../utils/downloadFile';
import useArrayElements from '../../hooks/useArrayElement';
import { Link as MuiLink } from "@mui/material";
import UnpackageLink from './UnpackageLink';

export const Route = createLazyRoute("/unpackageFlowFileLookup")({
    component: UnpackageFlowFile,
})

interface ContentDownloadButtonProps extends Nf2tSnackbarProps {
    flowFile: FlowFile,
}

function ContentDownloadButton({ flowFile, submitSnackbarMessage }: ContentDownloadButtonProps) {
    const onClick = useCallback(() => {
        if (flowFile?.content == undefined) {
            submitSnackbarMessage("No content to download.", "error");
            return;
        }

        const coreAttributes = findCoreAttributes(flowFile.attributes);

        downloadFile(new File([flowFile.content], coreAttributes.filename || ""));
    }, [flowFile, submitSnackbarMessage]);

    return (
        <Button startIcon={<Download />} variant="outlined" onClick={onClick}>Download Content</Button>
    )
}

const routeId = "/unpackageFlowFileLookup" as const;
const route = getRouteApi(routeId);

export default function UnpackageFlowFile() {
    const snackbarResults = useNf2tSnackbar();

    const searchParams = route.useSearch();

    const { queryResults, flowFileResults, setFlowFileResults } = useNf2tContext();

    const setFlowFileSuccess: React.Dispatch<React.SetStateAction<FlowFile[]>> = useCallback((newValue) => {       
        setFlowFileResults(currentState => {
            const successValue = newValue instanceof Function ? newValue(currentState.success) : newValue;
            return {
                ...currentState,
                success: successValue,
            }
        });
    }, [setFlowFileResults]);

    const { value: flowFile, setValue: setFlowFile } = useArrayElements<FlowFile>({
        defaultValue: { parentId: "none", attributes: [], content: new Blob() },
        index: searchParams.index,
        values: flowFileResults.success,
        setValues: setFlowFileSuccess,
    });

    const evaluatedProcessors = useMemo(() => {
        if (!queryResults.data || flowFile == undefined) {
            return [];
        }

        const flowFileAttributes = new Set<string>();
        for (const row of flowFile.attributes) {
            flowFileAttributes.add(row[0]);
        }

        const results = new Map<string, [number, number]>();

        for (const attribute of queryResults.data.attributes) {
            let result = results.get(attribute.extensionId);
            if (result == undefined) {
                result = [0, 0];
                results.set(attribute.extensionId, result);
            }

            result[0] += 1;

            if (attribute.type === "writes") {
                for (const localAttribute of flowFileAttributes) {
                    if (attribute.name === localAttribute) {
                        result[1] += 1;
                    }
                }
            }
        }

        return Array.from(results.entries()).filter(x => x[1][1] > 0).map(x => {
            return {
                extensionId: x[0],
                total: x[1][0],
                sameCount: x[1][1],
                matchPercent: (x[1][1]) / (x[1][0]),
            }
        });
    }, [flowFile, queryResults.data]);

    const tableProps = useNf2tTable({
        childProps: undefined,
        snackbarProps: snackbarResults,
        rows: evaluatedProcessors,
        columns: [
            {
                columnName: 'Extension Id',
                bodyRow: ({ row }) => <Link to="/extensionLookup" search={{ name: row.extensionId }}><MuiLink component="span">{row.extensionId}</MuiLink></Link>,
                rowToString: (row) => row.extensionId,
            },
            {
                columnName: 'Count',
                bodyRow: ({ row }) => <>{Math.round(row.matchPercent * 100)}% ({row.sameCount}/{row.total})</>,
                rowToString: (row) => row.matchPercent.toString(),
                compareFn: (a, b) => a.matchPercent - b.matchPercent,
                defaultSortDirection: "desc",
            },
        ],
        canEditColumn: false,
    });

    return (
        <>
            <Nf2tHeader to={routeId} />

            <p><UnpackageLink /></p>

            <h5>1. Packaged FlowFile</h5>
            <h5>2. Unpackaged FlowFile Attributes</h5>
            <p>Download FlowFile Attributes.</p>
            <AttributesTable
                {...snackbarResults}
                flowFile={flowFile}
                setFlowFile={setFlowFile}
                canEdit={false}
            />

            <ButtonGroup>
                <AttributeDownload
                    {...snackbarResults}
                    flowFile={flowFile}
                />
                <ContentDownloadButton {...snackbarResults} flowFile={flowFile} />
            </ButtonGroup>

            <h5>3. Possible Processors</h5>
            <p>These are processors which might have updated this FlowFile.</p>
            <Nf2tTable {...tableProps} />

            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}