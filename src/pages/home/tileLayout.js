// Home sahifasidagi tugmalar uchun grid layout matematikasi.
// Layout - [{ id, x, y, w, h }] ko'rinishida, o'lchov birligi - grid katakchasi.

export const GRID_COLS = 6;
export const GRID_GAP = 10;
export const MIN_W = 1;
export const MIN_H = 2;
export const MAX_H = 12;
export const LAYOUT_STORAGE_KEY = "home_tiles_layout_v1";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const collides = (a, b) =>
    !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);

const byPosition = (a, b) => (a.y - b.y) || (a.x - b.x);

export const normalizeItem = (item, cols = GRID_COLS) => {
    const w = clamp(Math.round(item.w) || 1, MIN_W, cols);
    const h = clamp(Math.round(item.h) || MIN_H, MIN_H, MAX_H);

    return {
        id: item.id,
        w,
        h,
        x: clamp(Math.round(item.x) || 0, 0, cols - w),
        y: Math.max(0, Math.round(item.y) || 0),
    };
};

// Ustma-ust tushgan elementlarni pastga surib bo'shatadi (birinchi element ustunlikka ega).
export const resolveOverlaps = (items) => {
    const placed = [];

    [...items].sort(byPosition).forEach((source) => {
        const item = { ...source };
        while (placed.some((other) => collides(other, item))) item.y += 1;
        placed.push(item);
    });

    return placed;
};

// Aktiv element aynan qo'yilgan joyda qoladi, xalaqit berganlari pastga suriladi.
export const placeTile = (baseLayout, id, rect, cols = GRID_COLS) => {
    const moving = normalizeItem({ ...rect, id }, cols);
    const placed = [moving];

    baseLayout
        .filter((item) => item.id !== id)
        .sort(byPosition)
        .forEach((source) => {
            const item = { ...source };
            while (placed.some((other) => collides(other, item))) item.y += 1;
            placed.push(item);
        });

    return placed;
};

// Bo'sh qatorlarni yo'qotib, hammasini yuqoriga tortadi.
export const compactLayout = (items) => {
    const placed = [];

    [...items].sort(byPosition).forEach((source) => {
        const item = { ...source };
        while (item.y > 0 && !placed.some((other) => collides(other, { ...item, y: item.y - 1 }))) {
            item.y -= 1;
        }
        placed.push(item);
    });

    return placed;
};

export const layoutRows = (items) =>
    items.reduce((max, item) => Math.max(max, item.y + item.h), 0);

export const buildDefaultLayout = (ids, { cols = GRID_COLS, defaultW = 3, defaultH = 3 } = {}) => {
    const perRow = Math.max(1, Math.floor(cols / defaultW));

    return ids.map((id, index) => ({
        id,
        x: (index % perRow) * defaultW,
        y: Math.floor(index / perRow) * defaultH,
        w: defaultW,
        h: defaultH,
    }));
};

// Saqlangan layoutni hozir ko'rinadigan tugmalar ro'yxatiga moslaydi:
// yo'q bo'lganlari olib tashlanadi, yangilari pastga qo'shiladi.
export const reconcileLayout = (saved, ids, options = {}) => {
    const { cols = GRID_COLS, defaultW = 3, defaultH = 3 } = options;
    const savedMap = new Map((saved || []).map((item) => [item.id, item]));
    const known = ids
        .filter((id) => savedMap.has(id))
        .map((id) => normalizeItem({ ...savedMap.get(id), id }, cols));

    const missing = ids.filter((id) => !savedMap.has(id));
    if (!known.length) return resolveOverlaps(buildDefaultLayout(ids, { cols, defaultW, defaultH }));

    let x = 0;
    let y = layoutRows(known);

    missing.forEach((id) => {
        if (x + defaultW > cols) {
            x = 0;
            y += defaultH;
        }
        known.push({ id, x, y, w: defaultW, h: defaultH });
        x += defaultW;
    });

    return resolveOverlaps(known);
};

export const loadStoredLayout = (storageKey = LAYOUT_STORAGE_KEY) => {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;

        return parsed
            .filter((item) => item && typeof item.id === "string")
            .map((item) => normalizeItem(item));
    } catch {
        return null;
    }
};

export const saveStoredLayout = (layout, storageKey = LAYOUT_STORAGE_KEY) => {
    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify(layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })))
        );
    } catch {
        /* localStorage to'lgan bo'lsa ham UI ishlashda davom etadi */
    }
};

export const clearStoredLayout = (storageKey = LAYOUT_STORAGE_KEY) => {
    try {
        localStorage.removeItem(storageKey);
    } catch {
        /* e'tiborsiz */
    }
};

export const layoutsEqual = (a, b) => {
    if (a.length !== b.length) return false;

    const mapB = new Map(b.map((item) => [item.id, item]));
    return a.every((item) => {
        const other = mapB.get(item.id);
        return other && other.x === item.x && other.y === item.y && other.w === item.w && other.h === item.h;
    });
};
