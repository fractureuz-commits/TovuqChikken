import { Filesystem, Directory } from '@capacitor/filesystem';
import { apiFetch } from './api';

const CACHE_DIR = "cache";

// ✅ Har bir endpoint uchun fayl nomlari
const FILES = {
    products: "products.json",
    kontragent: "kontragent.json",
    Tovar: "tovar.json",
    // yangi qo'shish uchun:
    // orders:   "orders.json",
    // warehouse: "warehouse.json",
};

// RAM cache
const imageMemoryCache = {};

// Sync to'xtatish
let abortSync = false;
export const cancelSync = () => { abortSync = true; };

// Internet tekshirish
export const checkInternet = async () => {
    return true;
};

// ✅ Universal saqlash (rasm yo'q JSON lar uchun)
export const saveData = async (key, data) => {
    if (!FILES[key]) {
        console.error("❌ Noma'lum kalit:", key);
        return;
    }
    try {
        await Filesystem.writeFile({
            path: FILES[key],
            data: JSON.stringify(data),
            directory: Directory.Data,
            encoding: "utf8",
        });
        console.log(`✅ ${FILES[key]} saqlandi:`, data.length, "ta");
    } catch (e) {
        throw new Error(`${key} saqlanmadi: ` + e.message);
    }
};

// ✅ Universal o'qish
export const loadData = async (key) => {
    if (!FILES[key]) {
        console.error("❌ Noma'lum kalit:", key);
        return null;
    }
    try {
        const result = await Filesystem.readFile({
            path: FILES[key],
            directory: Directory.Data,
            encoding: "utf8",
        });
        return JSON.parse(result.data);
    } catch (e) {
        return null;
    }
};

const saveImage = async (code, base64) => {
    try {
        let clean = base64.includes(",") ? base64.split(",")[1] : base64;
        clean = clean.replace(/\s|\n|\r/g, "").trim();
        if (!clean || clean.length < 10) return null;

        await Filesystem.mkdir({
            path: CACHE_DIR,
            directory: Directory.Data,
            recursive: true,
        }).catch(() => {});

        // base64 → blob
        const byteCharacters = atob(clean);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });

        // canvas orqali WEBP ga convert
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);

        const webpBlob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/webp", 0.8)
        );

        const buffer = await webpBlob.arrayBuffer();
        const base64Webp = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        const filePath = `${CACHE_DIR}/${code}.webp`;

        await Filesystem.writeFile({
            path: filePath,
            data: base64Webp,
            directory: Directory.Data,
        });

        return filePath;

    } catch (e) {
        console.error("Rasm xato:", code, e.message);
        return null;
    }
};

export const syncAndSave = async (apiData, onProgress) => {
    abortSync = false;

    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
        console.warn("⚠️ apiData bo'sh!");
        return [];
    }

    try {
        await Filesystem.rmdir({
            path: CACHE_DIR,
            directory: Directory.Data,
            recursive: true,
        });
    } catch (e) { }

    Object.keys(imageMemoryCache).forEach(k => delete imageMemoryCache[k]);

    const total = apiData.length;
    const products = [];
    const failed = [];

    const BATCH_SIZE = 10; // bir vaqtda 10 ta rasm yoziladi

    for (let i = 0; i < total; i += BATCH_SIZE) {

        if (abortSync) {
            console.log("⛔ Sync to'xtatildi:", products.length, "ta saqlandi");
            break;
        }

        const batch = apiData.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
            batch.map(async (item) => {

                if (!item || !item.code) {
                    console.warn("⚠️ Noto'g'ri item:", item);
                    return null;
                }

                let imagePath = null;

                try {
                    imagePath = item.image
                        ? await saveImage(item.code, item.image)
                        : null;
                } catch (e) {
                    console.error("❌ Rasm xato:", item.code, e.message);
                    failed.push(item.code);
                }

                return {
                    c: item.code,
                    n: item.name || "Nomsiz",
                    i: imagePath,
                };
            })
        );

        results.forEach(p => {
            if (p) products.push(p);
        });

        if (onProgress) {
            onProgress(Math.min(i + BATCH_SIZE, total), total);
        }
    }

    if (products.length === 0) {
        console.warn("⚠️ Hech narsa saqlanmadi!");
        return [];
    }

    await saveData("products", products);

    console.log("✅ Sync tugadi:", products.length, "ta product");
    if (failed.length) {
        console.warn("⚠️ Rasm saqlanmagan:", failed.length);
    }

    return products;
};

// ✅ Qisqa yozuv (avvalgi kod bilan muvofiqligi uchun)
export const loadProducts = () => loadData("products");
export const loadKontragent = () => loadData("kontragent");
export const saveKontragent = (data) => saveData("kontragent", data);
export const loadTovar = () => loadData("Tovar");
export const saveTovar = (data) => saveData("Tovar", data);

// Rasm o'qish (RAM cache bilan)
export const loadImage = async (imagePath) => {
    if (!imagePath) return null;

    if (imageMemoryCache[imagePath]) {
        return imageMemoryCache[imagePath];
    }

    try {
        const result = await Filesystem.readFile({
            path: imagePath,
            directory: Directory.Data,
        });

        const src = `data:image/webp;base64,${result.data}`;

        imageMemoryCache[imagePath] = src;
        return src;

    } catch (e) {
        return null;
    }
};

// ✅ Barcha ma'lumotlarni o'chirish
export const clearAllData = async () => {
    // 1 — cache papkasini o'chirish
    try {
        await Filesystem.rmdir({
            path: CACHE_DIR,
            directory: Directory.Data,
            recursive: true,
        });
        console.log("✅ cache/ o'chirildi");
    } catch (e) {
        console.log("cache/ yo'q:", e.message);
    }

    // 2 — Barcha JSON fayllarni o'chirish
    for (const key of Object.keys(FILES)) {
        try {
            await Filesystem.deleteFile({
                path: FILES[key],
                directory: Directory.Data,
            });
            console.log(`✅ ${FILES[key]} o'chirildi`);
        } catch (e) {
            console.log(`${FILES[key]} yo'q:`, e.message);
        }
    }

    // 3 — RAM cache tozalash
    Object.keys(imageMemoryCache).forEach(k => delete imageMemoryCache[k]);
    console.log("✅ RAM cache tozalandi");
};

// ✅ Tovar sync — products kabi rasmlarni ham saqlaydi
export const syncAndSaveTovar = async (apiData, onProgress) => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
        console.warn("⚠️ Tovar apiData bo'sh!");
        return [];
    }

    const total = apiData.length;
    const tovars = [];
    const failed = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = apiData.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
            batch.map(async (item) => {
                if (!item || !item.code) {
                    console.warn("⚠️ Noto'g'ri tovar:", item);
                    return null;
                }

                let imagePath = null;
                try {
                    imagePath = item.image && !item.image.includes("Fayl topilmadi")
                        ? await saveImage(item.code, item.image)
                        : null;
                } catch (e) {
                    console.error("❌ Tovar rasm xato:", item.code, e.message);
                    failed.push(item.code);
                }

                return {
                    code:             item.code,
                    name:             item.name || "Nomsiz",
                    i:                imagePath,           // ← rasm path
                    group_tovar_code: item.group_tovar_code || "",
                    group_tovar_name: item.group_tovar_name || "",
                    narh_sum1:        item.narh_sum1 || "0",
                    narh_sum2:        item.narh_sum2 || "0",
                    narh_sum3:        item.narh_sum3 || "0",
                    narh_sum4:        item.narh_sum4 || "0",
                    narh_val1:        item.narh_val1 || "0",
                    narh_val2:        item.narh_val2 || "0",
                    narh_val3:        item.narh_val3 || "0",
                    narh_val4:        item.narh_val4 || "0",
                    valyuta_turi:     item.valyuta_turi || "1",
                    hajm:             item.hajm || "",
                    ul_bir:           item.ul_bir || "",
                    qoldiq:           item.qoldiq || "0",
                    date_invoys:      item.date_invoys || "",
                    number_invoys:    item.number_invoys || "",
                };
            })
        );

        results.forEach(p => { if (p) tovars.push(p); });

        if (onProgress) {
            onProgress(Math.min(i + BATCH_SIZE, total), total);
        }
    }

    if (tovars.length === 0) {
        console.warn("⚠️ Tovar saqlanmadi!");
        return [];
    }

    await saveData("Tovar", tovars);

    console.log("✅ Tovar sync tugadi:", tovars.length, "ta");
    if (failed.length) console.warn("⚠️ Rasm saqlanmagan:", failed.length);

    return tovars;
};
export const syncKurs = async () => {
    try {
        const BASE_URL = import.meta.env.PROD
            ? "http://192.168.1.103"
            : "/tovuq-api";

        const USERNAME = "Mobil";
        const PASSWORD = "12345";
        const AUTH = btoa(unescape(encodeURIComponent(`${USERNAME}:${PASSWORD}`)));

        const res = await fetch(`${BASE_URL}/tovuq/hs/konsta/get_kurs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${AUTH}`,
            }
        });

        if (!res.ok) throw new Error(`HTTP xato: ${res.status}`);

        const result = await res.json();
        console.log("📦 Kurs raw:", result);

        const kurs = {
            kurs: result.text_repost,
        };

        localStorage.setItem("valyuta_kurs", JSON.stringify(kurs));
        console.log("✅ Kurs saqlandi:", kurs);
        return kurs;

    } catch (err) {
        console.error("❌ Kurs xato:", err.message);
        return null;
    }
};

export const loadKurs = () => {
    const data = localStorage.getItem("valyuta_kurs");
    return data ? JSON.parse(data) : null;
};
