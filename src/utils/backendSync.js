import { apiFetch, apiPost } from "./api";
import {
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

const normalizeIds = (ids) =>
    ids.map(id => String(id ?? "").replace(/\s/g, "")).filter(Boolean);

const resolveEndpoint = (endpoint, batch) =>
    typeof endpoint === "function" ? endpoint(batch) : endpoint;

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const getCount = (value) => {
    if (Array.isArray(value)) return value.length;
    if (value == null) return 0;
    return 1;
};

const getErrorMessage = (err) => {
    if (!err) return "Noma'lum xato";
    const status = err.status ? `HTTP ${err.status}` : "";
    return [status, err.message].filter(Boolean).join(": ") || "Noma'lum xato";
};

const DOWNLOAD_ENDPOINTS = [
    { key: "products", endpoint: "products", label: "Mahsulot guruhlari" },
    { key: "kontragent", endpoint: "kontragent", label: "Mijozlar" },
    { key: "tovar", endpoint: "Tovar", label: "Tovarlar" },
    { key: "kurs", endpoint: "kurs", label: "Kurs" },
    { key: "xodim", endpoint: "Xodim", label: "Xodimlar" },
    { key: "region", endpoint: "Region", label: "Hududlar" },
    { key: "harajat", endpoint: "Harajat", label: "Harajatlar" },
];

const fetchEndpointFresh = async (config, options) => {
    const start = now();

    try {
        const data = await apiFetch(config.endpoint, options);
        return {
            ...config,
            ok: true,
            fresh: true,
            data,
            durationMs: Math.round(now() - start),
            count: getCount(data),
        };
    } catch (error) {
        return {
            ...config,
            ok: false,
            failed: true,
            data: null,
            error: getErrorMessage(error),
            durationMs: Math.round(now() - start),
            count: 0,
        };
    }
};

const logDownloadDiagnostics = (results) => {
    const rows = results.map(item => ({
        endpoint: item.endpoint,
        label: item.label,
        status: item.fresh ? "fresh" : "failed",
        count: item.count,
        durationMs: item.durationMs,
        error: item.error || "",
    }));

    console.table(rows);

    const backendIssues = results.filter(item => item.failed);
    if (backendIssues.length > 0) {
        console.warn("Backend sync muammolari:", backendIssues.map(item => ({
            endpoint: item.endpoint,
            label: item.label,
            error: item.error,
        })));
    }
};

const resultMap = (results) =>
    results.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
    }, {});

const requireArrayData = (item) => {
    if (Array.isArray(item.data)) return item.data;
    throw new Error(`${item.label} yuklanmadi. ${item.error || ""}`.trim());
};

export const downloadBackendData = async ({ onProgress } = {}) => {
    const totalStart = now();
    resetSyncCancel();
    progress(onProgress, { stage: "Ma'lumotlar backenddan olinmoqda..." });
    const downloadOptions = { timeoutMs: 0, retries: 2, retryDelayMs: 1000 };
    const endpointResults = [];

    for (let index = 0; index < DOWNLOAD_ENDPOINTS.length; index += 1) {
        const config = DOWNLOAD_ENDPOINTS[index];
        progress(onProgress, {
            stage: `${config.label} yuklanmoqda...`,
            current: index,
            total: DOWNLOAD_ENDPOINTS.length,
        });

        const result = await fetchEndpointFresh(config, downloadOptions);
        endpointResults.push(result);

        if (!result.ok) {
            logDownloadDiagnostics(endpointResults);
            throw new Error(`${result.label} yuklanmadi. ${result.error}`);
        }
    }

    const endpoints = resultMap(endpointResults);

    logDownloadDiagnostics(endpointResults);

    const productsSource = requireArrayData(endpoints.products);

    if (productsSource.length === 0) {
        await clearAllData();
        progress(onProgress, { stage: "Backenddan bo'sh ma'lumot keldi", current: 0, total: 0 });
        return { cleared: true, products: [], tovars: [] };
    }

    const tovarSource = requireArrayData(endpoints.tovar);
    const kontragentSource = requireArrayData(endpoints.kontragent);
    const xodimSource = requireArrayData(endpoints.xodim);
    const regionSource = requireArrayData(endpoints.region);
    const harajatSource = requireArrayData(endpoints.harajat);

    progress(onProgress, { stage: "Eski ma'lumotlar o'chirilmoqda..." });
    const saveStart = now();
    await clearAllData();

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
    saveKurs(endpoints.kurs.data);

    const saveDurationMs = Math.round(now() - saveStart);
    const totalDurationMs = Math.round(now() - totalStart);
    console.info("Frontend sync vaqtlari:", {
        saveDurationMs,
        totalDurationMs,
    });

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
        issues: [],
        saveDurationMs,
        totalDurationMs,
        timings: endpointResults.map(item => ({
            endpoint: item.endpoint,
            label: item.label,
            status: item.fresh ? "fresh" : "failed",
            count: item.count,
            durationMs: item.durationMs,
            error: item.error || "",
        })),
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
