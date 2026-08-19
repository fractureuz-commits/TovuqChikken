import { useState } from "react";
import "../../componrnts/BuyurtmaModal/buyurtma.css";
import MijozSelect from "../../componrnts/SelectMijoz/SelectMijoz";
import Swal from "sweetalert2";
import QrModal from "../../componrnts/QrModal/qrModal";
import MijozaddModal from "../../componrnts/BuyurtmaModal/MijozAdd";
import KorzinkaModal from "../sotuv/MahsulotGuruhlari";
import CartModal from "../sotuv/Savat";
import ModalHeader from "../../componrnts/BuyurtmaModal/ModalHeader";
import { formatNarx } from "../../utils/narx";
import { getUser } from "../../leyout/login/auth";
import { canEditPriceType, canViewDebt, canViewPrice, getAllowedPriceTypes, getDefaultPriceType } from "../../utils/permissions";
import { useBackHandler } from "../../utils/backButtonStack";
import MahsulotYaratishModal from "./MahsulotYaratishModal";
import InvoysSelect from "../../componrnts/InvoysSelect/InvoysSelect";
import "./mahsulotKirimi.css";
export default function MahsulotKirimi({ onClose }) {
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
    const [openMahsulotYaratish, setOpenMahsulotYaratish] = useState(false);
    const [kontragent, setKontragent] = useState([]);
    const [activeView, setActiveView] = useState("sotib"); // "sotib" | "cart"
    const [showFullForm, setShowFullForm] = useState(false);
    const [FormData, setFormData] = useState(() => {
        const savedForm = JSON.parse(localStorage.getItem("mahsulot_kirimi_form") || "null");
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
    const [pendingMijoz, setPendingMijoz] = useState(null);
    const [openInvoysSelect, setOpenInvoysSelect] = useState(false);
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
                title: "Ta'minotchi tanlanmagan!",
                text: "Iltimos, ta'minotchini tanlang",
                confirmButtonColor: "#d97706",
            });
            return;
        }
        localStorage.setItem("mahsulot_kirimi_form", JSON.stringify(FormData));
        localStorage.setItem("formData", JSON.stringify(FormData));
        setKorzinka(true);
    };

    const handleMijozSelect = (selectedMijoz) => {
        setPendingMijoz(selectedMijoz);
        setOpenInvoysSelect(true);
    };

    const handleInvoysSelect = (invoys) => {
        setFormData(prev => ({
            ...prev,
            kontragent: pendingMijoz.name,
            kontragent_id: pendingMijoz.code,
            tel_1: pendingMijoz.tel_1 || "",
            hudud: pendingMijoz.hudud_name || "",
            dt_kt_sum: pendingMijoz.dt_kt_sum || 0,
            dt_kt_val: pendingMijoz.dt_kt_val || 0,
            invoys_code: invoys.code,
            invoys_number: invoys.invoys_number,
            invoys_name: invoys.name,
            invoys_date: invoys.data,
        }));
        setOpenInvoysSelect(false);
        setPendingMijoz(null);
        setShowFullForm(true);
    };

    const handleInvoysClose = () => {
        setOpenInvoysSelect(false);
        setPendingMijoz(null);
        // Invoys tanlanmasdan yopilsa, hali tasdiqlanmagan ta'minotchi ham tanlanmagan hisoblanadi
        if (!showFullForm) {
            setFormData(prev => ({
                ...prev,
                kontragent: '',
                kontragent_id: '',
                tel_1: '',
                hudud: '',
                dt_kt_sum: 0,
                dt_kt_val: 0,
            }));
        }
    };

    const handleKontragentUpdate = (updated) => {
        setKontragent([...updated]);
    };

    const openInvoysForCurrentMijoz = () => {
        setPendingMijoz({
            name: FormData.kontragent,
            code: FormData.kontragent_id,
            tel_1: FormData.tel_1,
            hudud_name: FormData.hudud,
            dt_kt_sum: FormData.dt_kt_sum,
            dt_kt_val: FormData.dt_kt_val,
        });
        setOpenInvoysSelect(true);
    };

    return (
        <>
            <div className="overlay kirim-modal" style={{ flexDirection: 'column' }}>
                <div className="app-safe">
                    <div className="modal " style={{ marginTop: '0' }}>
                        <div className="modal-title" style={{ justifyContent: 'center' }}>Mahsulot kirimi</div>

                        <form autoComplete="off" noValidate>
                            {/* Mijoz nomi */}
                            <div className="input-group add" style={{ width: '100%' }}>
                                <label>Ta'minotchi nomi</label>
                                <div className="input-row">
                                    <input
                                        readOnly
                                        type="text"
                                        name="kirim-kontragent-display"
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
                                    <button type="button" onClick={() => setopenMijozadd(true)} className="btn-add kirim-btn-add">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Invoys */}
                            <div className="input-group add" style={{ width: '100%' }}>
                                <label>Invoys</label>
                                <div className="input-row">
                                    <input
                                        readOnly
                                        type="text"
                                        name="kirim-invoys-display"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        inputMode="none"
                                        tabIndex={-1}
                                        onFocus={blurReadonlyInputOnWeb}
                                        onClick={openInvoysForCurrentMijoz}
                                        value={FormData.invoys_name || ""}
                                        className="input"
                                        placeholder=""
                                    />
                                </div>
                            </div>

                            {/* <div className="input-group" style={{ width: '100%' }}>
                                <label>Hudud nomi</label>
                                <input
                                    readOnly
                                    type="text"
                                    name="kirim-region-display"
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
                            </div> */}

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
                                                <button type="button" className="btn-refresh kirim-btn-refresh">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* So'm / valyuta */}
                                    {/* {(canSeePrice && canChangePriceType) && (
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
                                                        <span className="checkbox-custom kirim-checkbox-custom">
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
                                                        <span className="checkbox-custom kirim-checkbox-custom">
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
                                    )} */}
                                </>
                            )}

                            {/* Buttons */}
                            <div className="btn-row" style={{ width: '100%' }}>
                                <button type="button" className="btn-cancel kirim-btn-cancel" onClick={onClose}>
                                    BEKOR QILISH
                                </button>
                                <button type="button" onClick={handleSubmit} className="btn-submit kirim-btn-submit">
                                    DAVOM ETISH
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {openSelectMijoz &&
                <MijozSelect
                    TD={false}
                    kirim={true}
                    title="Ta'minotchilar ro'yxati"
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
                    kirim={true}
                    setopenMijozadd={setopenMijozadd}
                    onClose={() => setopenMijozadd(false)}
                    onKontragentUpdate={handleKontragentUpdate}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
                    onCreated={handleMijozSelect}
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
                    kirim={true}
                />
            }
            {activeView === "cart" && (
                <CartModal
                    qaytarish={false}
                    kirim={true}
                    onExit={onClose}
                    onClose={() => setActiveView('sotib')}
                    KorzinkaModal={() => setActiveView("sotib")}
                />
            )}
            {openMahsulotYaratish && (
                <MahsulotYaratishModal
                    onClose={() => setOpenMahsulotYaratish(false)}
                />
            )}
            {openInvoysSelect && pendingMijoz && (
                <InvoysSelect
                    kontragentCode={pendingMijoz.code}
                    kontragentName={pendingMijoz.name}
                    onClose={handleInvoysClose}
                    onSelect={handleInvoysSelect}
                />
            )}
        </>
    );
}
