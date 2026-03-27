import { format, parseISO } from "date-fns";
import { useState } from "react";
import { getUser } from "../../leyout/login/auth";
import RegionSelect from "../SelectMijoz/RegionSelect";
import MijozSelect from "../SelectMijoz/SelectMijoz";
import MahsulotGroupSelect from "../SelectMijoz/MahsulotGroupSelect";
import TovarSelect from "../SelectMijoz/TovarSelect";
import "./savdoRoyhati.css";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import HtmlViewer from "../htmlviewer/htmlviewer";

const OPTIONS = [
    { id: 1, label: "Savdo ro'yhati", sub: null },
    { id: 2, label: "Mijoz", sub: "Solishtirma\ndalolatnoma" },
    { id: 3, label: "Mijoz qarzdorligi", sub: null },
    { id: 4, label: "Mahsulot qoldigi", sub: null },
];

export default function SavdoRoyhatiModal({ onClose }) {
    const [selected, setSelected] = useState(1);
    const [kontragent, setKontragent] = useState([]);
    const [HTMLdata, setHTMLdata] = useState();
    const [HTMLdataModal, setHTMLdataModal] = useState(false);
    const [Tovar, setTovar] = useState([]);
    const [openSelectRegion, setOpenSelectRegion] = useState(false);
    const [Region, setRegion] = useState([]);
    const [MahsulotGroup, setMahsulotGroup] = useState([]);
    const [openSelectMijoz, setOpenSelectMijoz] = useState(false);
    const [openSelectTovar, setOpenSelectTovar] = useState(false);
    const [openSelectMahsulotGroup, setopenSelectMahsulotGroup] = useState(false);
    const user = getUser();
    const [SavdoFormData, setSavdoFormData] = useState({
        repost: 1,
        date_1: format(new Date(), "dd.MM.yyyy"),
        date_2: format(new Date(), "dd.MM.yyyy"),
        Mijoz_code: '',
        Hudud_code: '',
        Hudud_name: '',
        User_code: user.code,
        GroupTovar_code: '',
        GroupTovar_name: '',
        Tovar_code: '',
        Tovar_name: '',
        Ras: '',
    });

    const handleSubmit = async (rasValue) => {
        try {
            const newData = {
                ...SavdoFormData,
                Ras: rasValue,
            };

            const result = await apiPost("tovuq/hs/repost/get_repost/", newData);

            if (result.success) {
                setHTMLdata(result.text_repost)
                setHTMLdataModal(true)
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: "1C dan xato javob keldi.",
                    confirmButtonColor: "#1a2b4a",
                });
            }

        } catch (err) {
            console.error("❌ Xato:", err.message);
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#1a2b4a",
            });
        }
    };
    const handleDateChange = (field, value) => {
        let cleaned = value.replace(/\D/g, "").slice(0, 8); // faqat raqam, max 8 ta

        let formatted = "";

        if (cleaned.length >= 1) {
            formatted += cleaned.slice(0, 2);
        }
        if (cleaned.length >= 3) {
            formatted += "." + cleaned.slice(2, 4);
        }
        if (cleaned.length >= 5) {
            formatted += "." + cleaned.slice(4, 8);
        }

        setSavdoFormData(prev => ({
            ...prev,
            [field]: formatted
        }));
    };
    return (
        <>
            <div className="overlay">
                <div className="modal">
                    <div className="modal-title" style={{ justifyContent: 'start' }}>
                        Hisobotlar (Savdo ro'yhati)
                    </div>
                    <div className="tolov-row">
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Data 1:</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="dd.MM.yyyy"
                                className="input tolov-blue-input"
                                style={{ textAlign: 'center' }}
                                value={SavdoFormData.date_1}
                                onChange={(e) => handleDateChange("date_1", e.target.value)}
                            />
                        </div>
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Data 2:</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="dd.MM.yyyy"
                                className="input tolov-blue-input"
                                style={{ textAlign: 'center' }}
                                value={SavdoFormData.date_2}
                                onChange={(e) => handleDateChange("date_2", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label">Mijoz nomi</label>
                        <div className="select-input-wrapper" onClick={() => {
                            if (SavdoFormData.Hudud_name === '') {
                                setOpenSelectMijoz(true)
                            } else {
                                return
                            }
                        }
                        }>
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.kontragent}
                                className="select-input-field"
                                placeholder="Mijozni tanlang"
                            />

                            {SavdoFormData.kontragent && (
                                <button
                                    type="button"
                                    className="select-clear-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            kontragent: "",
                                            Mijoz_code: "",
                                        }));
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>


                    <div className="form-group full-width">
                        <label className="form-label">Hudud</label>
                        <div className="select-input-wrapper" onClick={() => {
                            if (SavdoFormData.kontragent === '') {
                                setOpenSelectRegion(true)
                            } else {
                                return
                            }
                        }}>
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.Hudud_name}
                                className="select-input-field"
                                placeholder="Hududni tanlang"
                            />

                            {SavdoFormData.Hudud_name && (
                                <button
                                    type="button"
                                    className="select-clear-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            Hudud_name: "",
                                            Hudud_code: "",
                                        }));
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Mahsulot guruhi</label>
                        <div className="select-input-wrapper" onClick={() => setopenSelectMahsulotGroup(true)}>
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.GroupTovar_name}
                                className="select-input-field"
                                placeholder="Mahsulot guruhini tanlang"
                            />

                            {SavdoFormData.GroupTovar_name && (
                                <button
                                    type="button"
                                    className="select-clear-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            GroupTovar_name: "",
                                            GroupTovar_code: "",
                                            Tovar_name: "",
                                            Tovar_code: "",
                                        }));
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Mahsulot</label>
                        <div className="select-input-wrapper" onClick={() => setOpenSelectTovar(true)}>
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.Tovar_name}
                                className="select-input-field"
                                placeholder="Mahsulotni tanlang"
                            />

                            {SavdoFormData.Tovar_name && (
                                <button
                                    type="button"
                                    className="select-clear-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            Tovar_name: "",
                                            Tovar_code: "",
                                        }));
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="btn-row" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-cancel" onClick={onClose} >
                            BEKOR QILISH
                        </button>
                        <button type="button" className="btn-submit" onClick={() => handleSubmit('0')}>
                            Umumiy
                        </button>
                        <button type="button" className="btn-submit" onClick={() => handleSubmit('1')}>
                            Batafsil
                        </button>
                    </div>
                </div>
            </div>
            {openSelectRegion &&
                <RegionSelect
                    setOpenSelectRegion={setOpenSelectRegion}
                    onClose={() => setOpenSelectRegion(false)}
                    FormData={SavdoFormData}
                    setFormData={setSavdoFormData}
                    Region={Region}
                    setRegion={setRegion}
                />}
            {openSelectMahsulotGroup &&
                <MahsulotGroupSelect
                    setOpenSelectMahsulotGroup={setopenSelectMahsulotGroup}
                    onClose={() => setopenSelectMahsulotGroup(false)}
                    FormData={SavdoFormData}
                    setFormData={setSavdoFormData}
                    MahsulotGroup={MahsulotGroup}
                    setMahsulotGroup={setMahsulotGroup}
                />}
            {openSelectMijoz &&
                <MijozSelect
                    setOpenSelectMijoz={setOpenSelectMijoz}
                    onClose={() => setOpenSelectMijoz(false)}
                    FormData={SavdoFormData}
                    setFormData={setSavdoFormData}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
                    TD={false}
                />}
            {openSelectTovar &&
                <TovarSelect
                    setOpenSelectTovar={setOpenSelectTovar}
                    onClose={() => setOpenSelectTovar(false)}
                    FormData={SavdoFormData}
                    setFormData={setSavdoFormData}
                    Tovar={Tovar}
                    setTovar={setTovar}
                />}
            {HTMLdataModal &&
                <>
                    <HtmlViewer
                        HTMLdata={HTMLdata}
                        setHTMLdataModal={setHTMLdataModal}
                        />
                </>

            }
        </>
    );
}