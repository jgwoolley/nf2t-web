import jsuntar from "js-untar";
import pako from "pako";

function getFilename(fullPath: string) {
    return fullPath.split("/").pop() || fullPath;
}

export async function untar(file: File, chunk?: File[]) {
    chunk = chunk || [];
    
    await file.arrayBuffer().then(pako.inflate).then( arr => arr.buffer).then(jsuntar).then(files => {
        files.forEach(file => {
            if(file.size <= 0) {
                return;
            }
            chunk.push(new File([file.blob], getFilename(file.name)));
        })
    });

    return chunk;
}

export default untar;