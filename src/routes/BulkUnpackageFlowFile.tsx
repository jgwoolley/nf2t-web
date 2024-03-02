import { Box, LinearProgress, Snackbar, TextField, Tooltip, Typography } from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import unpackageFlowFile from '../utils/unpackageFlowFile';
import Spacing from '../components/Spacing';
import { downloadFile } from '../utils/downloadFile';
import references from '../utils/references';
import ExternalLink from '../components/ExternalLink';

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

const defaultTotal = -1;
const defaultCurrent = 0;

export function UnPackageNifi() {
    const [total, setTotal] = useState(defaultTotal);
    const [current, setCurrent] = useState(defaultCurrent);
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("No Message");
    const [_attributes, setAttributes] = useState<string[]>();

    document.title = "FlowFile Tools - UnPackage"

    const submitAlert = (message: string) => {
        setMessage(message);
        setOpenAlert(true);
    }

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenAlert(false);
    };

    const resetProgress = () => {
        setTotal(defaultTotal);
        setCurrent(defaultCurrent);
    }

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            resetProgress();
            const files = e.target.files;
            if (files === null || files.length < 1) {
                submitAlert(`At least one flow file should be provided: ${files?.length}`)
                return;
            }
            setCurrent(0);
            setTotal(files.length);

            const uniqueAttributes = new Set<string>();
            const rows: Map<string, string>[] = [];

            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                setCurrent(fileIndex);
                console.log({ fileIndex: fileIndex, length: files.length });
                const file = files[fileIndex];
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function () {
                        const buffer = reader.result;
                        if (!(buffer instanceof ArrayBuffer)) {
                            resolve(1);
                            return;
                        }
                        try {
                            const result = unpackageFlowFile(buffer);
                            if (result == undefined) {
                                resolve(2);
                                return;
                            }
                            result.attributes.forEach((_value, key) => uniqueAttributes.add(key));
                            rows.push(result.attributes);
                        } catch (e) {
                            resolve(3);
                            console.error(e);
                            submitAlert("error unpacking the file");
                            return;
                        }
                        resolve(0);
                    }
                    reader.readAsArrayBuffer(file);
                });
            }

            if (uniqueAttributes.size <= 0) {
                submitAlert("Did not find any attributes in the given files.");
                console.error({
                    uniqueAttributes: uniqueAttributes.size,
                    files: files.length,
                })
            }

            const attributes = Array.from(uniqueAttributes);
            setAttributes(attributes);

            if (attributes.length <= 0) {
                submitAlert("Did not find any attributes in the given files.");
                console.error({
                    uniqueAttributes: uniqueAttributes.size,
                    attributes: attributes.length,
                    files: files.length,
                })
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
            submitAlert("Downloaded bulk report");
        } catch (error) {
            console.error(error);
            submitAlert("Error");
        }
        resetProgress();
    }

    return (
        <>
            <h4>Flow File Unpackager</h4>
            <p>Javascript Port of the <ExternalLink href={references.FlowFileUnpackagerV3}>FlowFileUnpackagerV3</ExternalLink> class.</p>
            <h5>Packaged Flow Files</h5>
            <TextField inputProps={{ multiple: true }} type="file" onChange={onUpload} />
            <Spacing />
            <LinearProgressWithLabel current={current} total={total} />
            <Spacing />
            {/* {attributes && (
                <>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Flow File Attribute</TableCell>
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

            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={handleClose}
                message={message}
            />
        </>
    )
}

export default UnPackageNifi;