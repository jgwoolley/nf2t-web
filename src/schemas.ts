
import {z, } from "zod";

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

export const flowfileAttributeRow = z.object({
    key: z.string().min(1),
    value: z.string().min(1),
})

export type FlowfileAttributeRowSchema = z.infer<typeof flowfileAttributeRow>;

export const flowfileAttributes = z.array(
    flowfileAttributeRow,
);

export type FlowfileAttributesSchema = z.infer<typeof flowfileAttributes>;