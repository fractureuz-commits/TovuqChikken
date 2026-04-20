import { useState } from "react";
import "./partiya.css";
import { getNarx, formatNarx } from "../../utils/narx";
import ProductQoshish from "./ProductQoshish";
import { getUser } from "../../leyout/login/auth";

export default function PartiyaSelect({ onClose, ProductData, allClose }) {
    const [Productadd, setProductadd] = useState(false);
    const [ProductaddData, setProductaddData] = useState(null);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const user = getUser()

    const handleSubmit = (item) => {
        setProductaddData(item);
        setProductadd(true);
    };
    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);

        const [day, month, year] = dateStr.split(".");
        return new Date(`${year}-${month}-${day}`);
    };
    const sortedProductData = [...ProductData].sort((a, b) => {
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
                <div className="app-safe">
                    <div className="modal" style={{ height: '100vh', width: '100%', borderRadius: '0px', display: "flex", flexDirection: "column" }}>
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

                        {sortedProductData.map((item, index) => {
                            const { narx, isVal } = getNarx(item, FormData);

                            return (
                                <div className="partya-card" key={index} onClick={() => handleSubmit(item)}>
                                    <div className="partya-no">
                                        <span className="no-label">No</span>
                                        <span className="no-value">{index + 1}</span>
                                    </div>

                                    <div className="partya-body">
                                        <div className="partya-row border-bottom">
                                            <span className="partya-label">Partya</span>
                                            <span className="partya-value">{item.date_invoys}</span>
                                            <div className="line"></div>
                                            <span className="partya-label">Yaroqlilik muddati:</span>
                                            <span className="partya-value">{item.term}</span>
                                        </div>

                                        <div className="partya-row border-bottom">
                                            <span className="partya-label">Sotuvchi</span>
                                            <span className="partya-value">{item.bayyer}</span>
                                        </div>
                                        {(user?.rol === "1" || user?.narx_korish) && (
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