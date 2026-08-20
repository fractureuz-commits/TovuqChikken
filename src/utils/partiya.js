// Partiya (invoys) qoldig'ini hisoblash.
//
// 1C dan kelgan qoldiq — faqat serverga yuborilgan savdolarni hisobga oladi.
// Yuborilmagan savdolar (offline queue) hali serverda yo'q, shuning uchun
// ularning miqdori mahalliy ravishda partiya qoldig'idan ayiriladi.
//
//      mavjud = server_qoldiq − yuborilmagan_savdolar − savatdagi_miqdor

import { listQueueItems, QUEUE_CHANGED_EVENT, QUEUE_TYPES } from "./offlineQueue";
import { toNumber } from "./queueSummary";
import { useEffect, useState } from "react";

// "19.08.2026", "20260819", "2026-08-19" → "20260819"
export const normalizeInvoysDate = (value) => {
    const text = String(value ?? "").trim().split(" ")[0];
    if (!text) return "";

    if (/^\d{8}$/.test(text)) return text;

    const dotted = text.split(".");
    if (dotted.length === 3) {
        const [day, month, year] = dotted;
        return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
    }

    const dashed = text.split("-");
    if (dashed.length === 3) {
        const [year, month, day] = dashed;
        return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
    }

    return text.replace(/\D/g, "");
};

// Bitta partiyani aniqlaydigan kalit: tovar + partiya sanasi + invoys raqami.
// Savatdagi element ham, 1C dan kelgan partiya ham bir xil kalitga tushadi.
export const partiyaKey = (item) => {
    const code = String(item?.tovar_code ?? item?.code ?? "").trim();
    const date = normalizeInvoysDate(item?.date_invoys);
    const number = String(item?.number_invoys ?? "").trim();

    return `${code}|${date}|${number}`;
};

// Savatdagi element identifikatori.
// Bitta tovarning bir necha partiyasi bo'lishi mumkin, shuning uchun
// invoys raqami ham identifikatorga kiradi.
export const makeCartItemId = (item, { kirim = false } = {}) => {
    const code = String(item?.tovar_code ?? item?.code ?? "");
    if (kirim) return code;

    const number = String(item?.number_invoys ?? "").trim();
    const base = `${item?.date_invoys ?? ""}_${code}`;

    return number ? `${base}_${number}` : base;
};

// Eski savatlar itemId ni "19.08.2026_123" ko'rinishida saqlagan —
// shuning uchun tenglikni maydonlar bo'yicha tekshiramiz.
export const isSamePartiya = (a, b) => partiyaKey(a) === partiyaKey(b);

export const findCartIndex = (tovarlar, item, { kirim = false } = {}) => {
    if (!Array.isArray(tovarlar)) return -1;

    if (kirim) {
        const code = String(item?.tovar_code ?? item?.code ?? "");
        return tovarlar.findIndex(row => String(row?.tovar_code ?? row?.code ?? "") === code);
    }

    const key = partiyaKey(item);
    return tovarlar.findIndex(row => partiyaKey(row) === key);
};

export const buildReservedMap = (orders = []) => {
    const map = new Map();

    orders.forEach((order) => {
        const data = order?.data || order || {};
        const tovarlar = Array.isArray(data?.tovarlar) ? data.tovarlar : [];

        tovarlar.forEach((row) => {
            const key = partiyaKey(row);
            if (!key || key === "||") return;

            map.set(key, (map.get(key) || 0) + toNumber(row?.soni));
        });
    });

    return map;
};

// Yuborilmagan savdolar bo'yicha band qilingan miqdorlar — modul darajasidagi kesh
let reservedMap = new Map();
let reservedLoaded = false;
let reservedPromise = null;

export const RESERVED_CHANGED_EVENT = "partiya-reserved-changed";

const emitReservedChanged = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(RESERVED_CHANGED_EVENT));
};

export const getReservedMap = () => reservedMap;
export const isReservedLoaded = () => reservedLoaded;

export const refreshReservedMap = async () => {
    if (reservedPromise) return reservedPromise;

    reservedPromise = (async () => {
        try {
            const orders = await listQueueItems(QUEUE_TYPES.SAVDOLAR);
            reservedMap = buildReservedMap(orders);
        } catch {
            // Queue o'qilmasa eski kesh bilan davom etamiz
        } finally {
            reservedLoaded = true;
            reservedPromise = null;
        }

        emitReservedChanged();
        return reservedMap;
    })();

    return reservedPromise;
};

if (typeof window !== "undefined") {
    window.addEventListener(QUEUE_CHANGED_EVENT, (event) => {
        if (event?.detail?.type && event.detail.type !== QUEUE_TYPES.SAVDOLAR) return;
        refreshReservedMap();
    });
}

export const getReservedQty = (item, map = reservedMap) => {
    const key = partiyaKey(item);
    if (!key || key === "||") return 0;

    return map?.get?.(key) || 0;
};

// Savatdagi shu partiyaga tegishli miqdor
export const getCartQty = (tovarlar, item, { excludeItemId } = {}) => {
    if (!Array.isArray(tovarlar)) return 0;

    const key = partiyaKey(item);

    return tovarlar.reduce((sum, row) => {
        if (partiyaKey(row) !== key) return sum;
        if (excludeItemId !== undefined && row?.itemId === excludeItemId) return sum;
        return sum + toNumber(row?.soni);
    }, 0);
};

// Partiyaning haqiqiy mavjud qoldig'i
export const getAvailableQoldiq = (item, {
    reserved = reservedMap,
    cartItems = null,
    excludeItemId,
} = {}) => {
    const serverQoldiq = toNumber(item?.qoldiq);
    const reservedQty = getReservedQty(item, reserved);
    const cartQty = cartItems ? getCartQty(cartItems, item, { excludeItemId }) : 0;

    const available = serverQoldiq - reservedQty - cartQty;
    return available > 0 ? available : 0;
};

// Reaktiv kesh — queue o'zgarsa komponentlar qayta hisoblaydi
export const useReservedPartiya = () => {
    const [map, setMap] = useState(reservedMap);
    const [loaded, setLoaded] = useState(reservedLoaded);

    useEffect(() => {
        let alive = true;

        const sync = () => {
            if (!alive) return;
            setMap(new Map(reservedMap));
            setLoaded(reservedLoaded);
        };

        window.addEventListener(RESERVED_CHANGED_EVENT, sync);
        refreshReservedMap().then(sync);

        return () => {
            alive = false;
            window.removeEventListener(RESERVED_CHANGED_EVENT, sync);
        };
    }, []);

    return { reserved: map, reservedLoaded: loaded, refreshReserved: refreshReservedMap };
};
