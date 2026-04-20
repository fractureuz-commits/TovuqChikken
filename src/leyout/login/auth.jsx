import { loadXodim } from "../../utils/storage";

const clean = (val) =>
    String(val || "")
        .replace(/\u00c2|\u00a0/g, "")
        .replace(/\s+/g, "")
        .trim();
export const checkPin = async (pin) => {
    const xodimlar = await loadXodim();
    if (!xodimlar || !Array.isArray(xodimlar)) return false;
    const found = xodimlar.find(x => clean(x.password) === clean(pin));
    if (found) {
        const parsedUser = {
            ...found,
            bushatilgan: found.bushatilgan === "Да",
            hisobot: found.hisobot === "Да",
            izoh: found.izoh === "Да",
            narx1: found.narx1 === "Да",
            narx2: found.narx2 === "Да",
            narx3: found.narx3 === "Да",
            narx4: found.narx4 === "Да",
            narx_korish: found.narx_korish === "Да",
            narx_turi_ozgartirish: found.narx_turi_ozgartirish === "Да",
            qarzdorlik: found.qarzdorlik === "Да",
            qaytarish: found.qaytarish === "Да",
            savdo: found.savdo === "Да",
            tolov: found.tolov === "Да",
            harajat: found.harajat === "Да",
        };
        localStorage.setItem("current_user", JSON.stringify(parsedUser));
        return true;
    }

    return false;
};

export const getUser = () => {
    const data = localStorage.getItem("current_user");
    return data ? JSON.parse(data) : null;
};
export const logout = () => {
    localStorage.removeItem("current_user");
};