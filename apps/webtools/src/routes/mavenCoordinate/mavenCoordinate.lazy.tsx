import Nf2tHeader from "../../components/Nf2tHeader";
import { createLazyRoute, getRouteApi, useNavigate, UseNavigateResult } from "@tanstack/react-router";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { useNf2tSnackbar } from '../../hooks/useNf2tSnackbar';
import { Autocomplete, Box, Button, ButtonGroup, TextField } from "@mui/material";
import { useCallback, useMemo } from "react";
import ExternalLink from "../../components/ExternalLink";
import CodeSnippet from "../../components/CodeSnippet";
import { DownloadMavenSearchParams } from "./searchParams";
import { z } from "zod";
import useQueryMavenCoordinates, { MAVEN_COORDINATE_STORE, MavenCoordinate, MavenCoordinateSchema, openNf2tMavenCoordinateDB, UseQueryAllMavenCoordinatesDBResult } from "../../hooks/useQueryAllMavenDB";
import { Link as MuiLink } from "@mui/material";
import { Link } from '@tanstack/react-router';

const routeId = "/mavenCoordinate" as const;

const route = getRouteApi(routeId);

export const DownloadMavenRoute = createLazyRoute(routeId)({
    component: BuildProcess,
})

type FieldTextInputProps = {
    fields: MavenCoordinate,
    navigate: UseNavigateResult<"/mavenCoordinate">,
    label: keyof MavenCoordinate,
    coordinateResult: UseQueryAllMavenCoordinatesDBResult,
};

function FieldTextInput({ label, fields, navigate, coordinateResult }: FieldTextInputProps) {
    const validation = useMemo(() => {
        return MavenCoordinateSchema.shape[label].safeParse(fields[label]);
    }, [fields[label]]);

    return (
        <Autocomplete
            fullWidth
            freeSolo
            options={coordinateResult.data?.uniqueValues.get(label) || []}
            value={fields[label]}
            onChange={(_, value) => {
                const newValue: DownloadMavenSearchParams = {
                    ...fields,
                };

                if (value != undefined) {
                    newValue[label] = value;

                    navigate({
                        search: newValue,
                    });
                }
            }}
            renderInput={(params) => <TextField {...params}
                label={label}
                variant="outlined"
                helperText={validation?.error?.issues.map(x => x.message).join(", ")}
                error={validation.error != undefined}
            />} />
    )
}

type CoordinateTextInputProps = {
    coordinates: string,
    validation: z.SafeParseReturnType<unknown, MavenCoordinate>
    setCoordinate: (value: string) => void,
}


function CoordinateTextInput({ setCoordinate, coordinates, validation }: CoordinateTextInputProps) {
    console.log(validation?.error);
    return (
        <TextField
            fullWidth
            label={"coordinate"}
            variant="outlined"
            value={coordinates}
            helperText={validation?.error ? "Error in given coordinates. Please review issues above" : undefined}
            error={validation.error != undefined}
            onChange={(e) => {
                setCoordinate(e.target.value);
            }}
        />
    )
}

export default function BuildProcess() {
    const snackbarProps = useNf2tSnackbar();
    const fields = route.useSearch();
    const { endpoint, groupId, artifactId, version, packaging } = fields;
    const navigate = useNavigate({ from: routeId });

    const validation = useMemo(() => {
        return MavenCoordinateSchema.safeParse(fields);
    }, [fields]);

    const coordinates = useMemo(() => {
        return `${groupId}:${artifactId}:${packaging}:${version}`;
    },
        [groupId, artifactId, version, packaging]
    );

    const url = useMemo(() => {
        return `${endpoint}${endpoint.endsWith("/") ? "" : "/"}${groupId.split(".").join("/")}/${artifactId}/${version}/${artifactId}-${version}.${packaging}`;
    },
        [groupId, artifactId, version, packaging]
    );

    const pomCode = useMemo(() => {
        return `<dependency><groupId>${groupId}</groupId><artifactId>${artifactId}</artifactId><version>${version}</version></dependency>`;
    },
        [groupId, artifactId, version, packaging]
    );

    const curlCode = useMemo(() => {
        return `curl --dump-header header.txt --remote-name --remote-header-name ${url}`;
    },
        [url]
    );

    const setCoordinateObject = useCallback((value: Partial<MavenCoordinate>) => {
        const search: MavenCoordinate = {
            ...fields,
            ...value,
        };
        console.log(search);

        navigate({
            search,
        });
    }, [navigate, fields]);

    const setCoordinate = useCallback((value: string) => {
        const split = value.split(":");
        if (split.length === 3) {
            setCoordinateObject({
                groupId: split[0],
                artifactId: split[1],
                version: split[2],
            });
        } else if (split.length === 4) {
            setCoordinateObject({
                groupId: split[0],
                artifactId: split[1],
                packaging: split[2],
                version: split[3],
            });
        } else if (split.length === 5) {
            setCoordinateObject({
                groupId: split[0],
                artifactId: split[1],
                packaging: split[2],
                version: split[4],
            });
        }



    }, [setCoordinateObject]);

    const coordinateResult = useQueryMavenCoordinates();

    return (
        <>
            <Nf2tHeader to={routeId} />

            <h2>Input</h2>
            <Box
                component="form"
                sx={{ '& .MuiTextField-root': { m: 1 } }}
            >
                <FieldTextInput fields={fields} label={"endpoint"} navigate={navigate} coordinateResult={coordinateResult} />
                <FieldTextInput fields={fields} label={"groupId"} navigate={navigate} coordinateResult={coordinateResult} />
                <FieldTextInput fields={fields} label={"artifactId"} navigate={navigate} coordinateResult={coordinateResult} />
                <FieldTextInput fields={fields} label={"version"} navigate={navigate} coordinateResult={coordinateResult} />
                <FieldTextInput fields={fields} label={"packaging"} navigate={navigate} coordinateResult={coordinateResult} />

                <CoordinateTextInput setCoordinate={setCoordinate} coordinates={coordinates} validation={validation} />
            </Box>
            <h3>Autocomplete</h3>
            <p>Results can be cached for future autocomplete. <Link to="/mavenCoordinateList">
                <MuiLink component="span">Click here to see those results.</MuiLink>
            </Link></p>

            <ButtonGroup>
                <Button variant="outlined" onClick={async () => {
                    const db = await openNf2tMavenCoordinateDB();
                    db.put(MAVEN_COORDINATE_STORE, fields);
                    console.log(fields);
                }}>Save</Button>
                <Button variant="outlined" onClick={async () => {
                    const db = await openNf2tMavenCoordinateDB();
                    db.deleteObjectStore(MAVEN_COORDINATE_STORE);
                }}>Clear All</Button>
            </ButtonGroup>

            {validation.success === true && (
                <>
                    <h2>Results</h2>
                    <h3>URL</h3>
                    <p>Click to open link in new tab.</p>
                    <p><ExternalLink href={url}>{url}</ExternalLink></p>

                    <h3>Maven POM Dependency</h3>
                    <p>Click to copy Maven POM Dependency into Clipboard.</p>
                    <p><CodeSnippet {...snackbarProps} code={pomCode} /></p>

                    <h3>cURL Code Snippet</h3>
                    <p>Click to copy cURL command into Clipboard.</p>
                    <p><CodeSnippet {...snackbarProps} code={curlCode} /></p>
                </>
            )}

            <Nf2tSnackbar {...snackbarProps} />
        </>
    );
}