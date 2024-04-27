
import {z } from "zod";

export const CORE_ATTRIBUTES = [
    "filename",
    "mime.type",
    "uuid",
    "priority",
    "path",
    "absolute.path",
    "discard.reason",
    "alternate.identifier",
]

export const flowfileAttributes = z.record(z.string(), z.string());

export type FlowfileAttributesSchema = z.infer<typeof flowfileAttributes>;

export const flowfileAttributeRow = z.array(z.string()).refine(
    (val) => val.length === 2, {
        message: "Length must be exactly two",
    }
);

export type FlowfileAttributeRowSchema = [string, string];
