
import { IDBPDatabase, openDB } from "idb";

export const DB_NAME = "nf2t-nar";
export const DB_VERSION = 1;
export const NAR_STORE = 'nars';
export const EXTENSION_STORE = 'extensions';
export const ATTRIBUTE_STORE = 'attributes';

export const NAR_STORE_KEY = 'name';
export const EXTENSION_STORE_KEY = 'name';
export const ATTRIBUTE_STORE_KEY = 'id';

export const DB_STORES = [NAR_STORE, EXTENSION_STORE, ATTRIBUTE_STORE];

async function createNarStore(db: IDBPDatabase<unknown>) {
    const narStore = db.createObjectStore(NAR_STORE, {
        keyPath: NAR_STORE_KEY, 
    });
    narStore.transaction.oncomplete = () => {
        console.log(`Store ${NAR_STORE} has been created`);
    };
}

async function createExtensionStore(db: IDBPDatabase<unknown>) {
    const extensionStore = db.createObjectStore(EXTENSION_STORE, {
        keyPath: EXTENSION_STORE_KEY, 
    });
    extensionStore.transaction.oncomplete = () => {
        console.log(`Store ${EXTENSION_STORE} has been created`);
    };
}

async function createAttributeStore(db: IDBPDatabase<unknown>) {
    const attributeStore = db.createObjectStore(ATTRIBUTE_STORE, {
        keyPath: ATTRIBUTE_STORE_KEY,
    });
    attributeStore.transaction.oncomplete = () => {
        console.log(`Store ${ATTRIBUTE_STORE} has been created`);
    };
}

export function openNf2tNarDB() {
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

            await createNarStore(db);
            await createExtensionStore(db);
            await createAttributeStore(db);
        },
    })
}