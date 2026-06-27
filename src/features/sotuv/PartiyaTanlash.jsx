import { useMemo, useState } from "react";
import "../../componrnts/Korzinka/partiya.css";
import { getNarx, formatNarx } from "../../utils/narx";
import ProductQoshish from "./ProductQoshish";
import { getUser } from "../../leyout/login/auth";
import { canViewPrice } from "../../utils/permissions";
import { useBackHandler } from "../../utils/backButtonStack";

export default function PartiyaSelect({ onClose, ProductData, allClose }) {
    const [Productadd, setProductadd] = useState(false);
    const [ProductaddData, setProductaddData] = useState(null);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const user = getUser()
    const canSeePrice = canViewPrice(user);
    useBackHandler(onClose);

    const handleSubmit = (item) => {
        setProductaddData(item);
        setProductadd(true);
    };
    const productRows = useMemo(() => {
        const source = Array.isArray(ProductData)
            ? ProductData
            : ProductData
                ? [ProductData]
                : [];

        return source.flatMap((item) => {
            if (Array.isArray(item?.tab)) {
                return item.tab.map((tabItem, index) => ({
                    ...tabItem,
                    code: tabItem.code || item.tovar_code || item.code || "",
                    name: tabItem.name || item.tovar_name || item.name || "",
                    tovar_code: tabItem.tovar_code || item.tovar_code || item.code || "",
                    tovar_name: tabItem.tovar_name || item.tovar_name || item.name || "",
                    group_tovar_code: tabItem.group_tovar_code || item.group_tovar_code || "",
                    group_tovar_name: tabItem.group_tovar_name || item.group_tovar_name || "",
                    itemId: tabItem.itemId || `${item.tovar_code || item.code || "item"}_${tabItem.date_invoys || index}_${tabItem.term || ""}`,
                }));
            }

            return item && typeof item === "object" ? [item] : [];
        });
    }, [ProductData]);

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);

        const onlyDate = String(dateStr).split(" ")[0];
        const [day, month, year] = onlyDate.split(".");
        const parsed = new Date(`${year}-${month}-${day}`);
        return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
    };

    const sortedProductData = [...productRows].sort((a, b) => {
        // 1. term bo‘yicha
        const termA = parseDate(a.term);
        const termB = parseDate(b.term);

        if (termA - termB !== 0) {
            return termA - termB;
        }

        // 2. partiya / invoys bo‘yicha
        return Number(a.number_invoys) - Number(b.number_invoys);
    });
    return (
        <>
            <div className="overlay">
                <div className="app-safe partiya-safe">
                    <div className="modal partiya-modal">
                        <div className="modal-title partiya-title" onClick={onClose}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <g clipPath="url(#clip0_2001_556)">
                                    <path d="M10 24H38" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 24L18 32" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 24L18 16" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs><clipPath id="clip0_2001_556"><rect width="48" height="48" fill="white" /></clipPath></defs>
                            </svg>
                            <p>Partiya royxati</p>
                        </div>

                        <div className="partya-list">
                            {sortedProductData.length === 0 ? (
                                <p className="partya-empty">Partiya topilmadi</p>
                            ) : sortedProductData.map((item, index) => {
                                const { narx, isVal } = getNarx(item, FormData);

                                return (
                                    <div className="partya-card" key={index} onClick={() => handleSubmit(item)}>
                                        <div className="partya-no">
                                            {/* <span className="no-label">No</span> */}
                                            <span className="no-value">{index + 1}</span>
                                        </div>

                                        <div className="partya-body">
                                            <div className="partya-row border-bottom">
                                                <span className="partya-label">Partya</span>
                                                <span className="partya-value">{item.date_invoys || "-"}</span>
                                            </div>
                                            <div className="partya-row border-bottom">
                                                <span className="partya-label">Yaroqlilik muddati</span>
                                                <span className="partya-value">{item.term || "-"}</span>
                                            </div>

                                            <div className="partya-row border-bottom">
                                                <span className="partya-label">Sotuvchi</span>
                                                <span className="partya-value">{item.bayyer}</span>
                                            </div>
                                            {canSeePrice && (
                                                <>
                                                    <div className="partya-row border-bottom">

                                                        <span className="partya-label">Narx</span>
                                                        <span className="partya-value highlight">
                                                            {formatNarx(narx)} {isVal ? "$" : "so'm"}
                                                        </span>

                                                    </div>
                                                </>
                                            )}
                                            <div className="partya-row">
                                                <span className="partya-label">Qoldiq</span>
                                                <span className="partya-value">{item.qoldiq} {item.ul_bir}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {Productadd &&
                <ProductQoshish
                    item={ProductaddData}
                    onClose={() => setProductadd(false)}
                    handlePartiya={onClose}
                    FormData={FormData}
                />
            }
        </>
    );
}
