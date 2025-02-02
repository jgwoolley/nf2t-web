import { DefaultError, UseQueryResult, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { IDBPDatabase, openDB } from 'idb';

export const MavenCoordinateSchema = z.object({
    endpoint: z.string().min(1),
    groupId: z.string().min(1),
    artifactId: z.string().min(1),
    version: z.string().min(1),
    packaging: z.string().min(1),
});
export type MavenCoordinate = z.infer<typeof MavenCoordinateSchema>;

export const MavenCoordinatesSchema = z.array(MavenCoordinateSchema);

export type MavenCoordinates = z.infer<typeof MavenCoordinatesSchema>;

export type UseQueryAllMavenCoordinatesResult = {
    coordinates: MavenCoordinates, 
    uniqueValues: Map<keyof MavenCoordinate, string[]>,
}

export type UseQueryAllMavenCoordinatesDBResult = UseQueryResult<UseQueryAllMavenCoordinatesResult, DefaultError>;

export const DB_NAME = "nf2t-maven";
export const DB_VERSION = 3;
export const MAVEN_COORDINATE_STORE = "mavenCoordinates"
export const MAVEN_COORDINATE_STORE_KEY = "coordinates"

async function createMavenCoordinateStore(db: IDBPDatabase<unknown>) {
    const attributeStore = db.createObjectStore(MAVEN_COORDINATE_STORE, {autoIncrement: true});

    for(const field of Object.keys(MavenCoordinateSchema.shape)) {
        attributeStore.createIndex(field, field);
    }


    attributeStore.transaction.oncomplete = () => {
        console.log(`Store ${MAVEN_COORDINATE_STORE} has been created`);
    };
}

export const DB_STORES = [MAVEN_COORDINATE_STORE];

export function openNf2tMavenCoordinateDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade: async (db, oldVersion, newVersion) => {
            if(newVersion !== oldVersion){
                const objectStoreNames = new Set(db.objectStoreNames);

                for(const objectStoreName of DB_STORES) {
                    if(objectStoreNames.has(objectStoreName)) {
                        db.deleteObjectStore(objectStoreName);
                    }
                }
            }

            await createMavenCoordinateStore(db);
        },
    })
}

export default function useQueryMavenCoordinates(): UseQueryAllMavenCoordinatesDBResult {
    return useQuery({
        queryKey: [DB_NAME, MAVEN_COORDINATE_STORE],
        queryFn: async () => {
            const db = await openNf2tMavenCoordinateDB();
            const rows = await db.getAll(MAVEN_COORDINATE_STORE);
            console.log(`Got back ${rows.length} coordinate(s)`)
            const coordinates = await MavenCoordinatesSchema.parseAsync(rows);

            const uniqueValuesSet = new Map<keyof MavenCoordinate, Set<string>>();
            const keys = ["endpoint", "groupId", "artifactId", "version", "packaging",] as const
            for(const field of keys) {
                uniqueValuesSet.set(field, new Set());
            }
        
            for(const row of rows) {
                for(const key of keys) {
                    uniqueValuesSet.get(key)?.add(row[key]);
                }
            }

            const uniqueValues = new Map<keyof MavenCoordinate, string[]>();
            for(const field of keys) {
                const values = uniqueValuesSet.get(field);
                if(values) {
                    uniqueValues.set(field, [...values]);
                }
            }

            return {coordinates, uniqueValues: uniqueValues};
        },
    });
}