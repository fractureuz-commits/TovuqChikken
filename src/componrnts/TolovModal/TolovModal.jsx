import { useEffect, useState } from "react";
import "./Tolov.css";
import MijozSelect from "../SelectMijoz/SelectMijoz";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import { format } from "date-fns";
import { loadKurs } from "../../utils/storage";
import { getUser } from "../../leyout/login/auth";

export default function TolovModal({ editData, onClose, removeSyncedTolovlar, setTolovlar }) {
    const user = getUser();
    const date = format(new Date(), "dd.MM.yyyy HH:mm:ss");
    const [kurs, setKurs] = useState(() => {
        const kursData = loadKurs();
        return parseFloat(kursData?.kurs || 1);
    });
    const [activeTab, setActiveTab] = useState("som");
    const [openSelectMijoz, setOpenSelectMijoz] = useState(false);
    const [kontragent, setKontragent] = useState([]);
    const [FormData, setFormData] = useState({
        kontragent: '',
        kontragent_id: '',
        dt_kt_sum: 0,
        dt_kt_val: 0,
        date: format(new Date(), "dd.MM.yyyy HH:mm:ss"),
        izox: '',
        // SO'M
        naqt_sum: 0,
        plastik_sum: 0,
        click_sum: 0,
        naqt_som_to_val: 0,
        naqt_som_to_val_result: 0,
        // VALYUTA
        naqt_val: 0,
        click_val: 0,
        plastik_val: 0,
        NaqdValSum: 0,
        ClickValSum: 0,
    });
    useEffect(() => {
        if (editData) {
            setFormData({
                kontragent: editData.mijoz_name || '',
                kontragent_id: editData.mijoz_code || '',
                dt_kt_sum: editData.dt_kt_sum,
                dt_kt_val: editData.dt_kt_val,
                date: editData.date || format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                izox: editData.izoh || '',
                // SO'M
                naqt_sum: editData.NaqdSum || 0,
                plastik_sum: editData.PlastikSum || 0,
                click_sum: editData.ClickSum || 0,
                naqt_som_to_val: editData.NaqdSumVal || 0,
                naqt_som_to_val_result: editData.HisobSum || 0,
                // VALYUTA
                naqt_val: editData.NaqdVal || 0,
                click_val: editData.ClickVal || 0,
                plastik_val: editData.PlastikVal || 0,
                NaqdValSum: editData.NaqdValSum || 0,
                ClickValSum: editData.ClickValSum || 0,
                PlastikValSum: editData.PlastikValSum || 0,
            });
        }
    }, [editData]);
    useEffect(() => {
        const naqt = clean(FormData.NaqdValSum) / kurs;
        const click = clean(FormData.ClickValSum) / kurs;
        const plastik = clean(FormData.PlastikValSum) / kurs;

        const total = naqt + click + plastik;

        setFormData(prev => ({
            ...prev,
            click_val: total.toFixed(2),
        }));
    }, [
        FormData.NaqdValSum,
        FormData.ClickValSum,
        FormData.PlastikValSum,
        kurs
    ]);
    useEffect(() => {
        const result = kurs > 0
            ? Number(FormData.naqt_som_to_val) * kurs
            : 0;

        setFormData(prev => ({
            ...prev,
            naqt_som_to_val_result: result
        }));
    }, [FormData.naqt_som_to_val, kurs]);
    const set = (key, value) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const clean = (v) =>
        parseFloat(String(v || "0").replace(/\s|,/g, "")) || 0;

    const fmt = (num) =>
        Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const jami_sum =
        clean(FormData.naqt_sum) +
        clean(FormData.plastik_sum) +
        clean(FormData.click_sum) +
        clean(FormData.naqt_som_to_val_result);

    const jami_val =
        clean(FormData.naqt_val) +
        clean(FormData.click_val) +
        clean(FormData.plastik_val); // 🔥 endi ishlaydi
    // const handleSubmit = async () => {
    //     if (!FormData.kontragent_id) {
    //         Swal.fire({
    //             icon: "warning",
    //             title: "Mijoz tanlanmagan!",
    //             confirmButtonColor: "#006CAC"
    //         });
    //         return;
    //     }

    //     try {
    //         const payload = {
    //             date: FormData.date,
    //             kurs: kurs,
    //             user_code: user.code,
    //             mijoz_code: FormData.kontragent_id,

    //             NaqdSum: clean(FormData.naqt_sum),
    //             PlastikSum: clean(FormData.plastik_sum),
    //             ClickSum: clean(FormData.click_sum),
    //             NaqdSumVal: clean(FormData.naqt_som_to_val),
    //             HisobSum: FormData.naqt_som_to_val_result,


    //             // somlik end

    //             PlastikValSum: clean(FormData.PlastikValSum),
    //             ClickValSum: clean(FormData.ClickValSum),
    //             NaqdValSum: clean(FormData.NaqdValSum),

    //             NaqdVal: clean(FormData.naqt_val),
    //             PlastikVal: clean(FormData.plastik_val),
    //             ClickVal: clean(FormData.click_val),
    //             HisobVal:
    //                 clean(FormData.naqt_val) +
    //                 clean(FormData.click_val) +
    //                 clean(FormData.plastik_val),

    //             izoh: FormData.izox,
    //         };

    //         await apiPost("tovuq/hs/tulov/get_tulov", payload);

    //         Swal.fire({
    //             icon: "success",
    //             title: "Yuborildi!",
    //             timer: 1500,
    //             showConfirmButton: false
    //         });

    //         onClose();

    //     } catch (err) {
    //         Swal.fire({
    //             icon: "error",
    //             title: "Xato!",
    //             text: err.message,
    //             confirmButtonColor: "#006CAC"
    //         });
    //     }
    // };

    const saveTolovlar = (data) => {
        localStorage.setItem("tolovlar", JSON.stringify(data));
        setTolovlar(data);
    };
    const handleSubmit = async () => {
        if (!FormData.kontragent_id) {
            Swal.fire({
                icon: "warning",
                title: "Mijoz tanlanmagan!",
                confirmButtonColor: "#006CAC"
            });
            return;
        }

        try {
            const payload = {
                id: editData ? editData.id : Date.now(),
                date: editData ? editData.date : FormData.date,
                created_at: editData ? editData.created_at : new Date().toISOString(),
                kurs: kurs,
                user_code: user.code,
                mijoz_code: FormData.kontragent_id,
                mijoz_name: FormData.kontragent || "",
                dt_kt_sum: FormData.dt_kt_sum,
                dt_kt_val: FormData.dt_kt_val,

                NaqdSum: clean(FormData.naqt_sum),
                PlastikSum: clean(FormData.plastik_sum),
                ClickSum: clean(FormData.click_sum),
                NaqdSumVal: clean(FormData.naqt_som_to_val),
                HisobSum: clean(FormData.naqt_som_to_val_result),

                PlastikValSum: clean(FormData.PlastikValSum),
                ClickValSum: clean(FormData.ClickValSum),
                NaqdValSum: clean(FormData.NaqdValSum),

                NaqdVal: clean(FormData.naqt_val),
                PlastikVal: clean(FormData.plastik_val),
                ClickVal: clean(FormData.click_val),
                HisobVal:
                    clean(FormData.naqt_val) +
                    clean(FormData.click_val) +
                    clean(FormData.plastik_val),

                izoh: FormData.izox,
            };

            const oldData = JSON.parse(localStorage.getItem("tolovlar") || "[]");

            const newData = editData
                ? oldData.map((p) => (p.id === editData.id ? payload : p))
                : [...oldData, payload];

            saveTolovlar(newData);

            // Swal.fire({
            //     icon: "success",
            //     title: editData ? "Tahrirlandi!" : "Muvofaqiyatli!",
            //     timer: 500,
            //     showConfirmButton: false
            // });

            onClose();

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#006CAC"
            });
        }
    };
    const formatNumber = (value) => {
        if (!value) return '0';
        return Number(value)
            .toLocaleString('ru-RU') // 1 000 000 format
            .replace(/,/g, ' ');
    };
    return (
        <>
            <div className="overlay">
                <div className="modal" style={{ width: '100%', height: '100vh', maxHeight: '95vh', borderRadius: '0px', display: "flex", flexDirection: "column" }} >
                    <div className="modal-title" style={{ justifyContent: 'center' }}>To'lov</div>
                    {/* Sana + Kurs */}
                    <div className="tolov-row">
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Sana:</label>
                            <input
                                type="text"
                                className="input tolov-blue-input"
                                style={{ textAlign: 'center' }}
                                value={FormData.date}
                                readOnly
                            // onChange={e => set("date", e.target.value)}
                            />
                        </div>
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Kurs:</label>
                            <input
                                type="text"
                                className="input tolov-blue-input"
                                style={{ textAlign: 'center', fontWeight: "bold", fontSize: '15px' }}
                                inputMode="decimal"
                                value={fmt(kurs)}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d.]/g, "");
                                    setKurs(raw === "" ? "" : raw);
                                }}
                            />
                        </div>
                    </div>

                    {/* Mijoz */}
                    <div className="input-group">
                        <label>Mijoz nomi:</label>
                        <input
                            readOnly
                            type="text"
                            className="input"

                            value={FormData.kontragent}
                            onClick={() => setOpenSelectMijoz(true)}
                            placeholder=""
                        />
                    </div>

                    {/* Dt-Kt */}
                    <div className="tolov-row">
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Dt-Kt (so'm):</label>
                            <input readOnly style={{ textAlign: 'center' }} type="text" className="input" value={formatNumber(FormData.dt_kt_sum)} />
                        </div>
                        <div className="input-group" style={{ width: '48%' }}>
                            <label>Dt-Kt ($):</label>
                            <input readOnly style={{ textAlign: 'center' }} type="text" className="input" value={formatNumber(FormData.dt_kt_val)} />
                        </div>

                    </div>

                    {/* Tabs */}
                    <div className="tolov-tabs">
                        <button
                            className={`tolov-tab ${activeTab === "som" ? "active" : ""}`}
                            onClick={() => setActiveTab("som")}
                        >
                            So'm
                        </button>
                        <button
                            className={`tolov-tab ${activeTab === "valyuta" ? "active" : ""}`}
                            onClick={() => setActiveTab("valyuta")}
                        >
                            $
                        </button>
                    </div>

                    {/* ═══ SO'M ═══ */}
                    {activeTab === "som" && (
                        <div className="tolov-section">
                            <div className="input-group">
                                <label>Naqd: </label>
                                <div className="currency">
                                    <input
                                        type="tel"
                                        inputMode="text"
                                        pattern="[0-9]*"
                                        className="input"
                                        style={{ textAlign: 'center' }}
                                        value={formatNumber(FormData.naqt_sum)}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                            set("naqt_sum", raw);
                                        }}
                                    />
                                    <span>so'm</span>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Plastik: </label>
                                <div className="currency">
                                    <input
                                        type="tel"
                                        inputMode="text"
                                        pattern="[0-9]*"
                                        className="input"
                                        style={{ textAlign: 'center' }}
                                        value={formatNumber(FormData.plastik_sum)}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                            set("plastik_sum", raw);
                                        }}
                                    />
                                    <span >so'm</span>

                                </div>


                            </div>

                            <div className="input-group">
                                <label>Click:</label>
                                <div className="currency">
                                    <input
                                        type="tel"
                                        inputMode="text"
                                        pattern="[0-9]*"
                                        className="input"
                                        style={{ textAlign: 'center' }}
                                        value={formatNumber(FormData.click_sum)}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                            set("click_sum", raw);
                                        }}
                                    />
                                    <span >so'm</span>

                                </div>


                            </div>

                            <div className="input-group">
                                <label>Naqd ( so'm → $ ):</label>
                                <div className="tolov-convert-row">
                                    <div className="currency"
                                        style={{ width: '40%' }}
                                    >
                                        <input
                                            type="tel"
                                            inputMode="text"
                                            pattern="[0-9]*"
                                            className="input"
                                            style={{ textAlign: 'center' }}
                                            value={formatNumber(FormData.naqt_som_to_val)}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                                set("naqt_som_to_val", raw);
                                            }}
                                        />
                                        <span >$</span>

                                    </div>



                                    <span className="tolov-eq">=</span>
                                    <div className="currency"
                                        style={{
                                            width: '60%',
                                        }}
                                    >
                                        <input
                                            type="tel"
                                            inputMode="text"
                                            pattern="[0-9]*"
                                            className="input"
                                            style={{ width: '30%', textAlign: 'center' }}
                                            value={formatNumber(FormData.naqt_som_to_val_result)}
                                            readOnly
                                        />
                                        <span >so'm</span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">

                                <label>Jami to'lov: </label>
                                <div className="currency">
                                    <input type="tel"
                                        style={{ textAlign: 'center' }}

                                        className="input tolov-jami" readOnly
                                        value={fmt(jami_sum)} />
                                    <span >so'm</span>

                                </div>


                            </div>
                        </div>
                    )}

                    {/* ═══ VALYUTA ═══ */}
                    {activeTab === "valyuta" && (
                        <div className="tolov-section">

                            {/* Naqt $ */}
                            <div className="input-group" style={{ width: '100%' }}>
                                <label>Naqd:</label>

                                <div className="tolov-suffix-row">
                                    <div className="currency" style={{ width: '100%' }}>
                                        <input
                                            type="tel"
                                            inputMode="text"
                                            pattern="[0-9]*"
                                            className="input"
                                            value={formatNumber(FormData.naqt_val)}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                                set("naqt_val", raw);
                                            }}
                                        />
                                        <span >$</span>

                                    </div>


                                </div>
                            </div>

                            {/* { belgisi bilan 3 ta field */}
                            <div className="math-section">
                                <div className="left">
                                    <div className="input-group" style={{ width: '100%' }}>
                                        <label>Naqd ( $ → So'm ):</label>
                                        <div className="tolov-suffix-row">
                                            <div className="currency" style={{ width: '100%' }}>
                                                <input
                                                    type="tel"
                                                    inputMode="text"
                                                    pattern="[0-9]*"
                                                    className="input"
                                                    value={formatNumber(FormData.NaqdValSum)}
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                                        set("NaqdValSum", raw);
                                                    }}
                                                />
                                                <span >so'm</span>

                                            </div>


                                        </div>
                                    </div>

                                    <div className="input-group" style={{ width: '100%' }}>
                                        <label>Click ( $ → So'm ):</label>
                                        <div className="tolov-suffix-row">
                                            <div className="currency" style={{ width: '100%' }}>
                                                <input
                                                    type="tel"
                                                    inputMode="text"
                                                    pattern="[0-9]*"
                                                    className="input"
                                                    value={formatNumber(FormData.ClickValSum)}
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                                        set("ClickValSum", raw);
                                                    }}
                                                />
                                                <span >so'm</span>

                                            </div>


                                        </div>
                                    </div>

                                    <div className="input-group" style={{ width: '100%' }}>
                                        <label>Plastik ( $ → So'm ):</label>
                                        <div className="tolov-suffix-row">
                                            <div className="currency" style={{ width: '100%' }}>
                                                <input
                                                    type="tel"
                                                    inputMode="text"
                                                    pattern="[0-9]*"
                                                    className="input"
                                                    value={formatNumber(FormData.PlastikValSum)}
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/\D/g, ''); // faqat raqam
                                                        set("PlastikValSum", raw);
                                                    }}
                                                />
                                                <span >so'm</span>

                                            </div>


                                        </div>
                                    </div>
                                </div>

                                {/* SVG { belgisi */}

                                <svg width="41" height="130" viewBox="0 0 41 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1C4.84564 1 8.53377 2.68571 11.253 5.68629C13.9723 8.68687 15.5 12.7565 15.5 17V41C15.5 47.3652 17.0277 53.4697 19.747 57.9706C22.4662 62.4714 26.1544 65 30 65C26.1544 65 22.4662 67.5286 19.747 72.0294C17.0277 76.5303 15.5 82.6348 15.5 89V113C15.5 117.243 13.9723 121.313 11.253 124.314C8.53377 127.314 4.84564 129 1 129" stroke="#006CAC" />
                                    <path d="M31.9167 63.6665H40.0834" stroke="#006CAC" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M31.9167 66.3335H40.0834" stroke="#006CAC" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>


                                {/* O'ng — $ kiritish */}
                                <div className="right">
                                    <div className="input-group" style={{ width: '100%' }}>
                                        <label style={{ visibility: 'hidden' }}>_</label>
                                        <div className="tolov-suffix-row">
                                            <div className="currency" style={{ width: '100%' }}>
                                                <input
                                                    type="tel"
                                                    inputMode="text"
                                                    pattern="[0-9]*"
                                                    className="input"
                                                    value={FormData.click_val}
                                                    readOnly
                                                />
                                                <span >$</span>

                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Jami */}
                            <div className="input-group">
                                <label>Jami to'lov:</label>
                                <div className="tolov-suffix-row">
                                    <div className="currency" style={{ width: '100%' }}>
                                        <input
                                            type="tel"
                                            className="input tolov-jami"
                                            readOnly
                                            style={{ textAlign: 'center' }}
                                            value={`${fmt(jami_val)}`}
                                        />
                                        <span >$</span>

                                    </div>


                                </div>
                            </div>
                        </div>
                    )}

                    {/* Izox */}
                    <div className="input-group" style={{ width: '100%' }}>
                        <label>Izox:</label>
                        <textarea
                            className="input tolov-textarea"
                            value={FormData.izox}
                            onChange={e => set("izox", e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="btn-row">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            BEKOR QILISH
                        </button>
                        <button type="button" className="btn-submit" onClick={handleSubmit}>
                            SAQLASH
                        </button>
                    </div>
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
                />
            }
        </>
    );
}