import { DefaultError, MutationFunction, QueryClient, useMutation } from '@tanstack/react-query';
import { ATTRIBUTE_STORE, DB_NAME, EXTENSION_STORE, NAR_STORE, openNf2tNarDB } from './openNf2tNarDB';
import readNars, { IncomingFiles } from '../utils/readNars';

export type UseNarsReadParameters = {
    queryClient: QueryClient,
    files: IncomingFiles, 
    setCurrentProgress: (current: number, total: number) => void,
}

const mutationFn: MutationFunction<unknown, UseNarsReadParameters> = async (params: UseNarsReadParameters) => {
    const db = await openNf2tNarDB();
    const parser = new DOMParser();
    
    await readNars({
        ...params,
        parseNar: async (nar) => {
            await db.put(NAR_STORE, nar);
        },
        parseExtension: async (extension) => {
            await db.put(EXTENSION_STORE, extension);
        }, 
        parseAttribute: async (attribute) => {
            await db.put(ATTRIBUTE_STORE, attribute);
        },
        DOMParser: parser,
    });

    params.queryClient.invalidateQueries({
        queryKey: [DB_NAME],
    });
}

export default function useNarsRead() {
    return useMutation<unknown, DefaultError, UseNarsReadParameters, unknown>({
        mutationKey: [DB_NAME],
        mutationFn: mutationFn,
    });
}

export type UseNarsParseResult = ReturnType<typeof useNarsRead>;