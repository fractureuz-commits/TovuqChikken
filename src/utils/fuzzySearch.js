// Xatoga chidamli ("youtube" uslubidagi) qidiruv.
//
// - Kirill/lotin translitteratsiyasi: "Крыло" ni "krilo" deb yozib ham topish mumkin
// - Imloviy xatolar: "kirlo", "krylo", "kryilo" → baribir topiladi (Levenshtein masofasi)
// - So'z boshi, bo'lak va harflar ketma-ketligi bo'yicha moslik
// - Natijalar moslik darajasi bo'yicha saralanadi

const CYRILLIC_MAP = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
    и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
    ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
    ў: "o", қ: "k", ғ: "g", ҳ: "h", ә: "a", ө: "o", ү: "u", ҷ: "j", і: "i", ї: "i", є: "e",
};

const DIGRAPHS = [
    ["shch", "s"],
    ["sch", "s"],
    ["sh", "s"],
    ["ch", "c"],
    ["ts", "c"],
    ["ck", "k"],
    ["ph", "f"],
    ["kh", "h"],
    ["zh", "j"],
    ["yo", "o"],
    ["yu", "u"],
    ["ya", "a"],
    ["ye", "e"],
];

const SINGLES = { x: "h", q: "k", w: "v", y: "i" };

// Ikkala tomon (qidiruv so'zi va mahsulot nomi) bir xil qoidadan o'tadi
export const normalizeSearchText = (value) => {
    let text = String(value ?? "").toLowerCase();

    // apostroflar (o', g', oʻ, ’)
    text = text.replace(/['`ʻʼ’‘]/g, "");

    // kirill → lotin
    text = text.replace(/[Ѐ-ӿ]/g, (char) => (
        Object.prototype.hasOwnProperty.call(CYRILLIC_MAP, char) ? CYRILLIC_MAP[char] : " "
    ));

    // qo'sh harflar
    DIGRAPHS.forEach(([from, to]) => {
        text = text.split(from).join(to);
    });

    // yakka harf variantlari (x/h, q/k, w/v, y/i)
    text = text.replace(/[xqwy]/g, (char) => SINGLES[char]);

    // harf/raqamdan boshqasi — ajratgich
    text = text.replace(/[^a-z0-9]+/g, " ");

    // takrorlangan harflar: "russkaya" ≈ "ruskaya"
    text = text.replace(/([a-z])\1+/g, "$1");

    return text.trim().replace(/\s+/g, " ");
};

const maxDistanceFor = (length) => {
    if (length <= 2) return 0;
    if (length <= 4) return 1;
    if (length <= 7) return 2;
    return 3;
};

// Damerau-Levenshtein, limitdan oshsa erta to'xtaydi
export const boundedDistance = (a, b, limit) => {
    if (a === b) return 0;
    if (limit <= 0) return a === b ? 0 : limit + 1;

    const lenA = a.length;
    const lenB = b.length;

    if (Math.abs(lenA - lenB) > limit) return limit + 1;
    if (lenA === 0) return lenB;
    if (lenB === 0) return lenA;

    let prevPrev = [];
    let prev = new Array(lenB + 1);
    let curr = new Array(lenB + 1);

    for (let j = 0; j <= lenB; j += 1) prev[j] = j;

    for (let i = 1; i <= lenA; i += 1) {
        curr[0] = i;
        const from = Math.max(1, i - limit);
        const to = Math.min(lenB, i + limit);

        if (from > 1) curr[from - 1] = limit + 1;

        let rowBest = limit + 1;

        for (let j = from; j <= to; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;

            let value = Math.min(
                curr[j - 1] + 1,
                prev[j] + 1,
                prev[j - 1] + cost
            );

            // o'rin almashgan harflar: "krilo" ↔ "kirlo"
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                const swapped = prevPrev[j - 2];
                if (swapped !== undefined && swapped + 1 < value) value = swapped + 1;
            }

            curr[j] = value;
            if (value < rowBest) rowBest = value;
        }

        if (to < lenB) curr[to + 1] = limit + 1;
        if (rowBest > limit) return limit + 1;

        prevPrev = prev;
        prev = curr;
        curr = new Array(lenB + 1);
    }

    return prev[lenB];
};

const isSubsequence = (token, text) => {
    let index = 0;

    for (let i = 0; i < text.length && index < token.length; i += 1) {
        if (text[i] === token[index]) index += 1;
    }

    return index === token.length;
};

// Bitta so'z (token) uchun ball. Moslik bo'lmasa — null
const scoreToken = (token, haystack, words) => {
    if (!token) return 0;

    if (haystack.startsWith(token)) return 1000;

    const wordIndex = words.findIndex(word => word.startsWith(token));
    if (wordIndex !== -1) return 900 - Math.min(wordIndex, 5);

    if (haystack.includes(token)) return 800;

    // Kod/raqam bo'yicha qidiruvda xatoga yo'l qo'yilmaydi ("0001" ≠ "0003")
    if (/^\d+$/.test(token)) return null;

    const limit = maxDistanceFor(token.length);

    if (limit > 0) {
        let best = null;

        for (const word of words) {
            // to'liq so'z bilan taqqoslash
            const wordDistance = boundedDistance(token, word, limit);
            if (wordDistance <= limit) {
                const value = 700 - wordDistance * 60;
                if (best === null || value > best) best = value;
                continue;
            }

            // so'z boshi bilan taqqoslash: "chikenn" ≈ "chikenburger"
            if (word.length > token.length) {
                const prefix = word.slice(0, Math.min(word.length, token.length + limit));
                const prefixDistance = boundedDistance(token, prefix, limit);
                if (prefixDistance <= limit) {
                    const value = 600 - prefixDistance * 60;
                    if (best === null || value > best) best = value;
                }
            }
        }

        if (best !== null) return best;
    }

    if (token.length >= 4 && isSubsequence(token, haystack)) return 300;

    return null;
};

// Normallashtirilgan matnlar keshi (har bir element uchun bir marta hisoblanadi)
const normalizedCache = new WeakMap();
const primitiveCache = new Map();

const getNormalized = (item, getText) => {
    if (item && typeof item === "object") {
        const cached = normalizedCache.get(item);
        if (cached) return cached;

        const raw = getText(item);
        const haystack = normalizeSearchText(raw);
        const entry = { haystack, words: haystack ? haystack.split(" ") : [] };

        normalizedCache.set(item, entry);
        return entry;
    }

    const raw = String(getText(item) ?? "");
    const cached = primitiveCache.get(raw);
    if (cached) return cached;

    const haystack = normalizeSearchText(raw);
    const entry = { haystack, words: haystack ? haystack.split(" ") : [] };

    if (primitiveCache.size > 5000) primitiveCache.clear();
    primitiveCache.set(raw, entry);

    return entry;
};

export const scoreItem = (item, query, getText) => {
    const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
    if (tokens.length === 0) return 0;

    const { haystack, words } = getNormalized(item, getText);
    if (!haystack) return null;

    let total = 0;

    for (const token of tokens) {
        const score = scoreToken(token, haystack, words);
        if (score === null) return null;
        total += score;
    }

    // qisqaroq nom — aniqroq moslik
    return total / tokens.length - Math.min(haystack.length, 60) / 100;
};

/**
 * Ro'yxatni xatoga chidamli qidiruv bo'yicha filtrlaydi va saralaydi.
 * getText(item) — qidiriladigan matn (nom, kod, guruh va h.k. birlashtirilgan).
 */
export const fuzzySearch = (list, query, getText) => {
    const trimmed = String(query ?? "").trim();
    if (!trimmed) return list;
    if (!Array.isArray(list)) return [];

    const scored = [];

    for (let i = 0; i < list.length; i += 1) {
        const item = list[i];
        const score = scoreItem(item, trimmed, getText);
        if (score === null) continue;

        scored.push({ item, score, index: i });
    }

    scored.sort((a, b) => (b.score - a.score) || (a.index - b.index));

    return scored.map(entry => entry.item);
};
