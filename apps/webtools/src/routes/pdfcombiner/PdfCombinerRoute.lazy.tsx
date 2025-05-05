import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { ChangeEvent, useState } from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { PDFDocument } from "pdf-lib";
import { downloadFile } from "../../utils/downloadFile";
import { convertBytes } from '../../utils/convertBytes';

export const Route = createLazyRoute("/mergecidrs")({
    component: PdfCombinerComponent,
})

type PdfCombinerRow = {
    file: File,
    pageCount: number,
}

function PdfCombinerComponent() {
    const [files, setFiles] = useState<PdfCombinerRow[]>([]);

    return (
        <>
            <Nf2tHeader to="/pdfcombiner" />

            <h3>Choose PDF File(s)</h3>
            <TextField inputProps={{ multiple: true }} type="file" onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files == undefined) {
                    return;
                }
                const files: PdfCombinerRow[] = [];
                let errorCount = 0;
                for (const file of e.target.files) {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const pdfDoc = await PDFDocument.load(arrayBuffer);
                        files.push({
                            file: file,
                            pageCount: pdfDoc.getPageCount(),
                        });
                    } catch (e) {
                        errorCount += 1;
                        console.error(e);
                    }
                }

                setFiles(files);
            }} />
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
                                    <TableCell>Move File</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {files?.map((x, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ cursor: "pointer" }} onChange={async () => {
                                            downloadFile(x.file);
                                        }}>{x.file.name}</TableCell>
                                        <TableCell>{x.pageCount}</TableCell>
                                        <TableCell>{convertBytes(x.file.size)}</TableCell>
                                        <TableCell>
                                            {index !== 0 && <span style={{ cursor: "pointer" }} onClick={() => {
                                                if (index > 0 && index < files.length) {
                                                    [files[index - 1], files[index]] = [files[index], files[index - 1]];
                                                    setFiles([...files]);
                                                }
                                            }}>⬆️</span>}
                                            {(index !== 0 && index !== files.length - 1) && <span> / </span>}
                                            {index !== files.length - 1 && <span style={{ cursor: "pointer" }} onClick={() => {
                                                if (index >= 0 && index < files.length - 1) {
                                                    [files[index + 1], files[index]] = [files[index], files[index + 1]];
                                                    setFiles([...files]);
                                                }
                                            }}>⬇️</span>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <h3>Merge PDF File(s)</h3>
                    <Button variant="outlined" onClick={async () => {
                        if (files.length <= 0) {
                            return;
                        }
                        const mergedPdf = await PDFDocument.create();
                        let filename = "merged.pdf";

                        for (const file of files) {
                            try {
                                const arrayBuffer = await file.file.arrayBuffer();
                                const pdfDoc = await PDFDocument.load(arrayBuffer);
                                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                                copiedPages.forEach((page) => mergedPdf.addPage(page));
                            } catch (e) {
                                console.error(e);
                            }
                        }

                        const mergedPdfBytes = await mergedPdf.save();
                        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
                        downloadFile(new File([blob], filename));
                    }}>Combine</Button>
                </>
            )}
        </>

    );
}