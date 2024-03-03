
// see: https://stackoverflow.com/a/65116591
export default async function generateHash(file: File, algorithm: AlgorithmIdentifier) {
    const hashBuffer = crypto.subtle.digest(algorithm, await file.arrayBuffer());
    const hashArray = Array.from(new Uint8Array(await hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}