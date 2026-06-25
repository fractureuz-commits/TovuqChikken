import { Filesystem, Directory } from "@capacitor/filesystem";

const QUEUE_DIR = "offline_queue";

export const QUEUE_TYPES = {
    TOLOVLAR: "tolovlar",
    HARAJATLAR: "harajatlar",
    SAVDOLAR: "savdolar",
};

export const QUEUE_CHANGED_EVENT = "offline-queue-changed";

const emitQueueChanged = (type) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(QUEUE_CHANGED_EVENT, {
        detail: { type },
    }));
};

const makeDir = async (path) => {
    await Filesystem.mkdir({
        path,
        directory: Directory.Data,
        recursive: true,
    }).catch(() => { });
};

const typeDir = (type) => `${QUEUE_DIR}/${type}`;

const fileNameForId = (id) => `${encodeURIComponent(String(id))}.json`;

const fileNameToId = (fileName) => {
    const name = String(fileName || "").replace(/\.json$/i, "");
    return decodeURIComponent(name);
};

const normalizedId = (id) => String(id ?? "").replace(/\s/g, "");

const entryName = (entry) => {
    if (typeof entry === "string") return entry;
    return entry?.name || "";
};

const listNames = async (type) => {
    try {
        const result = await Filesystem.readdir({
            path: typeDir(type),
            directory: Directory.Data,
        });

        return (result.files || [])
            .map(entryName)
            .filter(name => name.endsWith(".json"))
            .sort((a, b) => fileNameToId(a).localeCompare(fileNameToId(b), undefined, { numeric: true }));
    } catch {
        return [];
    }
};

const readItemByFileName = async (type, fileName) => {
    try {
        const result = await Filesystem.readFile({
            path: `${typeDir(type)}/${fileName}`,
            directory: Directory.Data,
            encoding: "utf8",
        });

        return JSON.parse(result.data);
    } catch {
        return null;
    }
};

const readLegacyItems = (type) => {
    try {
        const legacy = JSON.parse(localStorage.getItem(type) || "[]");
        return Array.isArray(legacy) ? legacy : [];
    } catch {
        return [];
    }
};

const writeLegacyItems = (type, items) => {
    try {
        localStorage.setItem(type, JSON.stringify(items));
    } catch {
        // LocalStorage may be unavailable in some shells.
    }
};

const itemId = (type, item, index = 0) => {
    return item?.id ??
        item?.ID ??
        item?.Id ??
        item?.created_at ??
        `${type}_${index}_${item?.date || ""}_${item?.mijoz_code || item?.operatsiya_code || ""}`;
};

const normalizeItems = (type, items) => {
    let changed = false;
    const normalized = items.map((item, index) => {
        if (item?.id !== undefined && item?.id !== null && item?.id !== "") return item;

        changed = true;
        return { ...item, id: itemId(type, item, index) };
    });

    return { items: normalized, changed };
};

const upsertLegacyItem = (type, item) => {
    const legacy = readLegacyItems(type);
    const id = normalizedId(item?.id);
    const index = legacy.findIndex(row => normalizedId(row?.id) === id);

    if (index >= 0) {
        legacy[index] = item;
    } else {
        legacy.push(item);
    }

    writeLegacyItems(type, legacy);
};

const removeLegacyItems = (type, ids) => {
    const removeIds = new Set(ids.map(normalizedId));
    const legacy = readLegacyItems(type);
    const next = legacy.filter(item => !removeIds.has(normalizedId(item?.id)));

    if (next.length !== legacy.length) writeLegacyItems(type, next);
};

const mergeRows = (type, ...rowGroups) => {
    const merged = new Map();

    rowGroups.flat().filter(Boolean).forEach((item, index) => {
        const id = itemId(type, item, index);
        merged.set(normalizedId(id), { ...item, id });
    });

    return [...merged.values()].sort((a, b) =>
        String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
    );
};

export const migrateLegacyQueue = async (type) => {
    const { items: legacy, changed } = normalizeItems(type, readLegacyItems(type));
    if (legacy.length === 0) return;

    await makeDir(typeDir(type));

    for (const item of legacy) {
        await writeQueueItem(type, item).catch(() => { });
    }

    if (changed) writeLegacyItems(type, legacy);
};

const writeQueueItem = async (type, item) => {
    const id = item?.id ?? Date.now();
    const payload = { ...item, id };

    await makeDir(typeDir(type));
    await Filesystem.writeFile({
        path: `${typeDir(type)}/${fileNameForId(id)}`,
        data: JSON.stringify(payload),
        directory: Directory.Data,
        encoding: "utf8",
    });

    return payload;
};

export const saveQueueItem = async (type, item) => {
    const id = item?.id ?? Date.now();
    let payload = { ...item, id };

    upsertLegacyItem(type, payload);

    try {
        payload = await writeQueueItem(type, payload);
        upsertLegacyItem(type, payload);
    } catch {
        // LocalStorage already has the item, so refresh still keeps the queue.
    }

    emitQueueChanged(type);
    return payload;
};

export const listQueueItems = async (type, options = {}) => {
    await migrateLegacyQueue(type);

    const { limit, offset = 0 } = options;
    const names = await listNames(type);
    const fileRows = await Promise.all(names.map(name => readItemByFileName(type, name)));
    const { items: legacyRows } = normalizeItems(type, readLegacyItems(type));
    const rows = mergeRows(type, legacyRows, fileRows);

    return typeof limit === "number"
        ? rows.slice(offset, offset + limit)
        : rows.slice(offset);
};

export const countQueueItems = async (type) => {
    const rows = await listQueueItems(type);
    return rows.length;
};

const deleteQueueItem = async (type, id) => {
    try {
        await Filesystem.deleteFile({
            path: `${typeDir(type)}/${fileNameForId(id)}`,
            directory: Directory.Data,
        });
    } catch {
            // Item may have already been deleted.
    }

    const target = normalizedId(id);
    const names = await listNames(type);
    await Promise.all(names
        .filter(name => normalizedId(fileNameToId(name)) === target)
        .map(name => Filesystem.deleteFile({
            path: `${typeDir(type)}/${name}`,
            directory: Directory.Data,
        }).catch(() => { }))
    );
};

export const removeQueueItem = async (type, id) => {
    await deleteQueueItem(type, id);
    removeLegacyItems(type, [id]);
    emitQueueChanged(type);
};

export const removeQueueItems = async (type, ids) => {
    const uniqueIds = [...new Set(ids.map(id => String(id)))];
    await Promise.all(uniqueIds.map(id => deleteQueueItem(type, id)));
    removeLegacyItems(type, uniqueIds);
    if (uniqueIds.length > 0) emitQueueChanged(type);
};
