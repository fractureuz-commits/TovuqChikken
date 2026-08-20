// Miqdor (soni) uchun umumiy input yordamchilari.
// Katta sonlar "1 300 003" ko'rinishida ajratib ko'rsatiladi, kasr qismi ".", max 3 xona.

export const MAX_QTY_DECIMALS = 3;

// Har qanday kiritilgan matnni toza "1234.5" ko'rinishiga keltiradi
export const sanitizeQtyInput = (raw) => {
    let text = String(raw ?? "")
        .replace(/\s/g, "")
        .replace(/,/g, ".")
        .replace(/[^\d.]/g, "");

    const firstDot = text.indexOf(".");
    if (firstDot !== -1) {
        text = text.slice(0, firstDot + 1) + text.slice(firstDot + 1).replace(/\./g, "");
    }

    const [intRaw = "", decRaw] = text.split(".");
    // "007" → "7", lekin "0" va "0.5" saqlanadi
    const intPart = intRaw.replace(/^0+(?=\d)/, "");

    if (decRaw === undefined) return intPart;
    return `${intPart}.${decRaw.slice(0, MAX_QTY_DECIMALS)}`;
};

export const parseQty = (value) => {
    const num = parseFloat(sanitizeQtyInput(value));
    return Number.isFinite(num) ? num : 0;
};

const groupDigits = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// "1300003.5" → "1 300 003.5"
export const formatQtyText = (value) => {
    const clean = sanitizeQtyInput(value);
    if (clean === "") return "";

    const [intPart, decPart] = clean.split(".");
    const grouped = groupDigits(intPart === "" ? "" : intPart);

    return decPart === undefined ? grouped : `${grouped}.${decPart}`;
};

// Ro'yxatlarda ko'rsatish uchun (raqamdan matnga)
export const formatQty = (value) => {
    const text = formatQtyText(value);
    return text === "" ? "0" : text;
};

export const countDigits = (text) => (String(text).match(/[\d.]/g) || []).length;

// Formatlashdan keyin kursorni to'g'ri joyga qaytarish uchun pozitsiya
export const caretPositionForDigits = (formatted, digitCount) => {
    if (digitCount <= 0) return 0;

    let seen = 0;
    for (let i = 0; i < formatted.length; i += 1) {
        if (/[\d.]/.test(formatted[i])) {
            seen += 1;
            if (seen === digitCount) return i + 1;
        }
    }

    return formatted.length;
};

// Inputga fokus tushganda butun qiymat belgilanadi — yangi son yozish uchun
export const selectAllOnFocus = (event) => {
    const el = event.target;
    if (!el) return;

    const selectAll = () => {
        try {
            el.select();
            el.setSelectionRange(0, String(el.value ?? "").length);
        } catch {
            // ba'zi input turlari setSelectionRange ni qo'llamaydi
        }
    };

    selectAll();
    // Android WebView fokusdan keyin selection ni bekor qiladi — keyingi frameda takrorlaymiz
    requestAnimationFrame(selectAll);
    setTimeout(selectAll, 0);
};
