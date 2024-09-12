import { arrayBuffer } from "stream/consumers";
import packageFlowFiles from "./packageFlowFiles";
import { FlowFile } from "./schemas";
import unpackageFlowFiles from "./unpackageFlowFiles";
import { updateNf2tAttributes } from "./updateNf2tAttributes";

const originalFlowFiles: FlowFile[] = [];

for(let index = 0; index < 2; index++) {
    originalFlowFiles.push({
        attributes: [["test", `test${index}`]], 
        content: new File(["test3"], "test3", {
            type: "text/plain"
        })
    });
}

for(let index = 2; index < 5; index++) {
    originalFlowFiles.push({
        attributes: [["test", `test${index}`]], 
        content: new Blob(["test"]),
    });
}

updateNf2tAttributes(originalFlowFiles);

const packagedFile = packageFlowFiles(originalFlowFiles);

console.log({
    type: "packagedFile",
    packagedFile: packagedFile,
});

packagedFile.arrayBuffer().then(async (arrayBuffer) => {
    const unpackagedFlowFiles = unpackageFlowFiles(arrayBuffer);
    for(const actualFlowFile of unpackagedFlowFiles) {
        const text = Buffer.from(await actualFlowFile.content.arrayBuffer()).toString("utf-8");
        console.log({
            type: "actualFlowFile",
            attributes: actualFlowFile.attributes,
            content: actualFlowFile.content,
            text: text,
        });
    }
})


