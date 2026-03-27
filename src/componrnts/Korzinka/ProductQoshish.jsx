import { useState, useEffect, useMemo } from "react";
import "./qoshish.css";
import Swal from "sweetalert2";
import { loadImage, loadTovar } from "../../utils/storage";
import { getNarx, formatNarx } from "../../utils/narx";
import { format, parse } from "date-fns";
import { getUser } from "../../leyout/login/auth";

export default function ProductQoshish({ onClose, item, handlePartiya }) {
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const [quantity, setQuantity] = useState(1);
    const [imgSrc, setImgSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const { narx: currentNarx, isVal } = getNarx(item, FormData);
    const date = format(new Date(), "dd.MM.yyyy HH:mm:ss");
    const user = getUser();
    
    const jami = formatNarx(currentNarx * quantity); // ← formatNarx import dan
    useEffect(() => {
        const getImage = async () => {
            if (item?.i) {
                const src = await loadImage(item.i);
                if (src) { setImgSrc(src); return; }
            }
            if (item?.code) {
                const tovarList = await loadTovar();
                const found = tovarList?.find(t => t.code === item.code);
                if (found?.i) {
                    const src = await loadImage(found.i);
                    if (src) setImgSrc(src);
                }
            }
        };
        getImage();
    }, [item?.i, item?.code]);

    const remainingQoldiq = useMemo(() => {
        const itemId = `${item?.date_invoys}_${item?.code}_${item.term}`;

        let cart;
        try {
            cart = JSON.parse(localStorage.getItem("buyurtma_cart"));
        } catch {
            cart = null;
        }

        const tovarlar = cart?.tovarlar || [];

        const inCart = tovarlar.find(i => i.itemId === itemId);

        const qoldiq = parseFloat(item?.qoldiq || 0);
        const already = inCart ? inCart.soni : 0;

        return qoldiq - already;

    }, [item?.date_invoys, item?.code]);

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
            newValue = Math.min(newValue, remainingQoldiq);

            return newValue.toString();
        });
    };
    const handleBuyurtma = async () => {
        if (quantity <= 0) return;

        if (quantity > remainingQoldiq) {
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
            const itemId = `${item?.date_invoys}_${item?.code}`;
            const maxQoldiq = parseFloat(item?.qoldiq || 0);

            let existing = JSON.parse(localStorage.getItem("buyurtma_cart"));

            if (!existing || typeof existing !== "object" || !existing.tovarlar) {
                existing = {
                    date: date,
                    mijoz_code: FormData?.kontragent_id,
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
                const currentQty = existing.tovarlar[alreadyIndex].soni;
                const newQty = currentQty + quantity;

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
                existing.tovarlar[alreadyIndex].Summa = currentNarx * newQty;

            } else {
                existing.tovarlar.push({
                    itemId,
                    tovar_code: item?.code,
                    number_invoys: item?.number_invoys,
                    date_invoys: format(
                        parse(item?.date_invoys, "dd.MM.yyyy", new Date()),
                        "yyyyMMdd"
                    ),
                    qoldiq: item?.qoldiq,
                    soni: quantity,
                    narh: currentNarx,
                    Summa: currentNarx * quantity,
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
                    valyuta_turi: item.valyuta_turi,
                    term: item.term,
                });
            }
            localStorage.setItem("buyurtma_cart", JSON.stringify(existing));
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
            <div className="modal" style={{ height: '100vh', width: '100%', borderRadius: "0px", paddingTop: '25px' }}>
                <div className="korzinka-detail">
                    <div className="kd-image-wrap">
                        <button className="kd-back" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        {imgSrc
                            ? <img src={imgSrc} alt={item?.name} className="kd-image" />
                            : <div className="kd-image-placeholder" />
                        }
                    </div>

                    <div className="kd-content">
                        <h2 className="kd-name">{item?.name}</h2>

                        <div className="kd-section">
                            <label className="kd-label">Mahsulot narxi:</label>
                            <div className="kd-narx-input">
                                <input
                                    type="text"
                                    readOnly
                                    style={{ textAlign: 'center', fontWeight: "bold" }}
                                    value={`${formatNarx(currentNarx)}  ${isVal ? "$" : "so'm"}`}
                                    className="kd-input"
                                />
                            </div>
                        </div>
                        <div className="kd-qoldiq-row">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <p style={{ fontSize: '18px' }} className="kd-qoldiq-title">Mahsulot qoldig'i</p>
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

                        </div>

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

                                    setQuantity(val > remainingQoldiq ? String(remainingQoldiq) : value);
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

                        <div className="kd-jami">
                            <span className="kd-jami-label">Jami summa:</span>
                            <span className="kd-jami-value">
                                {jami} {isVal ? "$" : "SO'M"}
                            </span>
                        </div>

                        <button
                            className="kd-buyurtma-btn"
                            onClick={handleBuyurtma}
                            disabled={loading || quantity <= 0}
                        >
                            {loading ? "Yuborilmoqda..." : "BUYURTMA"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}