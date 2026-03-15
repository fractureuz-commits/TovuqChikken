import { useState } from "react";
import "./partiya.css";
import { getNarx, formatNarx } from "../../utils/narx";
import ProductQoshish from "./ProductQoshish";

export default function PartiyaSelect({ onClose, ProductData ,allClose}) {
    const [Productadd, setProductadd] = useState(false);
    const [ProductaddData, setProductaddData] = useState(null);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");

    const handleSubmit = (item) => {
        setProductaddData(item);
        setProductadd(true);
    };
    return (
        <>
            <div className="overlay">
                <div className="modal" style={{ height: "100vh", width: '100%', borderRadius: '0px', display: "flex", flexDirection: "column" }}>
                    <div className="modal-title" onClick={onClose}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <g clipPath="url(#clip0_2001_556)">
                                <path d="M10 24H38" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 24L18 32" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 24L18 16" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <defs><clipPath id="clip0_2001_556"><rect width="48" height="48" fill="white"/></clipPath></defs>
                        </svg>
                        <p>Partiya royxati</p>
                    </div>

                    {ProductData.map((item, index) => {
                        const { narx, isVal } = getNarx(item, FormData); // ✅ map ichida
                        return (
                            <div className="partya-card" key={index} onClick={() => handleSubmit(item)}>
                                <div className="partya-no">
                                    <span className="no-label">No</span>
                                    <span className="no-value">{item.number_invoys}</span>
                                </div>
                                <div className="partya-body">
                                    <div className="partya-row border-bottom">
                                        <span className="partya-label">Partya</span>
                                        <span className="partya-value">{item.date_invoys}</span>
                                    </div>
                                    <div className="partya-row border-bottom">
                                        <span className="partya-label">Sotuvchi</span>
                                        <span className="partya-value">{item.bayyer}</span>
                                    </div>
                                    <div className="partya-row border-bottom">
                                        <span className="partya-label">Narx</span>
                                        <span className="partya-value highlight">
                                            {formatNarx(narx)} {isVal ? "$" : "so'm"}
                                        </span>
                                    </div>
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