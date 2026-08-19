import { loadXodim } from "../../utils/storage";
import { toPermissionBoolean } from "../../utils/permissions";

const clean = (val) =>
    String(val || "")
        .replace(/\u00c2|\u00a0/g, "")
        .replace(/\s+/g, "")
        .trim();

const permissionFields = [
    "bushatilgan",
    "hisobot",
    "izoh",
    "narx1",
    "narx2",
    "narx3",
    "narx4",
    "narx_korish",
    "narx_turi_ozgartirish",
    "qarzdorlik",
    "qaytarish",
    "savdo",
    "tolov",
    "harajat",
];

export const checkPin = async (pin) => {
    const xodimlar = await loadXodim();
    if (!xodimlar || !Array.isArray(xodimlar)) return false;

    const found = xodimlar.find(x => clean(x.password) === clean(pin));
    if (!found || toPermissionBoolean(found.bushatilgan)) return false;

    const parsedUser = { ...found };
    permissionFields.forEach((field) => {
        parsedUser[field] = toPermissionBoolean(found[field]);
    });

    localStorage.setItem("current_user", JSON.stringify(parsedUser));
    return true;
};

// Har chaqirilganda yangi obyekt qaytarsa, uni useCallback/useMemo/useEffect
// dependency sifatida ishlatgan komponentlar cheksiz qayta render bo'lib ketadi.
// Shu sabab natija keshlanadi va faqat localStorage o'zgarganda qayta o'qiladi.
let cachedUserRaw;
let cachedUser = null;

export const getUser = () => {
    const data = localStorage.getItem("current_user");
    if (data === cachedUserRaw) return cachedUser;

    cachedUserRaw = data;
    try {
        cachedUser = data ? JSON.parse(data) : null;
    } catch {
        cachedUser = null;
    }
    return cachedUser;
};

export const logout = () => {
    localStorage.removeItem("current_user");
};
