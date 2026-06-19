const SERVER_ADDRESS_KEY = "server_address";
const DEFAULT_SERVER_ADDRESS = "http://192.168.1.103";

const cleanAddress = (value) => String(value || "").trim().replace(/\/+$/, "");

export const normalizeServerAddress = (value) => {
    const cleaned = cleanAddress(value);
    if (!cleaned) return "";

    if (/^https?:\/\//i.test(cleaned)) {
        return cleaned;
    }a

    return `http://${cleaned}`;
};

export const getSavedServerAddress = () => {
    const saved = normalizeServerAddress(localStorage.getItem(SERVER_ADDRESS_KEY));
    return saved || DEFAULT_SERVER_ADDRESS;
};

export const saveServerAddress = (value) => {
    const normalized = normalizeServerAddress(value);
    if (!normalized) {
        throw new Error("IP manzil bo'sh bo'lmasin");
    }

    localStorage.setItem(SERVER_ADDRESS_KEY, normalized);
    return normalized;
};

export const getServerAddressInputValue = () =>
    getSavedServerAddress().replace(/^https?:\/\//i, "");

export const getApiBaseUrl = () => {
    if (import.meta.env.PROD) {
        return getSavedServerAddress();
    }

    const savedRaw = cleanAddress(localStorage.getItem(SERVER_ADDRESS_KEY));
    return savedRaw ? normalizeServerAddress(savedRaw) : "/tovuq-api";
};
