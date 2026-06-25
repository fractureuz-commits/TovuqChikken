const normalizeId = (id) => String(id ?? "").replace(/\s/g, "");
const SAVDO_ITEM_ID_SEQUENCE_KEY = "savdo_item_id_sequence";

const nextLocalSequence = () => {
    try {
        const current = Number(localStorage.getItem(SAVDO_ITEM_ID_SEQUENCE_KEY) || "0");
        const next = current + 1;
        localStorage.setItem(SAVDO_ITEM_ID_SEQUENCE_KEY, String(next));
        return next;
    } catch {
        return Math.floor(Math.random() * 1_000_000);
    }
};

export const makeSavdoItemId = () => {
    const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

    if (typeof cryptoApi?.randomUUID === "function") {
        return cryptoApi.randomUUID();
    }

    const randomPart = () => Math.random().toString(36).slice(2, 10);
    return `savdo_${Date.now()}_${nextLocalSequence()}_${randomPart()}_${randomPart()}`;
};

export const withSavdoItemId = (order) => {
    const itemId = order?.data?.itemId || order?.itemId || order?.id || makeSavdoItemId();

    if (order?.data) {
        return {
            ...order,
            id: order.id ?? itemId,
            itemId,
            data: {
                ...order.data,
                itemId,
            },
        };
    }

    return {
        ...order,
        id: order?.id ?? itemId,
        itemId,
    };
};

export const getSavdoPayload = (order) => {
    const normalized = withSavdoItemId(order);
    return normalized?.data || normalized;
};

export const getSavdoConfirmIds = (order) => {
    const normalized = withSavdoItemId(order);
    const ids = [
        normalized?.data?.itemId,
        normalized?.itemId,
    ].map(normalizeId).filter(Boolean);

    return [...new Set(ids)];
};

export const normalizeSavdoId = normalizeId;
