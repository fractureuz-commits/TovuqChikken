import { format, parseISO } from "date-fns";
import { useState } from "react";
import { getUser } from "../../../leyout/login/auth";
import RegionSelect from "../../SelectMijoz/RegionSelect";
import MijozSelect from "../../SelectMijoz/SelectMijoz";
import MahsulotGroupSelect from "../../SelectMijoz/MahsulotGroupSelect";
import TovarSelect from "../../SelectMijoz/TovarSelect";
import "../savdoRoyhati.css";
import Swal from "sweetalert2";
import { apiPost } from "../../../utils/api";
import HtmlViewer from "../../htmlviewer/htmlviewer";
import { useBackHandler } from "../../../utils/backButtonStack";
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
    useBackHandler(onClose);

    const [SavdoFormData, setSavdoFormData] = useState({
        repost: 1,
        date_1: format(new Date(), "yyyy-MM-dd"),
        date_2: format(new Date(), "yyyy-MM-dd"),
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
                date_1: format(parseISO(SavdoFormData.date_1), "dd.MM.yyyy"),
                date_2: format(parseISO(SavdoFormData.date_2), "dd.MM.yyyy"),
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
                                type="date"
                                className="input tolov-blue-input"
                                style={{ textAlign: "center" }}
                                value={SavdoFormData.date_1}
                                onChange={(e) =>
                                    setSavdoFormData((prev) => ({
                                        ...prev,
                                        date_1: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Data 2:</label>
                            <input
                                type="date"
                                className="input tolov-blue-input"
                                style={{ textAlign: "center" }}
                                value={SavdoFormData.date_2}
                                onChange={(e) =>
                                    setSavdoFormData((prev) => ({
                                        ...prev,
                                        date_2: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label">Mijoz nomi:</label>
                        <div
                            className="select-input-wrapper"
                            onClick={() => {
                                if (SavdoFormData.Hudud_name === "") {
                                    setOpenSelectMijoz(true);
                                }
                            }}
                        >
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.kontragent}
                                className={`select-input-field ${SavdoFormData.Hudud_name ? "input-disabled-look" : ""}`}
                                placeholder="Mijozni tanlang"
                            />

                            <button
                                type="button"
                                className="select-clear-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (SavdoFormData.kontragent) {
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            kontragent: "",
                                            Mijoz_code: "",
                                        }));
                                    } else if (SavdoFormData.Hudud_name === "") {
                                        setOpenSelectMijoz(true);
                                    }
                                }}
                            >
                                {SavdoFormData.kontragent ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18 6l-12 12" />
                                        <path d="M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18.707 8.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1 -1.414 0l-6 -6a1 1 0 0 1 1.414 -1.414l5.293 5.293l5.293 -5.293a1 1 0 0 1 1.414 0" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>


                    <div className="form-group full-width">
                        <label className="form-label">Hudud:</label>
                        <div
                            className="select-input-wrapper"
                            onClick={() => {
                                if (SavdoFormData.kontragent === "") {
                                    setOpenSelectRegion(true);
                                }
                            }}
                        >
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.Hudud_name}
                                className={`select-input-field ${SavdoFormData.kontragent ? "input-disabled-look" : ""}`}
                                placeholder="Hududni tanlang"
                            />

                            <button
                                type="button"
                                className="select-clear-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (SavdoFormData.Hudud_name) {
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            Hudud_name: "",
                                            Hudud_code: "",
                                        }));
                                    } else if (SavdoFormData.kontragent === "") {
                                        setOpenSelectRegion(true);
                                    }
                                }}
                            >
                                {SavdoFormData.Hudud_name ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18 6l-12 12" />
                                        <path d="M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18.707 8.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1 -1.414 0l-6 -6a1 1 0 0 1 1.414 -1.414l5.293 5.293l5.293 -5.293a1 1 0 0 1 1.414 0" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Mahsulot guruhi:</label>
                        <div
                            className="select-input-wrapper"
                            onClick={() => setopenSelectMahsulotGroup(true)}
                        >
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.GroupTovar_name}
                                className="select-input-field"
                                placeholder="Mahsulot guruhini tanlang"
                            />

                            <button
                                type="button"
                                className="select-clear-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (SavdoFormData.GroupTovar_name) {
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            GroupTovar_name: "",
                                            GroupTovar_code: "",
                                            Tovar_name: "",
                                            Tovar_code: "",
                                        }));
                                    } else {
                                        setopenSelectMahsulotGroup(true);
                                    }
                                }}
                            >
                                {SavdoFormData.GroupTovar_name ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18 6l-12 12" />
                                        <path d="M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18.707 8.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1 -1.414 0l-6 -6a1 1 0 0 1 1.414 -1.414l5.293 5.293l5.293 -5.293a1 1 0 0 1 1.414 0" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Mahsulot:</label>
                        <div
                            className="select-input-wrapper"
                            onClick={() => setOpenSelectTovar(true)}
                        >
                            <input
                                readOnly
                                type="text"
                                value={SavdoFormData.Tovar_name}
                                className="select-input-field"
                                placeholder="Mahsulotni tanlang"
                            />

                            <button
                                type="button"
                                className="select-clear-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (SavdoFormData.Tovar_name) {
                                        setSavdoFormData(prev => ({
                                            ...prev,
                                            Tovar_name: "",
                                            Tovar_code: "",
                                        }));
                                    } else {
                                        setOpenSelectTovar(true);
                                    }
                                }}
                            >
                                {SavdoFormData.Tovar_name ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18 6l-12 12" />
                                        <path d="M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18.707 8.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1 -1.414 0l-6 -6a1 1 0 0 1 1.414 -1.414l5.293 5.293l5.293 -5.293a1 1 0 0 1 1.414 0" />
                                    </svg>
                                )}
                            </button>
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
                        title={`Hisobotlar (Savdo ro'yhati)`}
                        HTMLdata={HTMLdata}
                        setHTMLdataModal={setHTMLdataModal}
                    />
                </>

            }
        </>
    );
}
