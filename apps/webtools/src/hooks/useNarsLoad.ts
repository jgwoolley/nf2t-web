import { DefaultError, MutationFunction, QueryClient, UseMutationResult, useMutation } from '@tanstack/react-query';
import { ATTRIBUTE_STORE, DB_NAME, EXTENSION_STORE, NAR_STORE, openNf2tNarDB } from './openNf2tNarDB';
import { NarExportSchema } from '@nf2t/nifitools-js';

export type UseNarsLoadParameters = {
    queryClient: QueryClient,
    narsExport: unknown, 
}

const mutationFn: MutationFunction<void, UseNarsLoadParameters> = async (params: UseNarsLoadParameters) => {
    const db = await openNf2tNarDB();

    console.log(params.narsExport);
    const narsExport = NarExportSchema.parse(params.narsExport);

    for(const nar of narsExport.nars) {
        await db.put(NAR_STORE, nar);
    }
    for(const extension of narsExport.extensions) {
        await db.put(EXTENSION_STORE, extension);
    }
    for(const attribute of narsExport.attributes) {
        await db.put(ATTRIBUTE_STORE, attribute);
    }

    params.queryClient.invalidateQueries({
        queryKey: [DB_NAME],
    });
}

export type UseNarsLoadResult = UseMutationResult<void, Error, UseNarsLoadParameters, unknown>;

export default function useNarsLoad(): UseNarsLoadResult {
    return useMutation<void, DefaultError, UseNarsLoadParameters, unknown>({
        mutationKey: [DB_NAME],
        mutationFn: mutationFn,
    });
}