export const KIRIM_HISTORY_KEY = "mahsulot_kirimlari";

const readJson = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
};

export const saveKirimHistory = (kirim) => {
    const history = readJson(KIRIM_HISTORY_KEY, []);
    localStorage.setItem(KIRIM_HISTORY_KEY, JSON.stringify([...history, kirim]));
};
