import { apiFetch, apiPost } from "./api";
import {
    clearAllData,
    isSyncCancelled,
    loadHarajat,
    loadKontragent,
    loadKurs,
    loadProducts,
    loadRegion,
    loadTovar,
    loadXodim,
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

const isUsableCache = (value, allowObject = false) => {
    if (Array.isArray(value)) return value.length > 0;
    return allowObject ? Boolean(value) : false;
};

const getErrorMessage = (err) => {
    if (!err) return "Noma'lum xato";
    const status = err.status ? `HTTP ${err.status}` : "";
    return [status, err.message].filter(Boolean).join(": ") || "Noma'lum xato";
};

const DOWNLOAD_ENDPOINTS = [
    { key: "products", endpoint: "products", label: "Mahsulot guruhlari", loadCache: loadProducts },
    { key: "kontragent", endpoint: "kontragent", label: "Mijozlar", loadCache: loadKontragent },
    { key: "tovar", endpoint: "Tovar", label: "Tovarlar", loadCache: loadTovar },
    { key: "kurs", endpoint: "kurs", label: "Kurs", loadCache: loadKurs, allowObjectCache: true },
    { key: "xodim", endpoint: "Xodim", label: "Xodimlar", loadCache: loadXodim },
    { key: "region", endpoint: "Region", label: "Hududlar", loadCache: loadRegion },
    { key: "harajat", endpoint: "Harajat", label: "Harajatlar", loadCache: loadHarajat },
];

const fetchEndpointWithCache = async (config, firstOptions, retryOptions) => {
    const start = now();

    try {
        const data = await apiFetch(config.endpoint, firstOptions);
        return {
            ...config,
            ok: true,
            fresh: true,
            data,
            durationMs: Math.round(now() - start),
            count: getCount(data),
        };
    } catch (firstError) {
        const cached = await config.loadCache?.();

        if (isUsableCache(cached, config.allowObjectCache)) {
            return {
                ...config,
                ok: false,
                stale: true,
                data: cached,
                error: getErrorMessage(firstError),
                durationMs: Math.round(now() - start),
                count: getCount(cached),
            };
        }

        try {
            const retryStart = now();
            const data = await apiFetch(config.endpoint, retryOptions);
            return {
                ...config,
                ok: true,
                fresh: true,
                retried: true,
                data,
                durationMs: Math.round(now() - start),
                retryDurationMs: Math.round(now() - retryStart),
                count: getCount(data),
            };
        } catch (retryError) {
            return {
                ...config,
                ok: false,
                failed: true,
                data: cached,
                error: getErrorMessage(retryError),
                firstError: getErrorMessage(firstError),
                durationMs: Math.round(now() - start),
                count: getCount(cached),
            };
        }
    }
};

const logDownloadDiagnostics = (results) => {
    const rows = results.map(item => ({
        endpoint: item.endpoint,
        label: item.label,
        status: item.fresh ? "fresh" : item.stale ? "cache" : "failed",
        count: item.count,
        durationMs: item.durationMs,
        error: item.error || "",
    }));

    console.table(rows);

    const backendIssues = results.filter(item => item.stale || item.failed);
    if (backendIssues.length > 0) {
        console.warn("Backend sync muammolari:", backendIssues.map(item => ({
            endpoint: item.endpoint,
            label: item.label,
            error: item.error,
            usedCache: Boolean(item.stale),
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
    throw new Error(`${item.label} yuklanmadi va cache topilmadi. ${item.error || ""}`.trim());
};

export const downloadBackendData = async ({ onProgress } = {}) => {
    resetSyncCancel();
    progress(onProgress, { stage: "Ma'lumotlar backenddan olinmoqda..." });
    const firstOptions = { timeoutMs: 0, retries: 0 };
    const retryOptions = { timeoutMs: 0, retries: 2, retryDelayMs: 1000 };

    const settled = await Promise.allSettled(
        DOWNLOAD_ENDPOINTS.map(config => fetchEndpointWithCache(config, firstOptions, retryOptions))
    );
    const endpointResults = settled.map((item, index) => (
        item.status === "fulfilled"
            ? item.value
            : {
                ...DOWNLOAD_ENDPOINTS[index],
                ok: false,
                failed: true,
                error: getErrorMessage(item.reason),
                durationMs: 0,
                count: 0,
            }
    ));
    const endpoints = resultMap(endpointResults);

    logDownloadDiagnostics(endpointResults);

    const productsSource = requireArrayData(endpoints.products);

    if (endpoints.products.fresh && productsSource.length === 0) {
        await clearAllData();
        progress(onProgress, { stage: "Backenddan bo'sh ma'lumot keldi", current: 0, total: 0 });
        return { cleared: true, products: [], tovars: [] };
    }

    const tovarSource = requireArrayData(endpoints.tovar);
    const kontragentSource = requireArrayData(endpoints.kontragent);
    const xodimSource = requireArrayData(endpoints.xodim);
    const regionSource = requireArrayData(endpoints.region);
    const harajatSource = requireArrayData(endpoints.harajat);

    let products = productsSource;
    if (endpoints.products.fresh) {
        progress(onProgress, {
            stage: "Mahsulot guruhlari saqlanmoqda...",
            current: 0,
            total: productsSource.length,
        });

        products = await syncAndSave(productsSource, (current, total) => {
            progress(onProgress, {
                stage: "Mahsulot guruhlari saqlanmoqda...",
                current,
                total,
            });
        });
    }

    if (isSyncCancelled()) {
        throw new Error("Yuklash to'xtatildi");
    }

    let tovars = tovarSource;
    if (endpoints.tovar.fresh) {
        progress(onProgress, {
            stage: "Tovarlar saqlanmoqda...",
            current: 0,
            total: tovarSource.length,
        });

        tovars = await syncAndSaveTovar(tovarSource, (current, total) => {
            progress(onProgress, {
                stage: "Tovarlar saqlanmoqda...",
                current,
                total,
            });
        });
    }

    if (isSyncCancelled()) {
        throw new Error("Yuklash to'xtatildi");
    }

    progress(onProgress, { stage: "Qo'shimcha ma'lumotlar saqlanmoqda..." });

    await Promise.all([
        endpoints.kontragent.fresh ? saveKontragent(kontragentSource) : null,
        endpoints.xodim.fresh ? saveXodim(xodimSource) : null,
        endpoints.region.fresh ? saveRegion(regionSource) : null,
        endpoints.harajat.fresh ? saveHarajat(harajatSource) : null,
    ].filter(Boolean));

    if (endpoints.kurs.fresh) saveKurs(endpoints.kurs.data);

    const issues = endpointResults
        .filter(item => item.stale || item.failed)
        .map(item => ({
            endpoint: item.endpoint,
            label: item.label,
            error: item.error,
            usedCache: Boolean(item.stale),
            durationMs: item.durationMs,
        }));

    progress(onProgress, {
        stage: issues.length ? "Qisman yangilandi" : "Yuklash yakunlandi",
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
        issues,
        timings: endpointResults.map(item => ({
            endpoint: item.endpoint,
            label: item.label,
            status: item.fresh ? "fresh" : item.stale ? "cache" : "failed",
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
