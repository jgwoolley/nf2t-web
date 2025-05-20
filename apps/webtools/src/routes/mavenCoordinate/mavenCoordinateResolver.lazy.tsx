import {
    Add as AddIcon,
    CallSplit as CallSplitIcon,
    ContentCopy as ContentCopyIcon,
    Delete as DeleteIcon,
    FileDownload as FileDownloadIcon,
    FileUpload as FileUploadIcon,
    Edit as EditIcon,
    // VisibilityOff as VisibilityOffIcon,
    // Visibility as VisibilityOnIcon,
    ErrorOutline as ErrorOutlineIcon,
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
    ReactNode,
    SetStateAction,
    useMemo,
    // useMemo, 
    useRef,
    useState,
} from "react";
import { Nf2tSnackbarResult, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { BodyRowComponentProps, Nf2tTableColumnSpec, useNf2tTable } from "../../hooks/useNf2tTable";
import Nf2tTable from "../../components/Nf2tTable";
import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import Spacing from "../../components/Spacing";
import { downloadFile } from "../../utils/downloadFile";

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

type MavenCoordinateOutputConsumer = (coordinates: MavenCoordinate[], urls: string[]) => {
    node: ReactNode,
    file: File,
    text: string,
}

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
        <TextField
            label={field}
            value={coordinate[field]}
            onChange={(x) => {
                coordinate[field] = x.target.value;
                setCoordinates([...coordinates]);
            }}
        />
    )
}

const VisuallyHiddenInput = styled('input')({
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

type ExpandedCoordinate = {
    packaging: string,
    classifier?: string,
}

type AddCoordinatesDialogFromTextProps = {
    open: boolean,
    handleClose: () => void,
    inputValue: string,
    inputOptions: Record<string, MavenCoordinateInputConsumer>,
    setInputValue: React.Dispatch<SetStateAction<string>>,
    inputOption: string,
    handleChangeInputOption: (event: SelectChangeEvent<string>) => void,
    handleUploadInputButtonClick: () => void,
    fileInputRef: React.RefObject<HTMLInputElement>,
    handleInputFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>,
    nf2tSnackBarProps: Nf2tSnackbarResult,
    urls: string[],
    setUrls: React.Dispatch<SetStateAction<string[]>>,
    coordinates: MavenCoordinate[],
    setCoordinates: React.Dispatch<SetStateAction<MavenCoordinate[]>>,
}

type EditRowCellProps = {
    coordinates: MavenCoordinate[],
    setCoordinates: React.Dispatch<SetStateAction<MavenCoordinate[]>>,
    nf2tSnackBarProps: Nf2tSnackbarResult,
    setEditCoordinateIndex: React.Dispatch<SetStateAction<number>>,
    handleClickOpenEditCoordinatesDialog: (newCoordinates: MavenCoordinate[], index: number) => void,
} & BodyRowComponentProps<MavenCoordinate, null>;

function EditRowCell({
    coordinates,
    setCoordinates,
    rowIndex,
    row,
    nf2tSnackBarProps,
    handleClickOpenEditCoordinatesDialog,
}: EditRowCellProps) {
    const expandedCoordinates: ExpandedCoordinate[] = [
        {
            packaging: "jar",
            classifier: "javadoc",
        },
        {
            packaging: "jar",
            classifier: "sources",
        },
        {
            packaging: "pom",
        },
    ];

    return (
        <ButtonGroup>
            <Tooltip title="Edit Coordinate">
                <IconButton onClick={() => {
                    handleClickOpenEditCoordinatesDialog(coordinates, rowIndex);
                }}><EditIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Delete Coordinate">
                <IconButton onClick={() => {
                    coordinates.splice(rowIndex, 1);
                    setCoordinates([...coordinates]);
                }}><DeleteIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Copy Coordinate">
                <IconButton onClick={() => {
                    const newRow: MavenCoordinate = JSON.parse(JSON.stringify(row));
                    coordinates.splice(rowIndex + 1, 0, newRow);

                    setCoordinates([...coordinates]);
                }}><ContentCopyIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Expand Coordinate">
                <IconButton onClick={() => {
                    for (const { packaging, classifier } of expandedCoordinates) {
                        if (rowIndex >= 0 && rowIndex < coordinates.length) {
                            const newRow: MavenCoordinate = JSON.parse(JSON.stringify(row));
                            newRow.packaging = packaging;
                            newRow.classifier = classifier;
                            coordinates.splice(rowIndex + 1, 0, newRow);
                        } else {
                            nf2tSnackBarProps.submitSnackbarMessage("Tried to insert at invalid index", "error", { rowIndex })
                        }
                    }

                    setCoordinates([...coordinates]);
                }}><CallSplitIcon /></IconButton>
            </Tooltip>
        </ButtonGroup>
    )
}

type EditCoordinateDialogProps = {
    open: boolean,
    handleClose: () => void,
    rowIndex: number,
    coordinates: MavenCoordinate[],
    setCoordinates: React.Dispatch<SetStateAction<MavenCoordinate[]>>,
}

function EditCoordinateDialog({ open, handleClose, rowIndex, coordinates, setCoordinates }: EditCoordinateDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogTitle>Edit Maven Coordinate</DialogTitle>
            <DialogContent>
                <DialogContentText>Edit the Maven Coordinate.</DialogContentText>
                <Spacing />
                <FormControl>
                    <CoordinateFieldComponent
                        index={rowIndex}
                        field={"groupId"}
                        coordinates={coordinates}
                        setCoordinates={setCoordinates}
                    />
                    <Spacing />
                    <CoordinateFieldComponent
                        index={rowIndex}
                        field={"artifactId"}
                        coordinates={coordinates}
                        setCoordinates={setCoordinates}
                    />
                    <Spacing />
                    <CoordinateFieldComponent
                        index={rowIndex}
                        field={"version"}
                        coordinates={coordinates}
                        setCoordinates={setCoordinates}
                    />
                    <Spacing />
                    <CoordinateFieldComponent
                        index={rowIndex}
                        field={"packaging"}
                        coordinates={coordinates}
                        setCoordinates={setCoordinates}
                    />
                    <Spacing />
                    <CoordinateFieldComponent
                        index={rowIndex}
                        field={"classifier"}
                        coordinates={coordinates}
                        setCoordinates={setCoordinates}
                    />
                </FormControl>
            </DialogContent>
        </Dialog>
    )
}

function AddCoordinatesFromTextDialog({
    open,
    handleClose,
    inputOption,
    handleChangeInputOption,
    inputValue,
    inputOptions,
    setInputValue,
    handleUploadInputButtonClick,
    fileInputRef,
    handleInputFileChange,
    setUrls,
    nf2tSnackBarProps,
    urls,
    coordinates,
    setCoordinates,
}: AddCoordinatesDialogFromTextProps) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
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
                        const { coordinates: newCoordinates, urls: newUrls } = processInput(inputValue);
                        setCoordinates([...coordinates, ...newCoordinates]);
                        setUrls([...urls, ...newUrls]);
                        handleClose();
                        nf2tSnackBarProps.submitSnackbarMessage(`Sucessfully submitted ${newCoordinates.length} new coordinate(s).`, "success");
                    }}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            </DialogActions>
        </Dialog>
    )
}

// type CoordinateTableMode = "simple" | "complex";

function MavenCoordinateResolverComponent() {
    const nf2tSnackBarProps = useNf2tSnackbar();

    const inputOptions: Record<string, MavenCoordinateInputConsumer> = {
        "json": (text) => JSON.parse(text),
        "Maven Pom": (text) => {
            const newCoordinates: MavenCoordinate[] = [];
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            const dependencies = xml.getElementsByTagName("dependency");
            const plugins = xml.getElementsByTagName("plugin");

            for (const dependency of [...dependencies, ...plugins]) {
                const groupId = dependency.getElementsByTagName("groupId").item(0)?.textContent;
                const artifactId = dependency.getElementsByTagName("artifactId").item(0)?.textContent;
                const version = dependency.getElementsByTagName("version").item(0)?.textContent;
                const classifier = dependency.getElementsByTagName("classifier").item(0)?.textContent;
                const packaging = dependency.getElementsByTagName("packaging").item(0)?.textContent;

                newCoordinates.push({
                    groupId: groupId || "",
                    artifactId: artifactId || "",
                    version: version || "",
                    classifier: classifier || undefined,
                    packaging: packaging || undefined,
                });
            }



            return {
                coordinates: newCoordinates,
                urls: [],
            }
        },
        "Maven Coordinates": (text) => {
            const newCoordinates: MavenCoordinate[] = text.split(/\s+/).map(x => x.split(":")).filter(x => x.length >= 3 && x.length <= 5).map(x => {
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

    const outputOptions: Record<string, MavenCoordinateOutputConsumer> = {
        "pom": (coordinates) => {
            const xmlDoc = document.implementation.createDocument(null, "project");
            const dependenciesElement = xmlDoc.createElement("dependencies");
            xmlDoc.documentElement.appendChild(dependenciesElement);
            coordinates.forEach(coordinate => {
                const coordinateElement = xmlDoc.createElement("dependencies");
                dependenciesElement.appendChild(coordinateElement);
                const fields = ["groupId", "artifactId", "version"] as const;
                for (const field of fields) {
                    const fieldElement = xmlDoc.createElement(field);
                    fieldElement.textContent = coordinate[field];
                    coordinateElement.appendChild(fieldElement);
                }
            });

            const xmlString = new XMLSerializer().serializeToString(xmlDoc);

            return {
                node: xmlString,
                text: xmlString,
                file: new File([xmlString], "output.xml", { type: "text/xml" }),
            }
        },
        "json": (coordinates, urls) => {
            const text = JSON.stringify({ coordinates, urls });

            return {
                node: text,
                text: text,
                file: new File([text], "output.json", { type: "application/json" }),
            }
        },
        "coordinates": (coordinates) => {
            const results: string[] = coordinates.map(coordinate => {
                let result = `${coordinate.groupId}:${coordinate.artifactId}`;
                if (coordinate.packaging) {
                    result += `:${coordinate.packaging}`;
                }
                result += `:${coordinate.version}`;

                if (coordinate.classifier) {
                    result += `:${coordinate.classifier}`;
                }

                return result;
            });

            const text = results.join("\n");

            return {
                node: results.map(x => <p>{x}</p>),
                text: text,
                file: new File([text], "output.txt", { type: "text/plain" }),
            }
        }
    };
    const [editCoordinateIndex, setEditCoordinateIndex] = useState<number>(-1);

    const [inputValue, setInputValue] = useState<string>("");
    const [inputOption, setInputOption] = useState<keyof typeof inputOptions>("Maven Coordinates");
    const [outputOption, setOutputOption] = useState<keyof typeof outputOptions>("pom");
    const [coordinates, setCoordinates] = useState<MavenCoordinate[]>([]);
    const [urls, setUrls] = useState<string[]>([]);

    function handleChangeOutputOption(event: SelectChangeEvent<string>): void {
        const { value } = event.target;

        if (value in outputOptions) {
            setOutputOption(value);
        } else {
            nf2tSnackBarProps.submitSnackbarMessage(`No ${value} option.`, "error")
        }
    }

    function handleChangeInputOption(event: SelectChangeEvent<string>): void {
        const { value } = event.target;

        if (value in inputOptions) {
            setInputOption(value);
        } else {
            nf2tSnackBarProps.submitSnackbarMessage(`No ${value} option.`, "error")
        }
    }

    const output = useMemo(() => {
        const convertFunction = outputOptions[outputOption];
        return convertFunction(coordinates, urls);
    }, [outputOptions, outputOption, coordinates, urls]);

    const [openAddCoordinatesFromTextDialog, setOpenAddCoordinatesFromTextDialog] = useState(false);
    const [openEditCoordinatesDialog, setOpenEditCoordinatesDialog] = useState(false);
    // const [coordinateTableMode, setCoordinateTableMode] = useState<CoordinateTableMode>("simple");

    const handleClickOpenAddCoordinatesFromTextDialog = () => {
        setOpenAddCoordinatesFromTextDialog(true);
    }

    const handleClickOpenEditCoordinatesDialog = (newCoordinates: MavenCoordinate[], index: number) => {
        if (index < newCoordinates.length && index >= 0) {
            setOpenEditCoordinatesDialog(true);
            setEditCoordinateIndex(index);
        } else {
            nf2tSnackBarProps.submitSnackbarMessage("Unable to edit row", "error", {
                index: index,
                "coordinates.length": newCoordinates.length,
            });
        }
        setCoordinates(newCoordinates);
    }

    const handleCloseDialogs = () => {
        setOpenAddCoordinatesFromTextDialog(false);
        setOpenEditCoordinatesDialog(false);
        setInputValue("");
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadInputButtonClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const handleInputFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const { files } = event.target;
        if (files == undefined || files.length <= 0) {
            return;
        }

        const processInput = inputOptions[inputOption];
        const errors: { error: unknown, file: File }[] = [];
        for (const file of files) {
            try {
                const text = await file.text();
                const { coordinates: newCoordinates, urls: newUrls } = processInput(text);
                coordinates.push(...newCoordinates);
                urls.push(...newUrls);
            } catch (e) {
                errors.push({ error: e, file: file });
            }
        }

        if (errors.length > 0) {
            nf2tSnackBarProps.submitSnackbarMessage(`Unable to process ${errors.length} file(s).`, "error", errors);
        } else {
            nf2tSnackBarProps.submitSnackbarMessage(`Processed ${files.length} file(s).`, "success");
        }
        setCoordinates([...coordinates]);
        setUrls([...urls]);
        handleCloseDialogs();
    }

    const columns = useMemo<Nf2tTableColumnSpec<MavenCoordinate, null>[]>(() => {
        const results: Nf2tTableColumnSpec<MavenCoordinate, null>[] = [
            {
                columnName: "GroupId",
                bodyRow: (x) => {
                    if (x.row.groupId.trim().length === 0) {
                        return <Tooltip title="Invalid Value">
                            <ErrorOutlineIcon color="error" sx={{ ml: 1, fontSize: 'small' }} />
                        </Tooltip>
                    }

                    return x.row.groupId;
                },
                rowToString: (row) => row.groupId,
            },
            {
                columnName: "ArtifactId",
                bodyRow: (x) => {
                    if (x.row.artifactId.trim().length === 0) {
                        return <Tooltip title="Invalid Value">
                            <ErrorOutlineIcon color="error" sx={{ ml: 1, fontSize: 'small' }} /></Tooltip>
                    }
                    return x.row.artifactId;
                },
                rowToString: (row) => row.artifactId,
            },
            {
                columnName: "Version",
                bodyRow: (x) => {
                    if (x.row.version.trim().length === 0) {
                        return <Tooltip title="Invalid Value">
                            <ErrorOutlineIcon color="error" sx={{ ml: 1, fontSize: 'small' }} />
                        </Tooltip>
                    }
                    return x.row.version;
                },
                rowToString: (row) => row.version,
            },
        ];
        // TODO: Doesn't work to swap this mode...

        // if(coordinateTableMode !== "simple") {
        results.push(
            {
                columnName: "Packaging",
                bodyRow: (x) => x.row.packaging,
                rowToString: (row) => row.packaging || "",
            },
            {
                columnName: "Classifier",
                bodyRow: (x) => x.row.classifier,
                rowToString: (row) => row.classifier || "",
            },
        )
        // }

        results.push(
            {
                columnName: "Edit",
                bodyRow: (x) => (
                    <EditRowCell
                        {...x}
                        nf2tSnackBarProps={nf2tSnackBarProps}
                        coordinates={coordinates}
                        setCoordinates={setCoordinates}
                        setEditCoordinateIndex={setEditCoordinateIndex}
                        handleClickOpenEditCoordinatesDialog={handleClickOpenEditCoordinatesDialog}
                    />
                ),
                rowToString: () => "",
            },
        )

        console.log(results);

        return results;
    }, [nf2tSnackBarProps, coordinates, setCoordinates, setEditCoordinateIndex, handleClickOpenEditCoordinatesDialog]);

    const tableProps = useNf2tTable({
        childProps: null,
        snackbarProps: nf2tSnackBarProps,
        canEditColumn: false,
        columns: columns,
        rows: coordinates,
    });

    return (
        <>
            <Nf2tHeader to={routeId} />
            <Nf2tTable {...tableProps} />

            <EditCoordinateDialog
                open={openEditCoordinatesDialog}
                handleClose={handleCloseDialogs}
                rowIndex={editCoordinateIndex}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
            />
            <AddCoordinatesFromTextDialog
                open={openAddCoordinatesFromTextDialog}
                handleClose={handleCloseDialogs}
                inputValue={inputValue}
                inputOptions={inputOptions}
                setInputValue={setInputValue}
                inputOption={inputOption}
                handleChangeInputOption={handleChangeInputOption}
                handleUploadInputButtonClick={handleUploadInputButtonClick}
                fileInputRef={fileInputRef}
                handleInputFileChange={handleInputFileChange}
                setCoordinates={setCoordinates}
                setUrls={setUrls}
                nf2tSnackBarProps={nf2tSnackBarProps}
                urls={urls}
                coordinates={coordinates}
            />

            <ButtonGroup>
                <Tooltip title="Delete all Maven Coordinates">
                    <IconButton onClick={() => setCoordinates([])}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add Maven Coordinate Row">
                    <IconButton onClick={() => {
                        const newCoordinates = [...coordinates, { groupId: "", artifactId: "", version: "" }];
                        handleClickOpenEditCoordinatesDialog(newCoordinates, newCoordinates.length - 1);
                    }}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add Maven Coordinate(s)">
                    <IconButton onClick={handleClickOpenAddCoordinatesFromTextDialog}>
                        <FileUploadIcon />
                    </IconButton>
                </Tooltip>
                {/* <Tooltip title="Swap visibility mode">
                    <IconButton onClick={() => setCoordinateTableMode(coordinateTableMode === "complex" ? "simple": "complex")}>
                        {coordinateTableMode === "complex" ? <VisibilityOnIcon />: <VisibilityOffIcon />}
                    </IconButton>
                </Tooltip> */}
            </ButtonGroup>

            <h3>Output</h3>

            <FormControl fullWidth>
                <InputLabel id="maven-coordinate-output-option-label">Output Option</InputLabel>
                <Select
                    labelId="maven-coordinate-output-option-label"
                    id="maven-coordinate-output-option-select"
                    value={outputOption}
                    label="Output Option"
                    onChange={handleChangeOutputOption}
                >
                    {Object.entries(outputOptions).map((x, key) => <MenuItem key={key} value={x[0]}>{x[0]}</MenuItem>)}
                </Select>
            </FormControl>

            <h4>Output as Download</h4>
            <Tooltip title="Download Output">
                <IconButton onClick={() => {
                    downloadFile(output.file);
                }}>
                    <FileDownloadIcon />
                </IconButton>
            </Tooltip>
            <h4>Output as Text</h4>

            <code onClick={() => {
                const clipboardItem = new ClipboardItem({
                    [output.file.type]: output.file,
                });
                navigator.clipboard.write([clipboardItem]);
                nf2tSnackBarProps.submitSnackbarMessage("Copied to clipboard.", "info");
            }} style={{ cursor: "pointer" }}>{output.node}</code>


        </>
    )
}