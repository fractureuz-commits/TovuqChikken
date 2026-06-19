import { getApiBaseUrl } from "./serverConfig";

const USERNAME = "Mobil";
const PASSWORD = "12345";
const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));

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

export const apiFetch = (endpoint) => {
    const path = API[endpoint];
    if (!path) throw new Error(`Noma'lum endpoint: ${endpoint}`);

    return fetch(buildUrl(path), {
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

export const apiPost = (path, body) => {
    return fetch(buildUrl(path), {
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
