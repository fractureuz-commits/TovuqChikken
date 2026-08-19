const LAST_FULL_SYNC_KEY = "last_full_sync_at";
export const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 1 kun

export const getLastFullSyncAt = () => {
    const raw = localStorage.getItem(LAST_FULL_SYNC_KEY);
    const ts = raw ? Number(raw) : 0;
    return Number.isFinite(ts) && ts > 0 ? ts : 0;
};

export const markFullSyncDone = (timestamp = Date.now()) => {
    localStorage.setItem(LAST_FULL_SYNC_KEY, String(timestamp));
};

// Hech qachon sinxron qilinmagan bo'lsa ham majburiy sinxronizatsiya so'raladi
export const isSyncOverdue = () => {
    const last = getLastFullSyncAt();
    if (!last) return true;
    return Date.now() - last > SYNC_INTERVAL_MS;
};
