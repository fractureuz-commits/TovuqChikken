const BASE_URL = import.meta.env.PROD
    ? "http://192.168.1.103"
    : "";

const API_PREFIX = import.meta.env.PROD ? "" : "/tovuq-api";

const USERNAME = "Mobil";
const PASSWORD = "12345";
const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));

export const AUTH_HEADER = {
    "Authorization": `Basic ${toBase64(`${USERNAME}:${PASSWORD}`)}`,
};

// ✅ URL yasash — ikki qo'shaloq slash bo'lmasin
const buildUrl = (path) => {
    const base = `${BASE_URL}${API_PREFIX}`;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export const API = {
    products: buildUrl("/tovuq/hs/group_tovar/get_group_tovar"),
    kontragent: buildUrl("/tovuq/hs/kontragent/get_kontragent"),
    Tovar: buildUrl("/tovuq/hs/tovar/get_tovar"),
    kurs: buildUrl("/tovuq/hs/konsta/get_kurs"),
    Xodim: buildUrl("/tovuq/hs/xodim/get_xodim"),
    Region: buildUrl("/tovuq/hs/region/get_region"),
    Harajat: buildUrl("/tovuq/hs/harajat/get_harajat"),
};
// ✅ GET
export const apiFetch = (endpoint) => {
    const url = API[endpoint];
    if (!url) throw new Error(`Noma'lum endpoint: ${endpoint}`);

    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...AUTH_HEADER,
        },
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP xato: ${res.status}`);
        return res.json();
    });
};

// ✅ POST — path dan / boshlanishi shart emas
export const apiPost = (path, body) => {
    const url = buildUrl(path);

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...AUTH_HEADER,
        },
        body: JSON.stringify(body),
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP xato: ${res.status}`);
        return res.json();
    });
};