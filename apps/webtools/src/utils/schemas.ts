
import { z } from "zod";

export const flowfileAttributes = z.record(z.string(), z.string());

export type FlowfileAttributesSchema = z.infer<typeof flowfileAttributes>;

export const flowfileAttributeRow = z.array(z.string()).refine(
    (val) => val.length === 2, {
        message: "Length must be exactly two",
    }
);

export type UnpackagedFileStorageMethod = "Content Not Available";

export type UnpackagedFile = {
    parentId?: string,
    id: string,
    name: string,
    size: number,
    type: string,
    storageMethod: UnpackagedFileStorageMethod,
}