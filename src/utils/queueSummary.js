const hasValue = (value) => value !== undefined && value !== null && value !== "";

export const toNumber = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "boolean") return 0;

    let str = String(value ?? "").trim();
    if (!str) return 0;

    str = str
        .replace(/\u00a0/g, " ")
        .replace(/[^\d,.\-]/g, "");

    if (!str || str === "-") return 0;

    const commaCount = (str.match(/,/g) || []).length;
    const dotCount = (str.match(/\./g) || []).length;

    if (commaCount > 0 && dotCount > 0) {
        const commaIndex = str.lastIndexOf(",");
        const dotIndex = str.lastIndexOf(".");

        if (commaIndex > dotIndex) {
            str = str.replace(/\./g, "").replace(",", ".");
        } else {
            str = str.replace(/,/g, "");
        }
    } else if (commaCount === 1) {
        const [left, right] = str.split(",");
        str = right?.length === 3 && left?.length <= 3
            ? `${left}${right}`
            : str.replace(",", ".");
    } else if (commaCount > 1) {
        str = str.replace(/,/g, "");
    } else if (dotCount === 1) {
        const [left, right] = str.split(".");
        if (right?.length === 3 && left?.length <= 3) {
            str = `${left}${right}`;
        }
    } else if (dotCount > 1) {
        str = str.replace(/\./g, "");
    }

    return parseFloat(str) || 0;
};

export const formatMoney = (num = 0, currency = "so'm") => {
    return `${toNumber(num).toLocaleString("ru-RU")} ${currency}`;
};

const firstNumber = (item, keys) => {
    for (const key of keys) {
        if (hasValue(item?.[key])) return toNumber(item[key]);
    }

    return 0;
};

const sumFields = (item, keys) => {
    return keys.reduce((sum, key) => sum + toNumber(item?.[key]), 0);
};

const firstNonZeroNumber = (item, keys) => {
    for (const key of keys) {
        if (!hasValue(item?.[key])) continue;

        const num = toNumber(item[key]);
        if (num !== 0) return num;
    }

    return 0;
};

export const getPaymentSomTotal = (payment = {}) => {
    const fieldTotal = sumFields(payment, [
        "NaqdSum",
        "naqt_sum",
        "naqd_sum",
        "PlastikSum",
        "plastik_sum",
        "ClickSum",
        "click_sum",
        "clic_sum",
        "HisobSum",
        "hisob_sum",
    ]);

    return fieldTotal || firstNumber(payment, [
        "jami_sum",
        "JamiSum",
        "summa_sum",
        "SummaSum",
        "summa",
        "Summa",
        "amount",
        "sum",
        "tolov_sum",
        "jami",
    ]);
};

export const getPaymentDollarTotal = (payment = {}) => {
    const explicitTotal = firstNumber(payment, [
        "HisobVal",
        "hisob_val",
        "jami_val",
        "JamiVal",
        "summa_val",
        "SummaVal",
        "amount_val",
    ]);

    if (explicitTotal) return explicitTotal;

    return sumFields(payment, [
        "NaqdVal",
        "naqt_val",
        "naqd_val",
        "PlastikVal",
        "plastik_val",
        "ClickVal",
        "click_val",
    ]);
};

export const getExpenseSomTotal = (expense = {}) => {
    const explicitTotal = firstNumber(expense, [
        "jami_sum",
        "JamiSum",
        "summa_sum",
        "SummaSum",
        "summa",
        "Summa",
        "amount",
        "sum",
        "harajat_sum",
        "jami",
    ]);

    if (explicitTotal) return explicitTotal;

    return sumFields(expense, [
        "naqd_sum",
        "naqt_sum",
        "NaqdSum",
        "plastik_sum",
        "PlastikSum",
        "clic_sum",
        "click_sum",
        "ClickSum",
        "perech_sum",
    ]);
};

export const getExpenseDollarTotal = (expense = {}) => {
    const explicitTotal = firstNumber(expense, [
        "jami_val",
        "JamiVal",
        "summa_val",
        "SummaVal",
        "amount_val",
    ]);

    if (explicitTotal) return explicitTotal;

    return sumFields(expense, [
        "naqd_val",
        "naqt_val",
        "NaqdVal",
        "perech_val",
    ]);
};

const orderData = (order = {}) => order?.data || order || {};

export const getOrderItems = (order = {}) => {
    const data = orderData(order);
    return Array.isArray(data?.tovarlar) ? data.tovarlar : [];
};

export const getCartItemTotal = (item = {}) => {
    const directTotal = firstNonZeroNumber(item, [
        "Summa",
        "summa",
        "jami",
        "amount",
        "total",
        "line_total",
    ]);

    if (directTotal) return directTotal;

    const price = firstNonZeroNumber(item, [
        "narh",
        "narx",
        "price",
        "narh_sum",
        "narh_val",
        "narh_sum1",
        "narh_val1",
    ]);
    const quantity = firstNonZeroNumber(item, ["soni", "qty", "quantity", "count"]) || 1;

    return price * quantity;
};

const getOrderTotal = (order = {}) => {
    const data = orderData(order);
    const items = getOrderItems(order);

    return firstNumber(data, ["jami_summa", "jami", "summa", "Summa", "amount"])
        || items.reduce((sum, item) => sum + getCartItemTotal(item), 0);
};

export const isOrderDollar = (order = {}) => {
    const data = orderData(order);
    return String(data?.vid_val ?? data?.valyuta_turi ?? "1") !== "1";
};

export const getOrderSomTotal = (order = {}) => {
    return isOrderDollar(order) ? 0 : getOrderTotal(order);
};

export const getOrderDollarTotal = (order = {}) => {
    return isOrderDollar(order) ? getOrderTotal(order) : 0;
};
