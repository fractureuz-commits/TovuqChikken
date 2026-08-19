export const toPermissionBoolean = (value) => {
    if (value === true) return true;
    if (value === false || value === null || value === undefined) return false;

    const normalized = String(value)
        .replace(/\u00c2|\u00a0/g, "")
        .replace(/\s+/g, "")
        .trim()
        .toLowerCase();

    return ["true", "1", "ha", "yes", "y", "да", "р”р°"].includes(normalized);
};

export const isAdminUser = (user) => String(user?.rol ?? "") === "1";

export const hasPermission = (user, permission) =>
    isAdminUser(user) || toPermissionBoolean(user?.[permission]);

export const canViewPrice = (user) => hasPermission(user, "narx_korish");
export const canViewDebt = (user) => hasPermission(user, "qarzdorlik");
export const canEditPriceType = (user) => hasPermission(user, "narx_turi_ozgartirish");
export const canViewNotes = (user) => hasPermission(user, "izoh");

export const getAllowedPriceTypes = (user) => {
    if (isAdminUser(user)) return [1, 2, 3, 4];

    const allowed = [1, 2, 3, 4].filter((n) =>
        toPermissionBoolean(user?.[`narx${n}`])
    );

    return allowed.length ? allowed : [1];
};

export const getDefaultPriceType = (user, current = 1) => {
    const allowed = getAllowedPriceTypes(user);
    const selected = Number(current) || 1;

    return allowed.includes(selected) ? selected : allowed[0];
};

// Yangi mahsulot yaratishda aynan shu narx turini kiritish/ko'rish ruxsati bormi
export const canViewPriceType = (user, n) =>
    canViewPrice(user) && hasPermission(user, `narx${n}`);

const PRICE_ITEM_FIELDS = [
    "narh", "Summa",
    "narh_sum1", "narh_sum2", "narh_sum3", "narh_sum4",
    "narh_val1", "narh_val2", "narh_val3", "narh_val4",
    "kirim_narh_sum", "kirim_narh_val",
    "kirim_summa_sum", "kirim_summa_val",
];

// narx_korish yo'q bo'lsa — savatcha elementidagi barcha narx maydonlari 0'lanadi
// (serverga ham, ekranga ham haqiqiy narx chiqmasligi uchun)
export const sanitizePriceItem = (item, user) => {
    if (!item || canViewPrice(user)) return item;

    const cleaned = { ...item };
    PRICE_ITEM_FIELDS.forEach((key) => {
        if (key in cleaned) cleaned[key] = 0;
    });
    return cleaned;
};

// qarzdorlik: to'liq narx obyektidagi (dt_kt_*/ost_*) juftlikni 0'laydi
export const sanitizeDebtFields = (payload, user, sumKey = "ost_sum", valKey = "ost_val") => {
    if (!payload || canViewDebt(user)) return payload;

    return { ...payload, [sumKey]: 0, [valKey]: 0 };
};
