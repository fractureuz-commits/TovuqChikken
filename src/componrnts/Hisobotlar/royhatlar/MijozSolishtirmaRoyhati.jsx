import { format, parseISO } from "date-fns";
import { useState } from "react";
import { getUser } from "../../../leyout/login/auth";
import RegionSelect from "../../SelectMijoz/RegionSelect";
import MijozSelect from "../../SelectMijoz/SelectMijoz";
import MahsulotGroupSelect from "../../SelectMijoz/MahsulotGroupSelect";
import TovarSelect from "../../SelectMijoz/TovarSelect";
import Swal from "sweetalert2";
import { apiPost } from "../../../utils/api";
import HtmlViewer from "../../htmlviewer/htmlviewer";
export default function MijozSolishtirmaRoyhatiModal({ onClose }) {
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
    const [MijozSolishtirmaFormData, setMijozSolishtirmaFormData] = useState({
        repost: 2,
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
    const [useMyHudud, setUseMyHudud] = useState(true);
    const handleToggleMyHudud = (checked) => {
        setUseMyHudud(checked);

        setMijozSolishtirmaFormData(prev => ({
            ...prev,
            User_code: checked ? (user?.code || "") : "",
        }));
    };
    const handleSubmit = async () => {
        if (!MijozSolishtirmaFormData.Mijoz_code) {
            Swal.fire({
                icon: "warning",
                title: "Mijoz tanlanmagan!",
                text: "Iltimos, mijozni tanlang",
                confirmButtonColor: "#006CAC",
            });
            return;
        }
        try {
            const newData = {
                ...MijozSolishtirmaFormData,
                date_1: format(parseISO(MijozSolishtirmaFormData.date_1), "dd.MM.yyyy"),
                date_2: format(parseISO(MijozSolishtirmaFormData.date_2), "dd.MM.yyyy"),
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
                        Hisobotlar (MijozSolishtirma ro'yhati)
                    </div>
                    <div className="tolov-row">
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Data 1:</label>
                            <input
                                type="date"
                                className="input tolov-blue-input"
                                style={{ textAlign: "center" }}
                                value={MijozSolishtirmaFormData.date_1}
                                onChange={(e) =>
                                    setMijozSolishtirmaFormData((prev) => ({
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
                                value={MijozSolishtirmaFormData.date_2}
                                onChange={(e) =>
                                    setMijozSolishtirmaFormData((prev) => ({
                                        ...prev,
                                        date_2: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label">Mijoz nomi:</label>
                        <div className="select-input-wrapper" onClick={() => {
                            setOpenSelectMijoz(true)
                        }
                        }>
                            <input
                                readOnly
                                type="text"
                                value={MijozSolishtirmaFormData.kontragent}
                                className="select-input-field"
                                placeholder="Mijozni tanlang"
                            />

                            <button
                                type="button"
                                className="select-clear-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (MijozSolishtirmaFormData.kontragent) {
                                        setMijozSolishtirmaFormData(prev => ({
                                            ...prev,
                                            kontragent: "",
                                            Mijoz_code: "",
                                        }));
                                    } else {
                                        setOpenSelectMijoz(true);
                                    }
                                }}
                            >
                                {MijozSolishtirmaFormData.kontragent ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon icon-tabler icon-tabler-x"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18 6l-12 12" />
                                        <path d="M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="icon icon-tabler icon-tabler-chevron-down"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18.707 8.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1 -1.414 0l-6 -6a1 1 0 0 1 1.414 -1.414l5.293 5.293l5.293 -5.293a1 1 0 0 1 1.414 0" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>


                    <div className="form-group full-width">
                        <label className="form-label">Foydalanuvchi:</label>
                        <div className="input-group">
                            <div className="select-input-wrapper">
                                <input
                                    readOnly
                                    type="text"
                                    value={user?.name}
                                    className="select-input-field"
                                    style={!useMyHudud ? { color: '#535353c2' } : {}} />
                                <button
                                    type="button"
                                    className="select-clear-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleMyHudud(!useMyHudud);
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={useMyHudud}
                                        onChange={(e) => handleToggleMyHudud(e.target.checked)}
                                        style={{ pointerEvents: "none" }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="btn-row" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-cancel" onClick={onClose} >
                            BEKOR QILISH
                        </button>
                        <button type="button" className="btn-submit" onClick={() => handleSubmit()}>
                            Ok
                        </button>
                    </div>
                </div>
            </div>
            {openSelectRegion &&
                <RegionSelect
                    setOpenSelectRegion={setOpenSelectRegion}
                    onClose={() => setOpenSelectRegion(false)}
                    FormData={MijozSolishtirmaFormData}
                    setFormData={setMijozSolishtirmaFormData}
                    Region={Region}
                    setRegion={setRegion}
                />}
            {openSelectMahsulotGroup &&
                <MahsulotGroupSelect
                    setOpenSelectMahsulotGroup={setopenSelectMahsulotGroup}
                    onClose={() => setopenSelectMahsulotGroup(false)}
                    FormData={MijozSolishtirmaFormData}
                    setFormData={setMijozSolishtirmaFormData}
                    MahsulotGroup={MahsulotGroup}
                    setMahsulotGroup={setMahsulotGroup}
                />}
            {openSelectMijoz &&
                <MijozSelect
                    setOpenSelectMijoz={setOpenSelectMijoz}
                    onClose={() => setOpenSelectMijoz(false)}
                    FormData={MijozSolishtirmaFormData}
                    setFormData={setMijozSolishtirmaFormData}
                    kontragent={kontragent}
                    setKontragent={setKontragent}
                    TD={false}
                />}
            {openSelectTovar &&
                <TovarSelect
                    setOpenSelectTovar={setOpenSelectTovar}
                    onClose={() => setOpenSelectTovar(false)}
                    FormData={MijozSolishtirmaFormData}
                    setFormData={setMijozSolishtirmaFormData}
                    Tovar={Tovar}
                    setTovar={setTovar}
                />}
            {HTMLdataModal &&
                <>
                    <HtmlViewer
                        title={`Hisobotlar (Solishtirma dalolatnoma)`}
                        HTMLdata={HTMLdata}
                        setHTMLdataModal={setHTMLdataModal}
                    />
                </>

            }
        </>
    );
}