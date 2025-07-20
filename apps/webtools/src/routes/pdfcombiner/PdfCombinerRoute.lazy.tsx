import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { ChangeEvent, useCallback, useState } from "react";
import { Button, ButtonGroup, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import { PageSizes, PDFDocument, PDFImage } from "pdf-lib";
import { downloadFile } from "../../utils/downloadFile";
import { convertBytes } from '../../utils/convertBytes';
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FileUploadOutlined } from "@mui/icons-material";

export const Route = createLazyRoute("/mergecidrs")({
    component: PdfCombinerComponent,
})

type PdfCombinerRow = {
    // TODO: Rethink this to take raw file? So it can be rendered in iframe?
    file: File,
    pageCount: number,
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function PdfCombinerComponent() {
    const [files, setFiles] = useState<PdfCombinerRow[]>([]);
    const snackbarProps = useNf2tSnackbar();

    const onInputChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files == undefined) {
            return;
        }
        const files: PdfCombinerRow[] = [];
        let errors: unknown[] = [];
        for (const file of e.target.files) {
            if (file.type === "application/pdf") {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(arrayBuffer);
                    files.push({
                        file: file,
                        pageCount: pdfDoc.getPageCount(),
                    });
                } catch (e) {
                    errors.push(e);
                }
            }
            else if (file.type === 'image/jpeg' || file.type === 'image/png') {
                try {
                    const imageBytes = await readFileAsArrayBuffer(file);
                    const pdfDoc = await PDFDocument.create(); // Create a new PDF for each image
                    let image: PDFImage | undefined;
                    if (file.type === 'image/jpeg') {
                        image = await pdfDoc.embedJpg(imageBytes);
                    } else if (file.type === 'image/png') {
                        image = await pdfDoc.embedPng(imageBytes);
                    }
                    if (image) {
                        const page = pdfDoc.addPage(PageSizes.A4);
                        const { width, height } = page.getSize();
                        const imageDims = image.scaleToFit(width - 50, height - 50);

                        page.drawImage(image, {
                            x: (width - imageDims.width) / 2,
                            y: (height - imageDims.height) / 2,
                            width: imageDims.width,
                            height: imageDims.height,
                        });

                        const pdfBytes = await pdfDoc.save();
                        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                        files.push({
                            // Use the original file name or a more descriptive one
                            file: new File([blob], `${file.name}.pdf`, { type: 'application/pdf' }),
                            pageCount: pdfDoc.getPageCount(),
                        });
                    }
                } catch (err) {
                    errors.push(err);
                }
            }
        }

        setFiles(files);
        if (errors.length === 0) {
            snackbarProps.submitSnackbarMessage(`Processed ${files.length} PDF(s) successfully.`, "success");
        } else {
            snackbarProps.submitSnackbarMessage(`Processed ${files.length} PDF(s) successfully, with ${errors.length} failure(s).`, "warning", errors);
        }
    }, [snackbarProps, setFiles]);

    const onClick = useCallback(async () => {
        if (files.length <= 0) {
            return;
        }
        const mergedPdf = await PDFDocument.create();
        let filename = "merged.pdf";

        const errors: unknown[] = [];

        for (const file of files) {
            try {
                const arrayBuffer = await file.file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            } catch (e) {
                snackbarProps.submitSnackbarMessage("Could not read given PDF.", "error", e);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        downloadFile(new File([blob], filename));
        if (errors.length === 0) {
            snackbarProps.submitSnackbarMessage(`Generated PDF successfully.`, "success");
        } else {
            snackbarProps.submitSnackbarMessage(`Generated PDF successfully, with ${errors.length} failure(s).`, "warning", errors);
        }
    }, [files, snackbarProps]);

    return (
        <>
            <Nf2tHeader to="/pdfcombiner" />

            <h3>Choose PDF File(s)</h3>

            <IconButton component="label">
                <FileUploadOutlined />
                <input
                    multiple={true}
                    style={{ display: "none" }}
                    type="file"
                    hidden
                    onChange={onInputChange}
                />
            </IconButton>
            {files?.length !== 0 && (
                <>
                    <h3>Review / Reorder PDF File(s)</h3>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>File Name (Click to Open)</TableCell>
                                    <TableCell>Page Count</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Utilities</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {files.map((x, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ cursor: "pointer" }} onChange={async () => {
                                            downloadFile(x.file);
                                        }}><Tooltip title="Open PDF"><span>{x.file.name}</span></Tooltip></TableCell>
                                        <TableCell>{x.pageCount}</TableCell>
                                        <TableCell>{convertBytes(x.file.size)}</TableCell>
                                        <TableCell>
                                            <ButtonGroup>
                                                {index !== 0 && (
                                                    <Tooltip title="Move File Up" style={{ cursor: "pointer" }} onClick={() => {
                                                        if (index > 0 && index < files.length) {
                                                            [files[index - 1], files[index]] = [files[index], files[index - 1]];
                                                            setFiles([...files]);
                                                        }
                                                    }}><IconButton>
                                                            <ArrowUpwardIcon />
                                                        </IconButton></Tooltip>
                                                )}
                                                {index !== files.length - 1 && (
                                                    <Tooltip title="Move File Down" style={{ cursor: "pointer" }} onClick={() => {
                                                        if (index >= 0 && index < files.length - 1) {
                                                            [files[index + 1], files[index]] = [files[index], files[index + 1]];
                                                            setFiles([...files]);
                                                        }
                                                    }}><IconButton>
                                                            <ArrowDownwardIcon />
                                                        </IconButton></Tooltip>
                                                )}
                                                <Tooltip title="Delete File" style={{ cursor: "pointer" }}>
                                                    <IconButton aria-label="delete" onClick={() => {
                                                        files.splice(index, 1);
                                                        setFiles([...files]);
                                                    }}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <h3>Merge PDF File(s)</h3>
                    <Button 
                        variant="outlined" 
                        onClick={onClick}
                    >Combine</Button>
                </>
            )}
            <Nf2tSnackbar {...snackbarProps} />
        </>

    );
}