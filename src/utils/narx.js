// src/utils/narx.js
import { loadKurs } from "./storage";

// universal number parser
const clean = (val) => {
    if (val === null || val === undefined) return 0;

    let str = String(val).trim();

    // bo'shliqlarni olib tashlash
    str = str.replace(/\s|\u00a0/g, "");

    // agar vergul kasr bo'lsa (3,9)
    if (str.includes(",") && !str.includes(".")) {
        str = str.replace(",", ".");
    }

    // agar ming ajratgich bo'lsa (1,200.50)
    if (str.includes(",") && str.includes(".")) {
        str = str.replace(/,/g, "");
    }

    return parseFloat(str) || 0;
};

export const getNarx = (item, FormData) => {
    const narxIndex = FormData?.narh_turi || 1;
    const formVal = String(FormData?.valyuta_turi ?? "1");
    const itemVal = String(item?.valyuta_turi ?? "1");

    const kursData = loadKurs();
    const kurs = parseFloat(kursData?.kurs || 1);

    const sumNarx = clean(item?.[`narh_sum${narxIndex}`]);
    const valNarx = clean(item?.[`narh_val${narxIndex}`]);

    let narx = 0;
    let isVal = false;

    if (formVal === "1" && itemVal === "1") {
        narx = Math.round(sumNarx);
        isVal = false;
    } else if (formVal === "2" && itemVal === "2") {
        narx = Math.round(valNarx * 100) / 100;
        isVal = true;
    } else if (formVal === "1" && itemVal === "2") {
        narx = Math.round(valNarx * kurs);
        isVal = false;
    } else if (formVal === "2" && itemVal === "1") {
        narx = kurs > 0 ? Math.round((sumNarx / kurs) * 100) / 100 : 0;
        isVal = true;
    }

    return { narx, isVal, kurs };
};

export const formatNarx = (num) => {
    const rounded = Math.round(num * 100) / 100;
    const parts = rounded.toString().split(".");

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return parts.join(".");
};