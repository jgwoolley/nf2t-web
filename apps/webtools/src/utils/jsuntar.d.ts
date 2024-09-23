declare module 'js-untar' {
    type UntarResult = {
        buffer: ArrayBuffer,
        blob: Blob,
        name: string,
        size: number,
        getBlobUrl: function(): string,
        readAsString: function(): string,
        readAsJson: function(): unknown,
    }

    function untar(arrayBuffer: ArrayBuffer): Promise<UntarResult[]>;

    export = untar;
}