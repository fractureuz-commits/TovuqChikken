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
        localStorage.setItem("current_user", JSON.stringify(found));
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