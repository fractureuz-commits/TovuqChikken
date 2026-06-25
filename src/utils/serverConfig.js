export const SERVER_ADDRESS_KEY = "server_address";
export const SERVER_ADDRESS_CHANGED_EVENT = "server-address-changed";
export const DEFAULT_SERVER_ADDRESS = "http://93.170.220.162:80";
export const DEV_RUNTIME_PROXY_PREFIX = "/runtime-api";
export const NETLIFY_DEFAULT_PROXY_PREFIX = "/tovuq-api";
const LEGACY_SERVER_ADDRESS_KEYS = ["backend_ip", "backend_url", "serverAddress", "baseUrl"];

const cleanAddress = (value) => String(value || "").trim().replace(/\/+$/, "");

const getStoredAddress = () => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return "";

        const current = window.localStorage.getItem(SERVER_ADDRESS_KEY);
        if (current) return current;

        for (const key of LEGACY_SERVER_ADDRESS_KEYS) {
            const legacy = window.localStorage.getItem(key);
            if (legacy) return legacy;
        }

        return "";
    } catch {
        return "";
    }
};

const setStoredAddress = (value) => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return false;
        window.localStorage.setItem(SERVER_ADDRESS_KEY, value);
        return true;
    } catch {
        return false;
    }
};

export const normalizeServerAddress = (value) => {
    let cleaned = cleanAddress(value);
    if (!cleaned) return "";

    if (!/^https?:\/\//i.test(cleaned)) {
        cleaned = `http://${cleaned}`;
    }

    try {
        const url = new URL(cleaned);
        if (url.protocol !== "http:" && url.protocol !== "https:") return "";
        if (!url.hostname) return "";

        url.hash = "";
        url.search = "";

        return url.toString().replace(/\/+$/, "");
    } catch {
        return "";
    }
};

export const getSavedServerAddress = () => {
    const saved = normalizeServerAddress(getStoredAddress());
    return saved || DEFAULT_SERVER_ADDRESS;
};

export const getLocalServerAddress = () =>
    normalizeServerAddress(getStoredAddress());

export const saveServerAddress = (value) => {
    const normalized = normalizeServerAddress(value);
    if (!normalized) {
        throw new Error("IP manzil bo'sh bo'lmasin");
    }

    if (!setStoredAddress(normalized)) {
        throw new Error("IP localStoragega saqlanmadi");
    }

    const saved = getLocalServerAddress();
    if (saved !== normalized) {
        throw new Error("IP localStoragedan qayta o'qilmadi");
    }

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(SERVER_ADDRESS_CHANGED_EVENT, {
            detail: { address: normalized },
        }));
    }

    return normalized;
};

export const getServerAddressInputValue = () =>
    (getLocalServerAddress() || DEFAULT_SERVER_ADDRESS).replace(/^https?:\/\//i, "");

export const getApiBaseUrl = () => {
    const saved = getLocalServerAddress();
    const defaultAddress = normalizeServerAddress(DEFAULT_SERVER_ADDRESS);
    const isSecureProdPage = import.meta.env.PROD
        && typeof window !== "undefined"
        && window.location.protocol === "https:";

    if (!import.meta.env.PROD && saved) {
        return `${DEV_RUNTIME_PROXY_PREFIX}/${encodeURIComponent(saved)}`;
    }

    if (isSecureProdPage && (!saved || saved === defaultAddress)) {
        return NETLIFY_DEFAULT_PROXY_PREFIX;
    }

    if (saved) return saved;

    if (import.meta.env.PROD) {
        return DEFAULT_SERVER_ADDRESS;
    }

    return "/tovuq-api";
};
