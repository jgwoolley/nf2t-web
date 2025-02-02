import { z } from "zod";

export const downloadMavenSearchParamsSchema = z.object({
    endpoint: z.string().default(""),
    groupId: z.string().default(""),
    artifactId: z.string().default(""),
    version: z.string().default(""),
    packaging: z.string().default(""),
})

export type DownloadMavenSearchParams = z.infer<typeof downloadMavenSearchParamsSchema>;