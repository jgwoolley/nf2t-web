import packageFlowFileStream from "./packageFlowFileStream";
import { FlowFileResults } from "./schemas";
import unpackageFlowFileStream from "./unpackageFlowFileStream";
import { updateNf2tAttributes } from "./updateNf2tAttributes";

const originalFlowFiles: FlowFileResults = {
    errors: [],
    success: [],
};

for(let index = 0; index < 2; index++) {
    originalFlowFiles.success.push({
        parentId: "test",
        attributes: [["test", `test${index}`]], 
        content: new File(["test3"], "test3", {
            type: "text/plain",
        })
    });
}

for(let index = 2; index < 5; index++) {
    originalFlowFiles.success.push({
        parentId: "test",
        attributes: [["test", `test${index}`]], 
        content: new Blob(["test"]),
    });
}

updateNf2tAttributes(originalFlowFiles.success);

const packagedFile = packageFlowFileStream(originalFlowFiles.success);

console.log({
    type: "packagedFile",
    packagedFile: packagedFile,
});

packagedFile.arrayBuffer().then(async (arrayBuffer) => {
    const unpackagedFlowFiles = unpackageFlowFileStream(arrayBuffer, "test");
    for(const actualFlowFile of unpackagedFlowFiles.success) {
        const text = Buffer.from(await actualFlowFile.content.arrayBuffer()).toString("utf-8");
        console.log({
            type: "actualFlowFile",
            attributes: actualFlowFile.attributes,
            content: actualFlowFile.content,
            text: text,
        });
    }
})


