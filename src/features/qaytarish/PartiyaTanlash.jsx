import { useMemo, useState } from "react";
import { getNarx, formatNarx, parseNarx } from "../../utils/narx";
import ProductQoshish from "../sotuv/ProductQoshish";
import QaytaribOlish from "./ProductQoshish";
import { getUser } from "../../leyout/login/auth";
import { canViewPrice } from "../../utils/permissions";
import { useBackHandler } from "../../utils/backButtonStack";

export default function QaytarishSelect({ onClose, ProductData, allClose }) {
    const [Productadd, setProductadd] = useState(false);
    const [ProductaddData, setProductaddData] = useState(null);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const user = getUser();
    const canSeePrice = canViewPrice(user);
    useBackHandler(onClose);

    const handleSubmit = (item) => {
        setProductaddData(item);
        setProductadd(true);
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);

        // "26.03.2027 0:00:00" yoki "09.03.2026"
        const onlyDate = String(dateStr).split(" ")[0];
        const [day, month, year] = onlyDate.split(".");
        const parsed = new Date(`${year}-${month}-${day}`);
        return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
    };

    // 🔥 grouped ProductData -> flat list
    const flatProductData = useMemo(() => {
        const groups = Array.isArray(ProductData)
            ? ProductData
            : ProductData
                ? [ProductData]
                : [];

        return groups.flatMap((group) => {
            const tabs = Array.isArray(group?.tab) ? group.tab : [group];

            return tabs.filter(Boolean).map((tabItem, index) => ({
                ...tabItem,

                // parent dan keladigan info
                code: tabItem.code || group.tovar_code || group.code || "",
                tovar_code: tabItem.tovar_code || group.tovar_code || group.code || "",
                name: tabItem.name || group.tovar_name || group.name || "",
                tovar_name: tabItem.tovar_name || group.tovar_name || group.name || "",

                // agar yo‘q bo‘lsa fallback
                group_tovar_code: tabItem.group_tovar_code || group.group_tovar_code || "",
                group_tovar_name: tabItem.group_tovar_name || group.group_tovar_name || "",

                // unique key uchun
                itemId: tabItem.itemId || `${group.tovar_code || group.code || "item"}_${tabItem.date_invoys || index}_${tabItem.term || ""}`,
            }));
        });
    }, [ProductData]);

    const sortedProductData = [...flatProductData].sort((a, b) => {
        // 1. term bo‘yicha
        const termA = parseDate(a.term);
        const termB = parseDate(b.term);

        if (termA - termB !== 0) {
            return termA - termB;
        }

        // 2. invoys bo‘yicha
        return Number(a.number_invoys || 0) - Number(b.number_invoys || 0);
    });

    return (
        <>
            <div className="overlay">
                <div className="app-safe partiya-safe">
                    <div className="modal partiya-modal">
                        <div className="modal-title" onClick={onClose}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <g clipPath="url(#clip0_2001_556)">
                                    <path d="M10 24H38" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 24L18 32" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 24L18 16" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_2001_556">
                                        <rect width="48" height="48" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <p>Qaytarish ro‘yxati</p>
                        </div>

                        <div className="partya-list">
                            {sortedProductData.length === 0 ? (
                                <p className="partya-empty">Qaytarish ro'yxati topilmadi</p>
                            ) : sortedProductData.map((item, index) => {
                                const { narx, isVal } = getNarx(item, FormData);

                                return (
                                    <div
                                        className="partya-card"
                                        key={item.itemId || index}
                                        onClick={() => handleSubmit(item)}
                                    >
                                        <div className="partya-no">
                                            <span className="no-label">No</span>
                                            <span className="no-value">{index + 1}</span>
                                        </div>

                                        <div className="partya-body">
                                            <div className="partya-row border-bottom">
                                                <span className="partya-label">Mahsulot</span>
                                                <span className="partya-value">{item.name}</span>
                                            </div>

                                            <div className="partya-row border-bottom">
                                                <span className="partya-label">Partya</span>
                                                <span className="partya-value">{item.date_invoys || "-"}</span>
                                            </div>
                                            <div className="partya-row border-bottom">
                                                <span className="partya-label">Yaroqlilik muddati</span>
                                                <span className="partya-value">{item.term || "-"}</span>
                                            </div>

                                            {/* <div className="partya-row border-bottom">
                                            <span className="partya-label">Sotuvchi</span>
                                            <span className="partya-value">{item.bayyer || "-"}</span>
                                        </div> */}

                                            {canSeePrice && (
                                                <div className="partya-row border-bottom">
                                                    <span className="partya-label">Narx</span>
                                                    <span className="partya-value highlight">
                                                        {formatNarx(parseNarx(item.narh))} {isVal ? "$" : "so'm"}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="partya-row">
                                                <span className="partya-label">Miqdor</span>
                                                <span className="partya-value">
                                                    {item.soni || 0} kg
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {Productadd && (
                <QaytaribOlish
                    item={ProductaddData}
                    onClose={() => setProductadd(false)}
                    onExit={onClose}
                    handleQaytarish={onClose}
                    FormData={FormData}
                />
            )}
        </>
    );
}
