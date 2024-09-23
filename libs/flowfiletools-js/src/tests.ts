import packageFlowFileStream from "./packageFlowFileStream";
import { FlowFileResult } from "./schemas";
import unpackageFlowFileStream from "./unpackageFlowFileStream";
import { updateNf2tAttributes } from "./updateNf2tAttributes";

const originalFlowFiles: FlowFileResult[] = [];

for(let index = 0; index < 2; index++) {
    originalFlowFiles.push({
        status: "success",
        parentId: "test",
        attributes: [["test", `test${index}`]], 
        content: new File(["test3"], "test3", {
            type: "text/plain",
        })
    });
}

for(let index = 2; index < 5; index++) {
    originalFlowFiles.push({
        status: "success",
        parentId: "test",
        attributes: [["test", `test${index}`]], 
        content: new Blob(["test"]),
    });
}

updateNf2tAttributes(originalFlowFiles);

const packagedFile = packageFlowFileStream(originalFlowFiles);

console.log({
    type: "packagedFile",
    packagedFile: packagedFile,
});

packagedFile.arrayBuffer().then(async (arrayBuffer) => {
    const unpackagedFlowFiles = unpackageFlowFileStream(arrayBuffer, "test");
    for(const actualFlowFile of unpackagedFlowFiles) {
        if(actualFlowFile.status !== "success") {
            throw new Error(`Returned status must be success: ${actualFlowFile.status}`)
        }
        const text = Buffer.from(await actualFlowFile.content.arrayBuffer()).toString("utf-8");
        console.log({
            type: "actualFlowFile",
            attributes: actualFlowFile.attributes,
            content: actualFlowFile.content,
            text: text,
        });
    }
})


