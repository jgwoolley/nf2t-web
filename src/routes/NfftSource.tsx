import { useEffect, useState } from "react";
import NfftHeader, { routeDescriptions } from "../components/NfftHeader";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { z } from "zod";

export const GitInfoSchema = z.object({
    H: z.string(),
    an: z.string(),
    at: z.string(),
    ae: z.string(),
})

export type GitInfo = z.infer<typeof GitInfoSchema>;

export const BuildInfoSchema = z.object({
    git: GitInfoSchema.optional(),
})

export type BuildInfo = z.infer<typeof BuildInfoSchema>;

export default function NfftSource() {
    const [buildinfo, setBuildinfo] = useState<BuildInfo>();
    const [authorDate, setAuthorDate] = useState<Date>();

    useEffect(() =>{
        fetch("./buildinfo.json")
            .then( x => {
                if(x.ok) {
                    return x;
                }

                throw new Error("Did not recieve OK response")
            })
            .then( x => x.json())
            .then( x => {
                const result = BuildInfoSchema.safeParse(x);
                if(result.success) {
                    setBuildinfo(result.data);
                } else {
                    console.error(result.error);
                }
            });
    }, []);

    useEffect(() =>{
        if(buildinfo?.git == undefined) {
            return;
        }

        setAuthorDate(new Date(parseInt(buildinfo.git.at) * 1000));
    }, [buildinfo]);

    return (
        <>
            <NfftHeader {...routeDescriptions.source}/>
            <Table>
                <TableBody>
                    {buildinfo?.git && (
                        <>
                        <TableRow>
                            <TableCell>Commit</TableCell>
                            <TableCell>{buildinfo.git.H || "No build info yet"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>{buildinfo.git.an || "No build info yet"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Commit Author</TableCell>
                            <TableCell>{buildinfo.git.ae || "No build info yet"}</TableCell>
                        </TableRow>
                        </>
                    )}                    
                    <TableRow>
                        <TableCell>Commit Date</TableCell>
                        <TableCell>{authorDate?.toLocaleString() || "No build info yet"}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          
        </>
    )
}