import { apiFetch, apiPost } from "./api";
import {
    checkInternet,
    clearAllData,
    isSyncCancelled,
    resetSyncCancel,
    saveHarajat,
    saveKontragent,
    saveKurs,
    saveRegion,
    saveXodim,
    syncAndSave,
    syncAndSaveTovar,
} from "./storage";
import { listQueueItems, removeQueueItems } from "./offlineQueue";

export const SEND_BATCH_SIZE = 100;

const progress = (onProgress, patch) => {
    onProgress?.({
        stage: "",
        current: 0,
        total: 0,
        ...patch,
    });
};

const ensureArray = (value, label) => {
    if (Array.isArray(value)) return value;
    throw new Error(`${label} noto'g'ri formatda keldi`);
};

const normalizeIds = (ids) =>
    ids.map(id => String(id ?? "").replace(/\s/g, "")).filter(Boolean);

const resolveEndpoint = (endpoint, batch) =>
    typeof endpoint === "function" ? endpoint(batch) : endpoint;

export const downloadBackendData = async ({ onProgress } = {}) => {
    resetSyncCancel();
    progress(onProgress, { stage: "Server tekshirilmoqda..." });

    const online = await checkInternet();
    if (!online) {
        throw new Error("Serverga ulanib bo'lmadi. WiFi yoki IP manzilni tekshiring.");
    }

    progress(onProgress, { stage: "Ma'lumotlar backenddan olinmoqda..." });

    const [
        productsData,
        kontragentData,
        tovarData,
        kursData,
        xodimData,
        regionData,
        harajatData,
    ] = await Promise.all([
        apiFetch("products"),
        apiFetch("kontragent"),
        apiFetch("Tovar"),
        apiFetch("kurs"),
        apiFetch("Xodim"),
        apiFetch("Region"),
        apiFetch("Harajat"),
    ]);

    const productsSource = ensureArray(productsData, "Mahsulot guruhlari");

    if (productsSource.length === 0) {
        await clearAllData();
        progress(onProgress, { stage: "Backenddan bo'sh ma'lumot keldi", current: 0, total: 0 });
        return { cleared: true, products: [], tovars: [] };
    }

    const tovarSource = ensureArray(tovarData, "Tovarlar");
    const kontragentSource = ensureArray(kontragentData, "Mijozlar");
    const xodimSource = ensureArray(xodimData, "Xodimlar");
    const regionSource = ensureArray(regionData, "Hududlar");
    const harajatSource = ensureArray(harajatData, "Harajatlar");

    progress(onProgress, {
        stage: "Mahsulot guruhlari saqlanmoqda...",
        current: 0,
        total: productsSource.length,
    });

    const products = await syncAndSave(productsSource, (current, total) => {
        progress(onProgress, {
            stage: "Mahsulot guruhlari saqlanmoqda...",
            current,
            total,
        });
    });

    if (isSyncCancelled()) {
        throw new Error("Yuklash to'xtatildi");
    }

    progress(onProgress, {
        stage: "Tovarlar saqlanmoqda...",
        current: 0,
        total: tovarSource.length,
    });

    const tovars = await syncAndSaveTovar(tovarSource, (current, total) => {
        progress(onProgress, {
            stage: "Tovarlar saqlanmoqda...",
            current,
            total,
        });
    });

    if (isSyncCancelled()) {
        throw new Error("Yuklash to'xtatildi");
    }

    progress(onProgress, { stage: "Qo'shimcha ma'lumotlar saqlanmoqda..." });

    await Promise.all([
        saveKontragent(kontragentSource),
        saveXodim(xodimSource),
        saveRegion(regionSource),
        saveHarajat(harajatSource),
    ]);
    saveKurs(kursData);

    progress(onProgress, {
        stage: "Yuklash yakunlandi",
        current: products.length + tovars.length,
        total: productsSource.length + tovarSource.length,
    });

    return {
        cleared: false,
        products,
        tovars,
        counts: {
            products: products.length,
            tovars: tovars.length,
            kontragent: kontragentSource.length,
            xodim: xodimSource.length,
            region: regionSource.length,
            harajat: harajatSource.length,
        },
    };
};

export const uploadQueueBatches = async ({
    type,
    endpoint,
    makePayload,
    getConfirmedIds,
    onProgress,
    batchSize = SEND_BATCH_SIZE,
    removeWithoutIds = false,
}) => {
    let syncedCount = 0;
    let batchNumber = 0;

    while (true) {
        const batch = await listQueueItems(type, { limit: batchSize });
        if (batch.length === 0) break;

        batchNumber += 1;
        progress(onProgress, {
            stage: `${batchNumber}-batch yuborilmoqda...`,
            current: syncedCount,
            total: syncedCount + batch.length,
        });

        const res = await apiPost(resolveEndpoint(endpoint, batch), makePayload(batch), { timeoutMs: 120000 });
        const confirmedIds = normalizeIds(getConfirmedIds?.(res, batch) || []);
        const fallbackIds = removeWithoutIds ? normalizeIds(batch.map(item => item.id)) : [];
        const idsToRemove = confirmedIds.length > 0 ? confirmedIds : fallbackIds;

        if (idsToRemove.length === 0) {
            throw new Error("Server tasdiqlangan ID qaytarmadi. Queue xavfsizligi uchun ma'lumotlar o'chirilmadi.");
        }

        await removeQueueItems(type, idsToRemove);
        syncedCount += idsToRemove.length;

        progress(onProgress, {
            stage: `${syncedCount} ta yuborildi`,
            current: syncedCount,
            total: syncedCount + Math.max(batch.length - idsToRemove.length, 0),
        });

        if (batch.length < batchSize) break;
    }

    return syncedCount;
};
