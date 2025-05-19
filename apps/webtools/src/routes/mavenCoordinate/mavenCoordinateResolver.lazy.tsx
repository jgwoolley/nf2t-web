import {
    Add as AddIcon,
    // CallSplit as CallSplitIcon,
    // ContentCopy as ContentCopyIcon,
    Delete as DeleteIcon,
    // FileDownload as FileDownloadIcon,
    FileUpload as FileUploadIcon,
} from "@mui/icons-material";

import { 
    ButtonGroup, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle, 
    FormControl, 
    IconButton, 
    InputLabel, 
    MenuItem, 
    Select, 
    SelectChangeEvent, 
    styled, 
    TextField, 
    Tooltip,
} from "@mui/material";
import { 
    // ReactNode, 
    SetStateAction, 
    // useMemo, 
    useRef, 
    useState,
} from "react";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import Nf2tTable from "../../components/Nf2tTable";
import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import Spacing from "../../components/Spacing";

const routeId = "/mavenCoordinateResolver";

export const MavenCoordinateResolverRoute = createLazyRoute(routeId)({
    component: MavenCoordinateResolverComponent,
})

type MavenCoordinate = {
    groupId: string,
    artifactId: string,
    version: string,
    packaging?: string,
    classifier?: string,
}

// type MavenCoordinateOutputConsumer = (coordinates: MavenCoordinate[], urls: string[]) => {
//     node: ReactNode,
//     blob: Blob,
//     filename: string,
// }

type MavenCoordinateInputConsumerResult = {
    coordinates: MavenCoordinate[],
    urls: string[],
};

type MavenCoordinateInputConsumer = (text: string) => MavenCoordinateInputConsumerResult;

// function mavenCoordinateValidator(coordinate: MavenCoordinate) {
//     return coordinate.groupId !== "" && coordinate.artifactId !== "" && coordinate.version !== "";
// }

type CoordinateFieldComponentProps = {
    index: number,
    field: keyof MavenCoordinate,
    coordinates: MavenCoordinate[],
    setCoordinates: React.Dispatch<SetStateAction<MavenCoordinate[]>>,
};

function CoordinateFieldComponent({ index, field, coordinates, setCoordinates }: CoordinateFieldComponentProps) {
    const coordinate = coordinates[index];
    return (
        <TextField value={coordinate[field]} onChange={(x) => {
            coordinate[field] = x.target.value;
            setCoordinates([...coordinates]);
        }} />
    )
}

const VisuallyHiddenInput = styled('input') ({
    clip: "rect(0 0 0 0)",
    clipPath: "inset (50%)",
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// type ExpandedCoordinate = {
//     packaging: string,
//     classifier?: string,
// }

function MavenCoordinateResolverComponent() {
    const nf2tSnackBarProps = useNf2tSnackbar();

    // const expandedCoordinates: ExpandedCoordinate[] = [
    //     {
    //         packaging: "jar",
    //         classifier: "javadoc",
    //     },
    //     {
    //         packaging: "jar",
    //         classifier: "sources",
    //     },
    //     {
    //         packaging: "pom",
    //     },
    // ];

    const inputOptions: Record<string, MavenCoordinateInputConsumer> = {
        "json": (text) => JSON.parse(text),
        "Maven Coordinates": (text) => {
            const newCoordinates: MavenCoordinate[] = text.split(/\s+/).map(x => x.split(":")).filter(x => x.length >=3 && x.length <=5).map(x => {
                return {
                    groupId: x[0],
                    artifactId: x[1],
                    version: x[2],
                    packaging: x.length >= 3 ? x[3] : undefined,
                    classifier: x.length >= 4 ? x[4] : undefined,
                }
            });
            
            return {
                coordinates: newCoordinates,
                urls: [],
            }
        },
    };

    // const outputOptions: Record<string, MavenCoordinateOutputConsumer> = {
    //     "json": (coordinates, urls) => {
    //         const text = JSON.stringify({coordinates, urls});

    //         return {
    //             node: text,
    //             blob: new Blob([text], {type: "application/json"}),
    //             filename: "output.json",
    //         }
    //     }
    // };

    const [inputValue, setInputValue] = useState<string>("");
    const [inputOption, setInputOption] = useState<keyof typeof inputOptions>("Maven Coordinates");
    // const [outputOption, setOutputOption] = useState<keyof typeof outputOptions>("json");
    const [coordinates, setCoordinates] = useState<MavenCoordinate[]>([]);
    const [urls, setUrls] = useState<string[]>([]);

    // function handleChangeOutputOption(event: SelectChangeEvent<string>) : void {
    //     const { value } = event.target;

    //     if(value in outputOptions) {
    //         setOutputOption(value);
    //     } else {
    //         nf2tSnackBarProps.submitSnackbarMessage(`No ${value} option.`, "error")
    //     }
    // }

    function handleChangeInputOption(event: SelectChangeEvent<string>) : void {
        const { value } = event.target;

        if(value in inputOptions) {
            setInputOption(value);
        } else {
            nf2tSnackBarProps.submitSnackbarMessage(`No ${value} option.`, "error")
        }
    }

    // const output = useMemo(() => {
    //     const convertFunction = outputOptions[outputOption];
    //     return convertFunction(coordinates, urls);
    // }, [outputOptions, outputOption, coordinates, urls]);

    const [openAddCoordinatesDialog, setOpenAddCoordinatesDialog] = useState(false);

    const handleClickOpenAddCoordinatesDialog = () => {
        setOpenAddCoordinatesDialog(true);
    }

    const handleCloseAddCoordinatesDialog = () => {
        setOpenAddCoordinatesDialog(false);
        setInputValue("");
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadInputButtonClick = (): void => {
        if(fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const handleInputFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const {files} = event.target;
        if(files == undefined || files.length <= 0) {
            return;
        }

        const processInput = inputOptions[inputOption];
        const errors: {error: unknown, file: File}[] = [];
        for(const file of files) {
            try {
                const text = await file.text();
                const {coordinates: newCoordinates, urls: newUrls} = processInput(text);
                coordinates.push(...newCoordinates);
                urls.push(...newUrls);
            } catch(e) {
                errors.push({error: e, file: file});
            }
        }

        if(errors.length > 0) {
            nf2tSnackBarProps.submitSnackbarMessage(`Unable to process ${errors.length} file(s).`, "error", errors);
        } else {
            nf2tSnackBarProps.submitSnackbarMessage(`Processed ${files.length} file(s).`, "success");
        }
        setCoordinates([...coordinates]);
        setUrls([...urls]);
        handleCloseAddCoordinatesDialog();
    }

const tableProps = useNf2tTable({
        childProps: null,
        snackbarProps: nf2tSnackBarProps,
        canEditColumn: false,
        columns: [
            {
                columnName: "GroupId",
                bodyRow: (x) => <CoordinateFieldComponent field={"groupId"} index={x.rowIndex} coordinates={coordinates} setCoordinates={setCoordinates} />,
                rowToString: (row) => row.groupId,
            },
            {
                columnName: "ArtifactId",
                bodyRow: (x) => <CoordinateFieldComponent field={"artifactId"} index={x.rowIndex} coordinates={coordinates} setCoordinates={setCoordinates} />,
                rowToString: (row) => row.artifactId,
            },
            {
                columnName: "Version",
                bodyRow: (x) => <CoordinateFieldComponent field={"version"} index={x.rowIndex} coordinates={coordinates} setCoordinates={setCoordinates} />,
                rowToString: (row) => row.version,
            },
            {
                columnName: "Packaging",
                bodyRow: (x) => <CoordinateFieldComponent field={"packaging"} index={x.rowIndex} coordinates={coordinates} setCoordinates={setCoordinates} />,
                rowToString: (row) => row.packaging || "",
            },
            {
                columnName: "Classifier",
                bodyRow: (x) => <CoordinateFieldComponent field={"classifier"} index={x.rowIndex} coordinates={coordinates} setCoordinates={setCoordinates} />,
                rowToString: (row) => row.classifier || "",
            },
        ],
        rows: coordinates,
    });

    return (
        <>
            <Nf2tHeader to={routeId} />
            <Nf2tTable {...tableProps} />

            <Dialog
                open={openAddCoordinatesDialog}
                onClose={handleCloseAddCoordinatesDialog}
            >
                <DialogTitle>Add Maven Coordinates</DialogTitle>
                <DialogContent>
                    <DialogContentText>Specify the input format, and then either upload file(s) or input text.</DialogContentText>
                    <Spacing />

                    <FormControl>
                        <InputLabel id="maven-coordinate-input-option-label">Input Option</InputLabel>
                        <Select
                            labelId="maven-coordinate-input-option-label"
                            id="maven-coordinate-input-option-select"
                            value={inputOption}
                            onChange={handleChangeInputOption}
                        >
                            {Object.entries(inputOptions).map((x, key) => <MenuItem key={key} value={x[0]}>{x[0]}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Spacing />
                    <TextField 
                        label="Input"
                        value={inputValue}
                        onChange={(x) => setInputValue(x.target.value)}
                        multiline
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Tooltip title="Upload File(s) in input format">
                        <IconButton onClick={handleUploadInputButtonClick}>
                            <FileUploadIcon />
                            <VisuallyHiddenInput 
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleInputFileChange}
                            />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Maven Coordinates">
                        <IconButton onClick={() => {
                            const processInput = inputOptions[inputOption];
                            const {coordinates: newCoordinates, urls: newUrls} = processInput(inputValue);
                            setCoordinates([...coordinates, ...newCoordinates]);
                            setUrls([...urls, ...newUrls]);
                            handleCloseAddCoordinatesDialog();
                            nf2tSnackBarProps.submitSnackbarMessage(`Sucessfully submitted ${newCoordinates.length} new coordinate(s).`, "success");
                        }}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </DialogActions>
            </Dialog>

            <ButtonGroup>
                <Tooltip title="Delete all Maven Coordinates">
                    <IconButton onClick={() => setCoordinates([])}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add Maven Coordinate Row">
                    <IconButton onClick={() => setCoordinates([...coordinates, {groupId: "", artifactId: "", version: ""}])}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add Maven Coordinate(s)">
                    <IconButton onClick={handleClickOpenAddCoordinatesDialog}>
                        <FileUploadIcon />
                    </IconButton>
                </Tooltip>
            </ButtonGroup>
        </>
    )
}