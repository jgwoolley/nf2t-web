import { Box, LinearProgress, TextField, Tooltip, Typography } from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import unpackageFlowFile from '../utils/unpackageFlowFile';
import Spacing from '../components/Spacing';
import { downloadFile } from '../utils/downloadFile';
import NfftHeader, { routeDescriptions } from '../components/NfftHeader';
import NfftSnackbar, { useNfftSnackbar } from "../components/NfftSnackbar";

const defaultTotal = -1;
const defaultCurrent = 0;

// From: https://mui.com/material-ui/react-progress/
function LinearProgressWithLabel({ current, total }: { current: number, total: number }) {
    const value = useMemo(() => ((current) / total) * 100, [current, total])

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={value} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Tooltip title={`${current}/${total}`}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                        value,
                    )}%`}</Typography>
                </Tooltip>
            </Box>
        </Box>
    );
}

export function UnPackageNifi() {
    const snackbarResults = useNfftSnackbar();
    const {submitSnackbarMessage, submitSnackbarError } = snackbarResults;
    const [total, setTotal] = useState(defaultTotal);
    const [current, setCurrent] = useState(defaultCurrent);
    const [_attributes, setAttributes] = useState<string[]>();

    const resetProgress = () => {
        setTotal(defaultTotal);
        setCurrent(defaultCurrent);
    }

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            resetProgress();
            const files = e.target.files;
            if (files === null || files.length < 1) {
                submitSnackbarError(`At least one FlowFile should be provided: ${files?.length}`)
                return;
            }
            setCurrent(0);
            setTotal(files.length);

            const uniqueAttributes = new Set<string>();
            const rows: Map<string, string>[] = [];
            console.log(`Starting to process ${files.length} file(s).`)

            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                setCurrent(fileIndex);
                const file = files[fileIndex];
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function () {
                        const buffer = reader.result;
                        if (!(buffer instanceof ArrayBuffer)) {
                            console.error("Buffer not ArrayBuffer");
                            resolve(1);
                            return;
                        }
                        try {
                            const result = unpackageFlowFile(buffer);
                            if (result == undefined) {
                                console.error("Recieved no result from unpackageFlowFile.");
                                resolve(2);
                                return;
                            }
                            result.attributes.forEach((_value, key) => uniqueAttributes.add(key));
                            rows.push(result.attributes);
                        } catch (e) {
                            console.error(e);
                            resolve(3);
                            return;
                        }
                        resolve(0);
                    }
                    reader.readAsArrayBuffer(file);
                });
            }

            if (uniqueAttributes.size <= 0) {
                submitSnackbarError("Did not find any attributes in the given files.",
                {
                    uniqueAttributes: uniqueAttributes.size,
                    files: files.length,
                });
                return;
            }

            const attributes = Array.from(uniqueAttributes);
            setAttributes(attributes);

            if (attributes.length <= 0) {
                submitSnackbarError("Did not find any attributes in the given files.", {
                    uniqueAttributes: uniqueAttributes.size,
                    attributes: attributes.length,
                    files: files.length,
                });
                return;
            }

            let content = attributes.map(x => JSON.stringify(x)).join(",");
            content += "\n";

            for (const row of rows) {
                for (const key of attributes) {
                    content += JSON.stringify(row.get(key) || "")
                    content += ","
                }
                content += "\n"
            }

            const blob = new Blob([content], {
                type: "text/csv",
            })

            downloadFile(blob, "bulk.csv");
            submitSnackbarMessage("Downloaded bulk report");
        } catch (error) {
            submitSnackbarError("Error", error);
        }
        resetProgress();
    }


    return (
        <>
            <NfftHeader {...routeDescriptions.bulkUnpackage} />
            <h5>1. Packaged FlowFiles</h5>
            <p>Provide multiple FlowFiles.</p>
            <TextField inputProps={{ multiple: true }} type="file" onChange={onUpload} />
            <Spacing />
            <h5>2. Download FlowFile Attributes CSV</h5>
            <p>A CSV will automatically be downloaded with all of the FlowFile attributes for each FlowFile provided. This may take some time.</p>
            <LinearProgressWithLabel current={current} total={total} />
            <Spacing />
            {/* {attributes && (
                <>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>FlowFile Attribute</TableCell>
                                <TableCell>Enabled</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attributes.map((value, attributeIndex) => (
                                <TableRow key={attributeIndex}>
                                    <TableCell>{value}</TableCell>
                                    <TableCell>True</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Spacing />
                </>
            )} */}

            <NfftSnackbar {...snackbarResults} />
        </>
    )
}

export default UnPackageNifi;