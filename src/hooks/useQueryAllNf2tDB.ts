import { useQuery } from '@tanstack/react-query';
import { ATTRIBUTE_STORE, DB_NAME, EXTENSION_STORE, NAR_STORE, openNf2tNarDB } from './openNf2tNarDB';
import { NarAttributes, NarAttributesSchema, NarExtensions, NarExtensionsSchema, Nars, NarsSchema } from '../utils/readNars';

export type UseQueryAllNf2tDBData = {
    nars: Nars,
    attributes: NarAttributes,
    extensions: NarExtensions,
}

export default function useQueryAllNf2tDB() {
    return useQuery({
        queryKey: [DB_NAME, NAR_STORE],
        queryFn: async () => {
            const db = await openNf2tNarDB();
            const rawNars = await db.getAll(NAR_STORE);
            console.log(`Got back ${rawNars.length} nar(s)`)
            const nars = await NarsSchema.parseAsync(rawNars);

            const rawExtensions = await db.getAll(EXTENSION_STORE);
            console.log(`Got back ${rawExtensions.length} extension(s)`)
            const extensions = await NarExtensionsSchema.parseAsync(rawExtensions);

            const rawAttributes = await db.getAll(ATTRIBUTE_STORE);
            console.log(`Got back ${rawAttributes.length} attributes(s)`);
            const attributes = await NarAttributesSchema.parseAsync(rawAttributes);

            return {
                nars,
                attributes,
                extensions,
            }
        },
    });
}

export type UseQueryAllNf2tDBResult = ReturnType<typeof useQueryAllNf2tDB>;