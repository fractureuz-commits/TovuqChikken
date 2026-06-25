import { useState } from "react";
import "./buyurtma.css";
import MijozSelect from "../SelectMijoz/SelectMijoz";
import Swal from "sweetalert2";
import QrModal from "../QrModal/qrModal";
import MijozaddModal from "./MijozAdd";
import KorzinkaModal from "../Korzinka/korzinka";
import CartModal from "../Korzinka/Cart";
import { formatNarx } from "../../utils/narx";
import { getUser } from "../../leyout/login/auth";
import { canEditPriceType, canViewDebt, canViewPrice, getAllowedPriceTypes, getDefaultPriceType } from "../../utils/permissions";
import { useBackHandler } from "../../utils/backButtonStack";
export default function BuyurtmaModal({ onClose, }) {
    const user = getUser()
    const canSeeDebt = canViewDebt(user);
    const canSeePrice = canViewPrice(user);
    const canChangePriceType = canEditPriceType(user);
    const allowedPriceTypes = getAllowedPriceTypes(user);
    const defaultNarxTuri = getDefaultPriceType(user, 1);
    const [currency, setCurrency] = useState("som");
    const [ShtrixModal, setShtrixModal] = useState(false);
    const [Korzinka, setKorzinka] = useState(false);
    const [selectedNarx, setSelectedNarx] = useState();
    const [shtrixData, setshtrixData] = useState([]);
    const [openMijozadd, setopenMijozadd] = useState(false);
    const [kontragent, setKontragent] = useState([]);
    const [error, seterror] = useState([]);
    const [activeView, setActiveView] = useState("sotib"); // "sotib" | "cart"
    const [FormData, setFormData] = useState({
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

        // qo‘shimcha sening form uchun kerak fieldlar
        vid_valyuta: "",
        dt_kt_sum: 0,
        dt_kt_val: 0,
        narh_turi: defaultNarxTuri,
        valyuta_turi: "1"
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
                confirmButtonColor: "#006CAC",
            });
            return;
        }
        localStorage.setItem("formData", JSON.stringify(FormData));
        setKorzinka(true);
    };
    const handleKontragentUpdate = (updated) => {
        setKontragent([...updated]);
    };
    return (
        <>
            <div className="overlay">
                <div className="modal">
                    <div className="modal-title" style={{ justifyContent: 'center' }}>Buyurtma berish</div>
                    <form autoComplete="off" noValidate>
                        {/* Mijoz nomi */}
                        <div className="input-group add" style={{ width: '100%' }}>
                            <label>Mijoz nomi</label>
                            <div className="input-row">
                                <input
                                    readOnly
                                    type="text"
                                    name="tovuq-kontragent-display"
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
                                <button type="button" onClick={() => setopenMijozadd(true)} className="btn-add">
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
                                name="tovuq-phone-display"
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
                                name="tovuq-region-display"
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
                                        <label >Qarzdorlik</label>
                                        <div className="input-row">
                                            <div className="debt-box">
                                                <span className="debt-value-black">{formatNarx(FormData.dt_kt_sum)} <small>so'm</small></span>
                                                <span className="debt-value-green">{formatNarx(FormData.dt_kt_val)} <small>$</small></span>
                                            </div>
                                            <button type="button" className="btn-refresh">
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
                                                    <span className="checkbox-custom">
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
                                                    <span className="checkbox-custom">
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
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                BEKOR QILISH
                            </button>
                            <button type="button" onClick={handleSubmit} className="btn-submit">
                                DAVOM ETISH
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {openSelectMijoz &&
                <MijozSelect
                    setOpenSelectMijoz={setOpenSelectMijoz}
                    onClose={() => setOpenSelectMijoz(false)}
                    FormData={FormData}
                    setFormData={setFormData}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
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
                    KorzinkaModal={() => setActiveView("cart")} // ← SOTIB OLISH bosilsa
                    FormData={FormData}
                    qaytarish={false}
                />
            }
            {activeView === "cart" && (
                <CartModal
                    qaytarish={false}
                    onExit={onClose}
                    onClose={() => setActiveView('sotib')}
                    KorzinkaModal={() => setActiveView("sotib")} // ← SOTIB OLISH bosilsa
                />
            )}
        </>
    );
}
