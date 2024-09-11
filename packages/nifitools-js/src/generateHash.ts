import { subtle } from "crypto";

/**
 * @see https://stackoverflow.com/a/65116591
 * 
 * @param file 
 * @param algorithm 
 * @returns 
 */
export default async function generateHash(file: File, algorithm: AlgorithmIdentifier): Promise<string> {
    const hashBuffer = subtle.digest(algorithm, await file.arrayBuffer());
    const hashArray = Array.from(new Uint8Array(await hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}