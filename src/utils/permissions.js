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
