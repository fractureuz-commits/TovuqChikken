import { getApiBaseUrl, SERVER_ADDRESS_CHANGED_EVENT } from "./serverConfig";

const USERNAME = "Mobil";
const PASSWORD = "12345";
const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));
const DEFAULT_GET_TIMEOUT_MS = 0;
const DEFAULT_POST_TIMEOUT_MS = 90000;

export const AUTH_HEADER = {
    "Authorization": `Basic ${toBase64(`${USERNAME}:${PASSWORD}`)}`,
};

export const API = {
    products: "/tovuq/hs/group_tovar/get_group_tovar",
    kontragent: "/tovuq/hs/kontragent/get_kontragent",
    Tovar: "/tovuq/hs/tovar/get_tovar",
    kurs: "/tovuq/hs/konsta/get_kurs",
    Xodim: "/tovuq/hs/xodim/get_xodim",
    Region: "/tovuq/hs/region/get_region",
    Harajat: "/tovuq/hs/harajat/get_harajat",
};

export const buildUrl = (path) => {
    const base = getApiBaseUrl();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

const jsonHeaders = (includeAuth = true) => ({
    "Content-Type": "application/json",
    ...(includeAuth ? AUTH_HEADER : {}),
});

export class ApiError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "ApiError";
        Object.assign(this, details);
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error) => {
    if (error?.name === "AbortError") return true;
    if (!error?.status) return true;
    return error.status >= 500;
};

const parseResponse = async (response, url) => {
    const text = await response.text();

    if (!response.ok) {
        throw new ApiError(`HTTP xato: ${response.status}`, {
            status: response.status,
            url,
            body: text.slice(0, 300),
        });
    }

    if (!text.trim()) return null;

    try {
        return JSON.parse(text);
    } catch {
        throw new ApiError("Backend JSON qaytarmadi. Server manzil yoki endpointni tekshiring.", {
            status: response.status,
            url,
            body: text.slice(0, 300),
        });
    }
};

const apiRequest = async (path, fetchOptions = {}, options = {}) => {
    const url = buildUrl(path);
    const timeoutMs = options.timeoutMs ?? DEFAULT_GET_TIMEOUT_MS;
    const retries = options.retries ?? 0;
    const retryDelayMs = options.retryDelayMs ?? 700;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        const shouldUseTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0;
        const controller = shouldUseTimeout ? new AbortController() : null;
        const timeoutId = shouldUseTimeout
            ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
            : null;

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                ...(controller ? { signal: controller.signal } : {}),
            });

            return await parseResponse(response, url);
        } catch (err) {
            lastError = err;

            if (attempt >= retries || !shouldRetry(err)) {
                throw err;
            }

            await sleep(retryDelayMs * (attempt + 1));
        } finally {
            if (timeoutId) globalThis.clearTimeout(timeoutId);
        }
    }

    throw lastError;
};

const inFlightGets = new Map();

if (typeof window !== "undefined") {
    window.addEventListener(SERVER_ADDRESS_CHANGED_EVENT, () => {
        inFlightGets.clear();
    });
}

export const apiGet = (path, options = {}) => {
    const includeAuth = options.auth !== false;
    const url = buildUrl(path);
    const key = `${url}|auth:${includeAuth}`;

    if (options.dedupe !== false && inFlightGets.has(key)) {
        return inFlightGets.get(key);
    }

    const request = apiRequest(path, {
        method: "GET",
        headers: jsonHeaders(includeAuth),
    }, {
        retries: options.retries ?? 0,
        timeoutMs: options.timeoutMs ?? DEFAULT_GET_TIMEOUT_MS,
        retryDelayMs: options.retryDelayMs,
    }).finally(() => {
        inFlightGets.delete(key);
    });

    if (options.dedupe !== false) {
        inFlightGets.set(key, request);
    }

    return request;
};

export const apiFetch = (endpoint, options = {}) => {
    const path = API[endpoint];
    if (!path) throw new Error(`Noma'lum endpoint: ${endpoint}`);

    return apiGet(path, {
        retries: options.retries ?? 2,
        timeoutMs: options.timeoutMs ?? DEFAULT_GET_TIMEOUT_MS,
        retryDelayMs: options.retryDelayMs,
        dedupe: options.dedupe,
    });
};

export const apiPostJson = (path, body, options = {}) => {
    const includeAuth = options.auth !== false;

    return apiRequest(path, {
        method: "POST",
        headers: jsonHeaders(includeAuth),
        body: JSON.stringify(body),
    }, {
        retries: options.retries ?? 0,
        timeoutMs: options.timeoutMs ?? DEFAULT_POST_TIMEOUT_MS,
        retryDelayMs: options.retryDelayMs,
    });
};

export const apiPost = (path, body, options = {}) => apiPostJson(path, body, options);
