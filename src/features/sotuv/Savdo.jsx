import { useState } from "react";
import "../../componrnts/BuyurtmaModal/buyurtma.css";
import MijozSelect from "../../componrnts/SelectMijoz/SelectMijoz";
import Swal from "sweetalert2";
import QrModal from "../../componrnts/QrModal/qrModal";
import MijozaddModal from "../../componrnts/BuyurtmaModal/MijozAdd";
import KorzinkaModal from "./MahsulotGuruhlari";
import CartModal from "./Savat";
import { formatNarx } from "../../utils/narx";
import { getUser } from "../../leyout/login/auth";
import { canEditPriceType, canViewDebt, canViewPrice, getAllowedPriceTypes, getDefaultPriceType } from "../../utils/permissions";
import { useBackHandler } from "../../utils/backButtonStack";

export default function Savdo({ onClose }) {
    const user = getUser();
    const canSeeDebt = canViewDebt(user);
    const canSeePrice = canViewPrice(user);
    const canChangePriceType = canEditPriceType(user);
    const allowedPriceTypes = getAllowedPriceTypes(user);
    const defaultNarxTuri = getDefaultPriceType(user, 1);
    const [ShtrixModal, setShtrixModal] = useState(false);
    const [Korzinka, setKorzinka] = useState(false);
    const [shtrixData, setshtrixData] = useState([]);
    const [openMijozadd, setopenMijozadd] = useState(false);
    const [kontragent, setKontragent] = useState([]);
    const [activeView, setActiveView] = useState("sotib"); // "sotib" | "cart"
    const [showFullForm, setShowFullForm] = useState(false);
    const [FormData, setFormData] = useState(() => {
        const savedForm = JSON.parse(localStorage.getItem("savdo_form") || "null");
        if (savedForm) return savedForm;
        return {
            code: "",
            name: "",
            tel_1: "",
            tel_2: "",
            hudud_code: "",
            hudud_name: "",
            dostav_code: "",
            dostav_name: "",
            manzil: "",
            lat: "",
            lang: "",
            vid_valyuta: "",
            dt_kt_sum: 0,
            dt_kt_val: 0,
            narh_turi: defaultNarxTuri,
            valyuta_turi: "1"
        };
    });
    const [openSelectMijoz, setOpenSelectMijoz] = useState(false);
    useBackHandler(onClose);

    const blurReadonlyInputOnWeb = (event) => {
        if (window.Capacitor?.isNativePlatform?.()) return;
        event.currentTarget.blur();
    };

    const handleSubmit = async () => {
        if (!window.Capacitor?.isNativePlatform?.()) {
            document.activeElement?.blur?.();
        }

        if (!FormData.kontragent_id || !FormData.kontragent) {
            Swal.fire({
                icon: "warning",
                title: "Mijoz tanlanmagan!",
                text: "Iltimos, mijozni tanlang",
                confirmButtonColor: "#dc2626",
            });
            return;
        }
        localStorage.setItem("savdo_form", JSON.stringify(FormData));
        localStorage.setItem("formData", JSON.stringify(FormData));
        setKorzinka(true);
    };

    const handleMijozSelect = (selectedMijoz) => {
        setFormData({
            ...FormData,
            kontragent: selectedMijoz.name,
            kontragent_id: selectedMijoz.code,
            tel_1: selectedMijoz.tel_1 || "",
            hudud: selectedMijoz.hudud_name || "",
            dt_kt_sum: selectedMijoz.dt_kt_sum || 0,
            dt_kt_val: selectedMijoz.dt_kt_val || 0,
        });
        setShowFullForm(true);
    };

    const handleKontragentUpdate = (updated) => {
        setKontragent([...updated]);
    };

    return (
        <>
            {!showFullForm ? (
                // Oddiy mijoz tanlash modali
                <div className="overlay">
                    <div className="modal savdo-modal">
                        <div className="modal-title savdo-title" onClick={onClose}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_2001_556)">
                                    <path d="M10 24H38" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 24L18 32" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 24L18 16" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_2001_556">
                                        <rect width="48" height="48" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <p>Mijoz tanlash</p>
                        </div>
                        <div className="input-group add" style={{ width: '100%' }}>
                            <div className="input-row">
                                <input
                                    readOnly
                                    type="text"
                                    onClick={() => setOpenSelectMijoz(true)}
                                    className="input"
                                    placeholder="Mijozni tanlang"
                                />
                                <button type="button" onClick={() => setopenMijozadd(true)} className="btn-add savdo-btn-add">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // To'liq forma
                <div className="overlay">
                    <div className="modal savdo-modal">
                        <div className="modal-title savdo-title" style={{ justifyContent: 'center' }}>
                            Savdo
                        </div>
                        <form autoComplete="off" noValidate>
                            {/* Mijoz nomi */}
                            <div className="input-group add" style={{ width: '100%' }}>
                                <label>Mijoz nomi</label>
                                <div className="input-row">
                                    <input
                                        readOnly
                                        type="text"
                                        name="savdo-kontragent-display"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        inputMode="none"
                                        tabIndex={-1}
                                        onFocus={blurReadonlyInputOnWeb}
                                        onClick={() => setOpenSelectMijoz(true)}
                                        value={FormData.kontragent}
                                        className="input"
                                        placeholder=""
                                    />
                                    <button type="button" onClick={() => setopenMijozadd(true)} className="btn-add savdo-btn-add">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Telefon raqami */}
                            <div className="input-group" style={{ width: '100%' }}>
                                <label>Telefon raqami</label>
                                <input
                                    readOnly
                                    type="text"
                                    name="savdo-phone-display"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    inputMode="none"
                                    tabIndex={-1}
                                    onFocus={blurReadonlyInputOnWeb}
                                    value={FormData.tel_1}
                                    className="input"
                                    placeholder=""
                                />
                            </div>

                            {/* Hudud nomi */}
                            <div className="input-group" style={{ width: '100%' }}>
                                <label>Hudud nomi</label>
                                <input
                                    readOnly
                                    type="text"
                                    name="savdo-region-display"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    inputMode="none"
                                    tabIndex={-1}
                                    onFocus={blurReadonlyInputOnWeb}
                                    value={FormData.hudud}
                                    className="input"
                                    placeholder=""
                                />
                            </div>

                            {(canSeeDebt || canSeePrice) && (
                                <>
                                    {/* Qarzdorlik */}
                                    {canSeeDebt && (
                                        <div className="input-group" style={{ width: '100%' }}>
                                            <label>Qarzdorlik</label>
                                            <div className="input-row">
                                                <div className="debt-box">
                                                    <span className="debt-value-black">{formatNarx(FormData.dt_kt_sum)} <small>so'm</small></span>
                                                    <span className="debt-value-green">{formatNarx(FormData.dt_kt_val)} <small>$</small></span>
                                                </div>
                                                <button type="button" className="btn-refresh savdo-btn-refresh">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* So'm / valyuta */}
                                    {(canSeePrice && canChangePriceType) && (
                                        <>
                                            <div className="checkbox-row" style={{ width: '100%' }}>
                                                {["som", "valyuta"].map((c) => (
                                                    <label key={c} className="checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={FormData.valyuta_turi === (c === "som" ? "1" : "2")}
                                                            onChange={() => setFormData(prev => ({
                                                                ...prev,
                                                                valyuta_turi: c === "som" ? "1" : "2"
                                                            }))}
                                                        />
                                                        <span className="checkbox-custom savdo-checkbox-custom">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </span>
                                                        {c === "som" ? "So'm" : "Valyuta"}
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="divider" />
                                        </>
                                    )}

                                    {(canSeePrice && canChangePriceType) && (
                                        <>
                                            <div className="narx-grid" style={{ width: '100%' }}>
                                                {allowedPriceTypes.map((n) => (
                                                    <label className="checkbox-label" key={n}>
                                                        <input
                                                            type="checkbox"
                                                            checked={FormData.narh_turi === n}
                                                            onChange={() => setFormData(prev => ({ ...prev, narh_turi: n }))}
                                                        />
                                                        <span className="checkbox-custom savdo-checkbox-custom">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </span>
                                                        Narx {n}
                                                    </label>
                                                ))}
                                            </div>

                                            <div className="divider" />
                                        </>
                                    )}
                                </>
                            )}

                            {/* Buttons */}
                            <div className="btn-row" style={{ width: '100%' }}>
                                <button type="button" className="btn-cancel savdo-btn-cancel" onClick={onClose}>
                                    BEKOR QILISH
                                </button>
                                <button type="button" onClick={handleSubmit} className="btn-submit savdo-btn-submit">
                                    DAVOM ETISH
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {openSelectMijoz &&
                <MijozSelect
                    TD={true}
                    title="Mijozlar ro'yxati"
                    setOpenSelectMijoz={setOpenSelectMijoz}
                    onClose={() => setOpenSelectMijoz(false)}
                    FormData={FormData}
                    setFormData={setFormData}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
                    onMijozSelect={handleMijozSelect}
                />}
            {openMijozadd &&
                <MijozaddModal
                    setopenMijozadd={setopenMijozadd}
                    onClose={() => setopenMijozadd(false)}
                    onKontragentUpdate={handleKontragentUpdate}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
                    setFormData={setFormData}
                />}
            {ShtrixModal &&
                <QrModal handleModal={() => setShtrixModal((prev) => !prev)}
                    setshtrixData={setshtrixData} shtrixData={shtrixData}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
                />
            }
            {activeView === "sotib" && Korzinka &&
                <KorzinkaModal handleModal={() => setKorzinka((prev) => !prev)}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
                    KorzinkaModal={() => setActiveView("cart")}
                    FormData={FormData}
                    qaytarish={false}
                    kirim={false}
                />
            }
            {activeView === "cart" && (
                <CartModal
                    qaytarish={false}
                    kirim={false}
                    onExit={onClose}
                    onClose={() => setActiveView('sotib')}
                    KorzinkaModal={() => setActiveView("sotib")}
                />
            )}
        </>
    );
}
