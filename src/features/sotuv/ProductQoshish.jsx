import { useState, useMemo } from "react";
import "../../componrnts/Korzinka/qoshish.css";
import Swal from "sweetalert2";
import ProductImage from "../../componrnts/ProductImage/ProductImage";
import { getNarx, formatNarx, parseNarx } from "../../utils/narx";
import { format, parse } from "date-fns";
import { getUser } from "../../leyout/login/auth";
import { canViewPrice, sanitizeDebtFields } from "../../utils/permissions";
import { toNumber } from "../../utils/queueSummary";
import { useBackHandler } from "../../utils/backButtonStack";
import QuantityInput from "../../componrnts/QuantityInput/QuantityInput";
import { formatQty, parseQty, selectAllOnFocus } from "../../utils/quantity";
import { getCartKey, getFormKey, readCart, writeCart } from "../../utils/cart";
import {
    findCartIndex,
    getCartQty,
    getReservedMap,
    getReservedQty,
    makeCartItemId,
    normalizeInvoysDate,
    useReservedPartiya,
} from "../../utils/partiya";

const toDateInputValue = (value) => {
    const text = String(value || "").split(" ")[0];
    const parts = text.split(".");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
};

// "19.08.2026" → "20260819" (noto'g'ri format kelsa ham xato bermaydi)
const toInvoysDate = (value) => {
    const text = String(value ?? "").split(" ")[0];
    if (!text) return "";

    try {
        const parsed = parse(text, "dd.MM.yyyy", new Date());
        if (!Number.isNaN(parsed.getTime())) return format(parsed, "yyyyMMdd");
    } catch {
        // format mos kelmadi — pastdagi zaxira variant ishlaydi
    }

    return normalizeInvoysDate(text);
};

// Yaroqlilik muddati majburiy emas - kiritilmasa 1C ga "0" yuboriladi
const toDisplayDate = (value) => value
    ? value.split("-").reverse().join(".")
    : "0";

export default function ProductQoshish({ onClose, item, handlePartiya, kirim = false, boshQoldiq = false }) {
    const FORM_KEY = getFormKey({ kirim, boshQoldiq });
    const CART_KEY = getCartKey({ kirim, boshQoldiq });
    const FormData = JSON.parse(localStorage.getItem(FORM_KEY) || "{}");
    const [quantity, setQuantity] = useState("1");
    const [loading, setLoading] = useState(false);
    const { narx: sotuvNarxi, isVal: sotuvIsVal } = getNarx(item, FormData);
    const kirimValyuta = "1"; // Kirimda valyuta tanlash yo'q — doim so'mda
    const [kirimNarxi, setKirimNarxi] = useState(() => item?.kirim_narh_sum || "");
    const [yaroqlilik, setYaroqlilik] = useState(() => toDateInputValue(item?.term));
    const isVal = kirim ? kirimValyuta === "2" : sotuvIsVal;
    const user = getUser();
    const canSeePrice = canViewPrice(user);
    const currentNarx = canSeePrice ? (kirim ? parseNarx(kirimNarxi) : sotuvNarxi) : 0;
    const date = format(new Date(), "dd.MM.yyyy HH:mm:ss");
    useBackHandler(onClose);

    const quantityNumber = parseQty(quantity);
    const jami = formatNarx(currentNarx * quantityNumber); // ← formatNarx import dan
    const { reserved, refreshReserved } = useReservedPartiya();

    // Savatdagi shu partiyaga tegishli miqdor (modal ochilganda o'qiladi)
    const cartItems = useMemo(() => readCart(CART_KEY).tovarlar, [CART_KEY]);

    // Yuborilmagan savdolarda band qilingan miqdor
    const reservedQty = useMemo(
        () => (kirim ? 0 : getReservedQty(item, reserved)),
        [item, reserved, kirim]
    );

    const cartQty = useMemo(
        () => (kirim ? 0 : getCartQty(cartItems, item)),
        [cartItems, item, kirim]
    );

    // Haqiqiy mavjud qoldiq: server qoldig'i − yuborilmagan savdolar − savat
    const remainingQoldiq = useMemo(() => {
        const qoldiq = toNumber(item?.qoldiq);
        if (kirim) return qoldiq;

        const available = qoldiq - reservedQty - cartQty;
        return available > 0 ? available : 0;
    }, [item?.qoldiq, kirim, reservedQty, cartQty]);

    const handleBuyurtma = async () => {
        if (quantityNumber <= 0) return;

        if (kirim && canSeePrice && currentNarx <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Kirim narxini kiriting!",
                confirmButtonColor: "#006CAC",
            });
            return;
        }

        if (!kirim && quantityNumber > remainingQoldiq) {
            Swal.fire({
                icon: "warning",
                title: "Yetarli mahsulot yo'q!",
                text: `Mavjud qoldiq: ${formatQty(remainingQoldiq)} ${item?.ul_bir}`,
                confirmButtonColor: "#006CAC",
            });
            return;
        }

        setLoading(true);

        try {
            // Yuborilmagan savdolar shu orada o'zgargan bo'lishi mumkin — qayta o'qiymiz
            if (!kirim) await refreshReserved();

            const itemId = makeCartItemId(item, { kirim });
            const maxQoldiq = toNumber(item?.qoldiq);

            let existing = readCart(CART_KEY);

            if (!existing.date) {
                existing = sanitizeDebtFields({
                    date: date,
                    mijoz_code: FormData?.kontragent_id,
                    mijoz_name: FormData?.kontragent,
                    ost_sum: FormData.dt_kt_sum,
                    ost_val: FormData.dt_kt_val,
                    vid_val: FormData?.valyuta_turi,
                    narh_turi: FormData?.narh_turi,
                    user_code: user?.code,
                    tovarlar: existing.tovarlar,
                }, user);
            }

            const alreadyIndex = findCartIndex(existing.tovarlar, item, { kirim });
            const currentQty = alreadyIndex !== -1
                ? toNumber(existing.tovarlar[alreadyIndex].soni)
                : 0;
            const newQty = currentQty + quantityNumber;

            if (!kirim) {
                // Partiya qoldig'i = 1C qoldig'i − yuborilmagan savdolarda band bo'lgani
                const freshReserved = getReservedQty(item, getReservedMap());
                const available = maxQoldiq - freshReserved;

                if (newQty > available) {
                    Swal.fire({
                        icon: "warning",
                        title: "Limit to'lgan!",
                        html: `Partiya qoldig'i: <b>${formatQty(maxQoldiq)}</b> ${item?.ul_bir || ""}`
                            + (freshReserved > 0
                                ? `<br>Yuborilmagan savdolarda: <b>${formatQty(freshReserved)}</b>`
                                : "")
                            + (currentQty > 0
                                ? `<br>Savatda: <b>${formatQty(currentQty)}</b>`
                                : "")
                            + `<br>Qo'shish mumkin: <b>${formatQty(Math.max(0, available - currentQty))}</b>`,
                        confirmButtonColor: "#006CAC",
                    });
                    return;
                }
            }

            if (alreadyIndex !== -1) {
                existing.tovarlar[alreadyIndex].itemId = itemId;
                existing.tovarlar[alreadyIndex].soni = newQty;
                existing.tovarlar[alreadyIndex].narh = currentNarx;
                existing.tovarlar[alreadyIndex].Summa = currentNarx * newQty;
                existing.tovarlar[alreadyIndex].kirim_narh_sum = isVal ? 0 : currentNarx;
                existing.tovarlar[alreadyIndex].kirim_narh_val = isVal ? currentNarx : 0;
                existing.tovarlar[alreadyIndex].kirim_summa_sum = isVal ? 0 : currentNarx * newQty;
                existing.tovarlar[alreadyIndex].kirim_summa_val = isVal ? currentNarx * newQty : 0;
                if (kirim) {
                    existing.tovarlar[alreadyIndex].valyuta_turi = kirimValyuta;
                    existing.tovarlar[alreadyIndex].term = toDisplayDate(yaroqlilik);
                }

            } else {
                existing.tovarlar.push({
                    itemId,
                    tovar_code: item?.code,
                    number_invoys: kirim ? "" : item?.number_invoys,
                    date_invoys: kirim ? "" : toInvoysDate(item?.date_invoys),
                    qoldiq: item?.qoldiq,
                    soni: quantityNumber,
                    narh: currentNarx,
                    Summa: currentNarx * quantityNumber,
                    bayyer: item.bayyer,
                    group_tovar_code: item.group_tovar_code,
                    group_tovar_name: item.group_tovar_name,
                    hajm: item.hajm,
                    name: item.name,
                    narh_sum1: canSeePrice ? item.narh_sum1 : 0,
                    narh_sum2: canSeePrice ? item.narh_sum2 : 0,
                    narh_sum3: canSeePrice ? item.narh_sum3 : 0,
                    narh_sum4: canSeePrice ? item.narh_sum4 : 0,
                    narh_val1: canSeePrice ? item.narh_val1 : 0,
                    narh_val2: canSeePrice ? item.narh_val2 : 0,
                    narh_val3: canSeePrice ? item.narh_val3 : 0,
                    narh_val4: canSeePrice ? item.narh_val4 : 0,
                    ul_bir: item.ul_bir,
                    valyuta_turi: kirim ? kirimValyuta : item.valyuta_turi,
                    term: kirim ? toDisplayDate(yaroqlilik) : item.term,
                    kirim_narh_sum: isVal ? 0 : currentNarx,
                    kirim_narh_val: isVal ? currentNarx : 0,
                    kirim_summa_sum: isVal ? 0 : currentNarx * quantityNumber,
                    kirim_summa_val: isVal ? currentNarx * quantityNumber : 0,
                });
            }
            writeCart(CART_KEY, existing);
            Swal.fire({
                icon: "success",
                title: "Qo'shildi!",
                text: `${item?.name} — ${formatQty(quantityNumber)} ${item?.ul_bir}`,
                confirmButtonColor: "#006CAC",
                timer: 500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            if (handlePartiya) handlePartiya();
            onClose()
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overlay" style={{ flexDirection: "column" }}>
            <div className="app-safe">
                <div className="modal" style={{ height: '100vh', width: '100%', borderRadius: "0px" }}>
                    <div className={`korzinka-detail ${kirim ? "kirim-product-add" : ""}`}>
                        <div className="kd-image-wrap">
                            <button className="kd-back" onClick={onClose}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <ProductImage
                                imagePath={item?.i}
                                productCode={item?.code}
                                alt={item?.name}
                                className="kd-image"
                            />
                        </div>

                        <div className="kd-content">
                            <h2 className="kd-name">{item?.name}</h2>

                            {canSeePrice && (
                                <>
                                    <div className="kd-section">
                                        <label className="kd-label">{kirim ? "Kirim narxi:" : "Mahsulot narxi:"}</label>
                                        <div className="kd-narx-input">
                                            <input
                                                type="text"
                                                readOnly={!kirim}
                                                style={{ textAlign: 'center', fontWeight: "bold" }}
                                                value={kirim ? kirimNarxi : `${formatNarx(currentNarx)}  ${isVal ? "$" : "so'm"}`}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    if (/^\d*\.?\d{0,3}$/.test(value)) setKirimNarxi(value);
                                                }}
                                                inputMode={kirim ? "decimal" : undefined}
                                                placeholder={kirim ? "0" : undefined}
                                                onFocus={kirim ? selectAllOnFocus : undefined}
                                                className="kd-input"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {kirim && (
                                <div className="kd-section">
                                    <label className="kd-label">Yaroqlilik muddati (ixtiyoriy):</label>
                                    <div className="kd-narx-input">
                                        <input
                                            type="date"
                                            className="kd-input kirim-date-input"
                                            value={yaroqlilik}
                                            onChange={(event) => setYaroqlilik(event.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {!kirim && <div className="kd-qoldiq-row">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <p style={{ fontSize: '18px' }} className="kd-qoldiq-title">Mahsulot qoldig'i:</p>
                                    <span className="kd-qoldiq-value" style={{ fontSize: '20px' }}>
                                        {formatQty(remainingQoldiq)} {item?.ul_bir}
                                    </span>
                                </div>
                                {(reservedQty > 0 || cartQty > 0) && (
                                    <span className="kd-qoldiq-band">
                                        Band qilingan:
                                        {reservedQty > 0 && ` yuborilmagan savdolarda ${formatQty(reservedQty)}`}
                                        {reservedQty > 0 && cartQty > 0 && ","}
                                        {cartQty > 0 && ` savatda ${formatQty(cartQty)}`}
                                        {` (jami qoldiq: ${formatQty(item?.qoldiq)} ${item?.ul_bir || ""})`}
                                    </span>
                                )}
                                <span className="kd-qoldiq-date" style={{ fontSize: '14px' }}>
                                    Yaroqlilik Muddati: {item?.term}
                                </span>
                                <span className="kd-qoldiq-date">
                                    Partiya: {item?.date_invoys} || {item?.number_invoys}
                                </span>

                            </div>}

                            {kirim && (
                                <label className="kd-label kirim-quantity-label">
                                    Miqdori ({item?.ul_bir || "kg"}):
                                </label>
                            )}
                            <QuantityInput
                                value={quantity}
                                onChange={setQuantity}
                                max={kirim ? null : remainingQoldiq}
                                min={0}
                                disabled={loading}
                                variant="kd"
                            />

                            {canSeePrice && (
                                <>
                                    <div className="kd-jami">
                                        <span className="kd-jami-label">Jami summa:</span>
                                        <span className="kd-jami-value">
                                            {jami} {isVal ? "$" : "SO'M"}
                                        </span>
                                    </div>
                                </>
                            )}
                            <button
                                className="kd-buyurtma-btn"
                                onClick={handleBuyurtma}
                                disabled={loading || quantityNumber <= 0}
                            >
                                {loading ? "Saqlanmoqda..." : kirim ? "QO'SHISH" : "BUYURTMA"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
