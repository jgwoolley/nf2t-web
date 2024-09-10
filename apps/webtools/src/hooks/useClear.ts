import { DefaultError, QueryClient, useMutation } from "@tanstack/react-query";
import { DB_NAME, DB_STORES, openNf2tNarDB } from "./openNf2tNarDB";

export type UseNarDeleteAllVariables = {
    queryClient: QueryClient,
}

export function useNarDeleteAll() {
    return useMutation<unknown, DefaultError, UseNarDeleteAllVariables>({
        mutationKey: [DB_NAME],
        mutationFn: async ({queryClient}) => {
            const db = await openNf2tNarDB();
            for(const store of DB_STORES) {
                db.clear(store);
                console.log(`Deleted ${store}`);
            }
            queryClient.invalidateQueries({queryKey: [DB_NAME]});
        },
    });
}

export type UseNarDeleteAll = ReturnType<typeof useNarDeleteAll>;