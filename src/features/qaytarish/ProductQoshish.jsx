import { useState, useMemo } from "react";
import "../../componrnts/Korzinka/qoshish.css";
import Swal from "sweetalert2";
import ProductImage from "../../componrnts/ProductImage/ProductImage";
import { formatNarx, parseNarx } from "../../utils/narx";
import { format } from "date-fns";
import { getUser } from "../../leyout/login/auth";
import { canViewPrice, sanitizeDebtFields } from "../../utils/permissions";
import { useBackHandler } from "../../utils/backButtonStack";
import QuantityInput from "../../componrnts/QuantityInput/QuantityInput";
import { formatQty, parseQty } from "../../utils/quantity";
import { readCart, writeCart } from "../../utils/cart";
import { findCartIndex, makeCartItemId } from "../../utils/partiya";

export default function QaytaribOlish({ onExit, onClose, item, handlePartiya }) {
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const [quantity, setQuantity] = useState("1");
    const [loading, setLoading] = useState(false);
    const user = getUser();
    const canSeePrice = canViewPrice(user);
    const currentNarx = canSeePrice ? parseNarx(item?.narh) : 0;
    const isVal = item?.narh_turi;
    const date = format(new Date(), "dd.MM.yyyy HH:mm:ss");
    useBackHandler(onClose);

    const quantityNumber = parseQty(quantity);
    const jami = formatNarx(currentNarx * quantityNumber); // ← formatNarx import dan
    const remainingQoldiq = useMemo(() => {
        return parseFloat(item?.soni || 0);
    }, [item?.soni]);

    const onlyDate = (value) => value?.split(" ")[0] || "";

    const handleBuyurtma = async () => {
        if (quantityNumber <= 0) return;

        if (quantityNumber > remainingQoldiq) {
            Swal.fire({
                icon: "warning",
                title: "Yetarli mahsulot yo'q!",
                text: `Qoldiq: ${formatQty(remainingQoldiq)} ${item?.ul_bir}`,
                confirmButtonColor: "#006CAC",
            });
            return;
        }

        const toNumber = (value) => {
            if (value === null || value === undefined) return 0;
            return Number(
                String(value)
                    .replace(/\s/g, "")
                    .replace(",", ".")
            ) || 0;
        };

        const onlyDate = (value) => value?.split(" ")[0] || "";

        setLoading(true);

        try {
            const itemId = makeCartItemId(item);
            const maxQoldiq = parseFloat(item?.qoldiq || 0);

            let existing = readCart("qaytarish");

            if (!existing.date) {
                existing = sanitizeDebtFields({
                    date: date,
                    mijoz_code: FormData?.kontragent_id,
                    ost_sum: FormData.dt_kt_sum,
                    ost_val: FormData.dt_kt_val,
                    vid_val: FormData?.valyuta_turi,
                    narh_turi: FormData?.narh_turi,
                    user_code: user?.code,
                    tovarlar: existing.tovarlar,
                }, user);
            }

            const alreadyIndex = findCartIndex(existing.tovarlar, item);

            if (alreadyIndex !== -1) {
                existing.tovarlar[alreadyIndex].itemId = itemId;
                const currentQty = toNumber(existing.tovarlar[alreadyIndex].soni);
                const newQty = currentQty + quantityNumber;

                if (newQty > maxQoldiq) {
                    Swal.fire({
                        icon: "warning",
                        title: "Limit to'lgan!",
                        text: `Allaqachon qo'shilgan: ${currentQty}. Qoldiq: ${maxQoldiq} ${item?.ul_bir}`,
                        confirmButtonColor: "#006CAC",
                    });
                    return;
                }

                existing.tovarlar[alreadyIndex].soni = newQty;
                existing.tovarlar[alreadyIndex].narh = toNumber(currentNarx);
                existing.tovarlar[alreadyIndex].Summa = toNumber(currentNarx) * newQty;

                existing.tovarlar[alreadyIndex].kirim_narh_sum = canSeePrice ? toNumber(item?.kirim_narh_sum) : 0;
                existing.tovarlar[alreadyIndex].kirim_narh_val = canSeePrice ? toNumber(item?.kirim_narh_val) : 0;
                existing.tovarlar[alreadyIndex].kirim_summa_sum = canSeePrice
                    ? toNumber(item?.kirim_narh_sum) * newQty
                    : 0;
                existing.tovarlar[alreadyIndex].kirim_summa_val = canSeePrice
                    ? toNumber(item?.kirim_narh_val) * newQty
                    : 0;

                existing.tovarlar[alreadyIndex].term = onlyDate(item?.term);
                existing.tovarlar[alreadyIndex].date_invoys = onlyDate(item?.date_invoys);

            } else {
                console.log(toNumber(item?.kirim_narh_sum) * quantityNumber);

                existing.tovarlar.push({
                    itemId,
                    tovar_code: item?.code,
                    number_invoys: item?.number_invoys,
                    date_invoys: item?.date_invoys,
                    qoldiq: item?.qoldiq,
                    soni: quantityNumber,
                    narh: toNumber(currentNarx),
                    Summa: toNumber(currentNarx) * quantityNumber,
                    bayyer: item?.bayyer,
                    group_tovar_code: item?.group_tovar_code,
                    group_tovar_name: item?.group_tovar_name,
                    hajm: item?.hajm,
                    name: item?.name,
                    narh_sum1: canSeePrice ? item?.narh_sum1 : 0,
                    narh_sum2: canSeePrice ? item?.narh_sum2 : 0,
                    narh_sum3: canSeePrice ? item?.narh_sum3 : 0,
                    narh_sum4: canSeePrice ? item?.narh_sum4 : 0,
                    narh_val1: canSeePrice ? item?.narh_val1 : 0,
                    narh_val2: canSeePrice ? item?.narh_val2 : 0,
                    narh_val3: canSeePrice ? item?.narh_val3 : 0,
                    narh_val4: canSeePrice ? item?.narh_val4 : 0,
                    ul_bir: item?.ul_bir,
                    valyuta_turi: item?.valyuta_turi,
                    term: onlyDate(item?.term),
                    kirim_narh_sum: canSeePrice ? toNumber(item?.kirim_narh_sum) : 0,
                    kirim_narh_val: canSeePrice ? toNumber(item?.kirim_narh_val) : 0,
                    kirim_summa_sum: canSeePrice ? toNumber(item?.kirim_narh_sum) * quantityNumber : 0,
                    kirim_summa_val: canSeePrice ? toNumber(item?.kirim_narh_val) * quantityNumber : 0,
                });
            }

            writeCart("qaytarish", existing);

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
            onExit();

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overlay" style={{ flexDirection: "column" }}>
            <div className="app-safe">
                <div className="modal" style={{ height: '100vh', width: '100%', borderRadius: "0px" }}>
                    <div className="korzinka-detail">
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
                            <h2 style={{ color: "red" }} className="kd-name">{item?.name}</h2>

                            {canSeePrice && (
                                <div className="kd-section">
                                    <label className="kd-label">Mahsulot narxi:</label>
                                    <div className="kd-narx-input">
                                        <input
                                            type="text"
                                            readOnly
                                            style={{ textAlign: 'center', fontWeight: "bold" }}
                                            value={`${formatNarx(currentNarx)}  ${isVal ? "so'm" : "$"}`}
                                            className="kd-input"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="kd-qoldiq-row">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <p style={{ fontSize: '18px' }} className="kd-qoldiq-title">Sotilgan mahsulot miqdori:</p>
                                    <span className="kd-qoldiq-value" style={{ fontSize: '20px' }}>
                                        {formatQty(remainingQoldiq)} {item?.ul_bir}
                                    </span>
                                </div>
                                <span className="kd-qoldiq-date" style={{ fontSize: '14px' }}>
                                    Yaroqlilik Muddati: {onlyDate(item?.term)}
                                </span>
                                <span className="kd-qoldiq-date">
                                    Partiya: {item?.date_invoys} || {item?.number_invoys}
                                </span>

                            </div>

                            <QuantityInput
                                value={quantity}
                                onChange={setQuantity}
                                max={remainingQoldiq}
                                min={0}
                                disabled={loading}
                                variant="kd"
                            />

                            {canSeePrice && (
                                <div className="kd-jami">
                                    <span className="kd-jami-label">Jami summa:</span>
                                    <span className="kd-jami-value">
                                        {jami} {`${isVal ? "so'm" : "$"}`}
                                    </span>
                                </div>
                            )}

                            <button
                                className="kd-buyurtma-btn"
                                onClick={handleBuyurtma}
                                disabled={loading || quantityNumber <= 0}
                            >
                                {loading ? "Yuborilmoqda..." : "Mahsulot qaytarib olish"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
