import { openDB, IDBPDatabase } from 'idb';
import { DataCache, CacheStorage } from './Cache';

class IDBStorage {

    static create(name?: string, storeNames?: string[]):CacheStorage[] {

        const options = {
            /** Database name */
            name: name || 'cache',
            /** Store name */
            storeNames: ['persist'],
            /** Database version */
            version: 1,
        }

        const dbPromise = openDB<any>(options.name, options.version, {
            upgrade(dbPromise) {
                storeNames.forEach(storeName => {
                    dbPromise.createObjectStore(storeName);
                });
               
            }
        })

        const listItems = storeNames.map((value) => (
            createIdbStorage(dbPromise, options.name, value)
            ));

        return listItems;
    }

}

function createIdbStorage(dbPromise: Promise<IDBPDatabase<any>>, name: string, storeName: string){
    return {
        getCacheName: ():string => "IDB-" + name + "-" + storeName,
        purge: () => {
            dbPromise.then(db => db.clear(storeName));
        },
        restore: (deserialize: boolean): Promise<DataCache> => {
            return dbPromise.then(db =>
                db.getAllKeys(storeName).then(async keys => {
                    const result: DataCache = new Map();
                    for (var i = 0; i < keys.length; i++) {
                        const value = await db.get(storeName, keys[i]);
                        result[""+keys[i]] = deserialize ? JSON.parse(value) : value;
                    }
                    return result;
                })
            );
        },
        setItem: (key: string, item: object): Promise<void> => {
            return dbPromise.then(db =>
                db.put(storeName, item, key))
        },
        removeItem: (key: string): Promise<void> => {
            return dbPromise.then(db =>
                db.delete(storeName, key) )
        },
    }
}

export default IDBStorage;