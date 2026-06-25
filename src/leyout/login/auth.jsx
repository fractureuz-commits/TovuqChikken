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

export const getUser = () => {
    const data = localStorage.getItem("current_user");
    return data ? JSON.parse(data) : null;
};

export const logout = () => {
    localStorage.removeItem("current_user");
};
