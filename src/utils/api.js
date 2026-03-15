const BASE_URL = import.meta.env.PROD
    ? "http://192.168.1.103"
    : "";

// ✅ POST uchun BaseUrl
export const BaseUrl = import.meta.env.PROD
    ? "http://192.168.1.103/"
    : "";

const USERNAME = "Mobil";
const PASSWORD = "12345";

const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));

export const AUTH_HEADER = {
    "Authorization": `Basic ${toBase64(`${USERNAME}:${PASSWORD}`)}`,
};

export const API = {
    products: `${BASE_URL}/tovuq-api/tovuq/hs/group_tovar/get_group_tovar`,
    kontragent: `${BASE_URL}/tovuq-api/tovuq/hs/kontragent/get_kontragent`,
    Tovar: `${BASE_URL}/tovuq-api/tovuq/hs/tovar/get_tovar`,
    kurs: `${BASE_URL}/tovuq/hs/konsta/get_kurs`,  // ← qo'shildi

};

export const apiFetch = (endpoint) => {
    return fetch(API[endpoint], {
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
    return fetch(`${BaseUrl}${path}`, {
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
