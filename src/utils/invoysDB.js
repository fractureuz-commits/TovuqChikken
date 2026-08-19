const DB_NAME = "tovuq_invoys_db";
const STORE_NAME = "invoys";
const DB_VERSION = 1;

let dbPromise = null;

const openDB = () => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error("IndexedDB mavjud emas"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
};

// Barcha saqlangan invoyslarni o'qish
export const getAllInvoys = async () => {
    try {
        const db = await openDB();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const request = tx.objectStore(STORE_NAME).getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Invoys IndexedDB o'qishda xato:", e.message);
        return [];
    }
};

// Backenddan kelgan ro'yxat bilan to'liq yangilash
export const replaceAllInvoys = async (list) => {
    try {
        const db = await openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.clear();
            (Array.isArray(list) ? list : []).forEach((item) => store.add(item));
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("Invoys IndexedDB saqlashda xato:", e.message);
    }
};

// Yangi yaratilgan invoysni qo'shish
export const addInvoys = async (item) => {
    try {
        const db = await openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).add(item);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("Invoys IndexedDB qo'shishda xato:", e.message);
    }
};
