import { z } from "zod";

export const searchParamsSchema = z.object({
    id: z.string(),
})

export const LookupAttributeSearchParamsSchema = z.object({
    name: z.string().optional(),
})

export const LookupExtensionSearchParamsSchema = z.object({
    name: z.string().optional(),
});

export const LookupNarSearchParamsSchema = z.object({
    name: z.string().optional(),
});