import { useState, useMemo } from "react";
import "../../componrnts/Korzinka/qoshish.css";
import Swal from "sweetalert2";
import ProductImage from "../../componrnts/ProductImage/ProductImage";
import { getNarx, formatNarx, parseNarx } from "../../utils/narx";
import { format, parse } from "date-fns";
import { getUser } from "../../leyout/login/auth";
import { canViewPrice } from "../../utils/permissions";
import { toNumber } from "../../utils/queueSummary";
import { useBackHandler } from "../../utils/backButtonStack";

const toDateInputValue = (value) => {
    const text = String(value || "").split(" ")[0];
    const parts = text.split(".");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
};

const toDisplayDate = (value) => value
    ? value.split("-").reverse().join(".")
    : "";

export default function ProductQoshish({ onClose, item, handlePartiya, kirim = false }) {
    const FORM_KEY = kirim ? "mahsulot_kirimi_form" : "formData";
    const CART_KEY = kirim ? "mahsulot_kirimi_cart" : "buyurtma_cart";
    const FormData = JSON.parse(localStorage.getItem(FORM_KEY) || "{}");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const { narx: sotuvNarxi, isVal: sotuvIsVal } = getNarx(item, FormData);
    const [kirimValyuta, setKirimValyuta] = useState(
        String(FormData?.valyuta_turi || "1")
    );
    const [kirimNarxi, setKirimNarxi] = useState(() => {
        const field = String(FormData?.valyuta_turi) === "2" ? "kirim_narh_val" : "kirim_narh_sum";
        return item?.[field] || "";
    });
    const [yaroqlilik, setYaroqlilik] = useState(() => toDateInputValue(item?.term));
    const isVal = kirim ? kirimValyuta === "2" : sotuvIsVal;
    const currentNarx = kirim ? parseNarx(kirimNarxi) : sotuvNarxi;
    const date = format(new Date(), "dd.MM.yyyy HH:mm:ss");
    const user = getUser();
    const canSeePrice = canViewPrice(user);
    useBackHandler(onClose);

    const jami = formatNarx(currentNarx * quantity); // ← formatNarx import dan
    const remainingQoldiq = useMemo(() => {
        const itemId = `${item?.date_invoys}_${item?.code}_${item.term}`;

        let cart;
        try {
            cart = JSON.parse(localStorage.getItem(CART_KEY));
        } catch {
            cart = null;
        }

        const tovarlar = cart?.tovarlar || [];
        const inCart = tovarlar.find(i => i.itemId === itemId);

        const qoldiq = Number(
            String(item?.qoldiq || 0).replace(/\s/g, "")
        );

        const already = Number(inCart?.soni || 0);

        return kirim ? qoldiq : qoldiq - already;
    }, [CART_KEY, item?.date_invoys, item?.code, item?.term, item?.qoldiq, kirim]);

    const handleQuantity = (type) => {
        setQuantity((prev) => {
            const current = parseFloat(prev || 0);

            let newValue = current;

            if (type === "plus") {
                newValue = current + 1;
            } else if (type === "minus") {
                newValue = current - 1;
            }

            newValue = Math.max(0, newValue);
            if (!kirim) newValue = Math.min(newValue, remainingQoldiq);

            return newValue.toString();
        });
    };
    const handleBuyurtma = async () => {
        if (quantity <= 0) return;

        if (kirim && currentNarx <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Kirim narxini kiriting!",
                confirmButtonColor: "#006CAC",
            });
            return;
        }

        if (kirim && !yaroqlilik) {
            Swal.fire({
                icon: "warning",
                title: "Yaroqlilik muddatini kiriting!",
                confirmButtonColor: "#d97706",
            });
            return;
        }

        if (!kirim && quantity > remainingQoldiq) {
            Swal.fire({
                icon: "warning",
                title: "Yetarli mahsulot yo'q!",
                text: `Qoldiq: ${remainingQoldiq} ${item?.ul_bir}`,
                confirmButtonColor: "#006CAC",
            });
            return;
        }

        setLoading(true);

        try {
            const itemId = kirim ? String(item?.code) : `${item?.date_invoys}_${item?.code}`;
            const maxQoldiq = Number(
                String(item?.qoldiq || 0)
                    .replace(/\s/g, "")
                    .replace(",", ".")
            );

            let existing = JSON.parse(localStorage.getItem(CART_KEY));

            if (!existing || typeof existing !== "object" || !existing.tovarlar) {
                existing = {
                    date: date,
                    mijoz_code: FormData?.kontragent_id,
                    mijoz_name: FormData?.kontragent,
                    ost_sum: FormData.dt_kt_sum,
                    ost_val: FormData.dt_kt_val,
                    vid_val: FormData?.valyuta_turi,
                    narh_turi: FormData?.narh_turi,
                    user_code: user?.code,
                    tovarlar: [],
                };
            }

            const alreadyIndex = existing.tovarlar.findIndex(
                (i) => i.itemId === itemId
            );

            if (alreadyIndex !== -1) {
                const currentQty = toNumber(existing.tovarlar[alreadyIndex].soni);
                const newQty = currentQty + toNumber(quantity);

                if (!kirim && newQty > maxQoldiq) {
                    Swal.fire({
                        icon: "warning",
                        title: "Limit to'lgan!",
                        text: `Allaqachon qo'shilgan: ${currentQty}. Qoldiq: ${maxQoldiq} ${item?.ul_bir}`,
                        confirmButtonColor: "#006CAC",
                    });
                    return;
                }

                existing.tovarlar[alreadyIndex].soni = newQty;
                existing.tovarlar[alreadyIndex].narh = currentNarx;
                existing.tovarlar[alreadyIndex].Summa = currentNarx * newQty;
                existing.tovarlar[alreadyIndex].kirim_narh_sum = isVal ? 0 : currentNarx;
                existing.tovarlar[alreadyIndex].kirim_narh_val = isVal ? currentNarx : 0;
                existing.tovarlar[alreadyIndex].kirim_summa_sum = isVal ? 0 : currentNarx * newQty;
                existing.tovarlar[alreadyIndex].kirim_summa_val = isVal ? currentNarx * newQty : 0;
                existing.tovarlar[alreadyIndex].valyuta_turi = kirimValyuta;
                existing.tovarlar[alreadyIndex].term = toDisplayDate(yaroqlilik);

            } else {
                existing.tovarlar.push({
                    itemId,
                    tovar_code: item?.code,
                    number_invoys: kirim ? "" : item?.number_invoys,
                    date_invoys: kirim ? "" : format(
                            parse(item?.date_invoys, "dd.MM.yyyy", new Date()),
                            "yyyyMMdd"
                        ),
                    qoldiq: item?.qoldiq,
                    soni: toNumber(quantity),
                    narh: currentNarx,
                    Summa: currentNarx * toNumber(quantity),
                    bayyer: item.bayyer,
                    group_tovar_code: item.group_tovar_code,
                    group_tovar_name: item.group_tovar_name,
                    hajm: item.hajm,
                    name: item.name,
                    narh_sum1: item.narh_sum1,
                    narh_sum2: item.narh_sum2,
                    narh_sum3: item.narh_sum3,
                    narh_sum4: item.narh_sum4,
                    narh_val1: item.narh_val1,
                    narh_val2: item.narh_val2,
                    narh_val3: item.narh_val3,
                    narh_val4: item.narh_val4,
                    ul_bir: item.ul_bir,
                    valyuta_turi: kirim ? kirimValyuta : item.valyuta_turi,
                    term: kirim ? toDisplayDate(yaroqlilik) : item.term,
                    kirim_narh_sum: isVal ? 0 : currentNarx,
                    kirim_narh_val: isVal ? currentNarx : 0,
                    kirim_summa_sum: isVal ? 0 : currentNarx * toNumber(quantity),
                    kirim_summa_val: isVal ? currentNarx * toNumber(quantity) : 0,
                });
            }
            localStorage.setItem(CART_KEY, JSON.stringify(existing));
            Swal.fire({
                icon: "success",
                title: "Qo'shildi!",
                text: `${item?.name} — ${quantity} ${item?.ul_bir}`,
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

                            {(canSeePrice || kirim) && (
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
                                                className="kd-input"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {kirim && (
                                <div className="kirim-currency-switch" role="group" aria-label="Valyuta turi">
                                    <button
                                        type="button"
                                        className={kirimValyuta === "1" ? "active" : ""}
                                        onClick={() => setKirimValyuta("1")}
                                    >
                                        SO'M
                                    </button>
                                    <button
                                        type="button"
                                        className={kirimValyuta === "2" ? "active" : ""}
                                        onClick={() => setKirimValyuta("2")}
                                    >
                                        VALYUTA ($)
                                    </button>
                                </div>
                            )}

                            {kirim && (
                                <div className="kd-section">
                                    <label className="kd-label">Yaroqlilik muddati:</label>
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
                                        {remainingQoldiq} {item?.ul_bir}
                                    </span>
                                </div>
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
                            <div className="kd-counter">
                                <button className="kd-counter-btn" onClick={() => handleQuantity("minus")}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="#006CAC" strokeWidth="2" />
                                        <path d="M8 12h8" stroke="#006CAC" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                                <input
                                    type="tel"
                                    value={quantity}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // faqat son va nuqtadan keyin max 3 ta raqam
                                        if (!/^\d*\.?\d{0,3}$/.test(value)) return;

                                        if (value === "") {
                                            setQuantity("");
                                            return;
                                        }

                                        const val = Math.max(0, parseFloat(value));

                                        setQuantity(!kirim && val > remainingQoldiq ? String(remainingQoldiq) : value);
                                    }}
                                    className="kd-counter-input"
                                    inputMode="decimal"
                                />
                                <button className="kd-counter-btn" onClick={() => handleQuantity("plus")}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="#006CAC" strokeWidth="2" />
                                        <path d="M12 8v8M8 12h8" stroke="#006CAC" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            {(canSeePrice || kirim) && (
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
                                disabled={loading || quantity <= 0}
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
