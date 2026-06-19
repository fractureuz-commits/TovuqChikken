import { useEffect, useState } from "react";
import HarajatSelect from "../SelectMijoz/SelectHarajat";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { loadKurs } from "../../utils/storage";
import { getUser } from "../../leyout/login/auth";
import "./harajat.css";
import HarajataddModal from "./HarajatAdd";

export default function HarajatModal({
    editData,
    onClose,
    setHarajatlar
}) {
    const user = getUser();

    const [kurs, setKurs] = useState(() => {
        const kursData = loadKurs();
        return parseFloat(kursData?.kurs || 1);
    });

    const [openSelectHarajat, setOpenSelectHarajat] = useState(false);
    const [HarajatAdd, setHarajatAdd] = useState(false);
    const [Harajat, setHarajat] = useState([]);

    const [FormData, setFormData] = useState({
        date: format(new Date(), "dd.MM.yyyy HH:mm:ss"),
        user_code: user?.code || "",
        operatsiya_code: "",
        operatsiya_name: "",
        izoh: "",

        // so'm
        naqd_sum: 0,
        plastik_sum: 0,
        clic_sum: 0,
        perech_sum: 0,
        perech_val: 0,

        // $
        naqd_val: 0
    });

    // editData bo‘lsa formni to‘ldirish
    useEffect(() => {
        if (editData && typeof editData === "object") {
            setFormData({
                date: editData.date || format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                user_code: editData.user_code || user?.code || "",
                operatsiya_code: editData.operatsiya_code || "",
                operatsiya_name: editData.operatsiya_name || "",
                izoh: editData.izoh || "",
                naqd_sum: editData.naqd_sum || 0,
                plastik_sum: editData.plastik_sum || 0,
                clic_sum: editData.clic_sum || 0,
                naqd_val: editData.naqd_val || 0,
                perech_sum: editData.perech_sum || 0,
                perech_val: editData.perech_val || 0,
            });
        }
    }, [editData, user?.code]);

    const set = (key, value) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    const clean = (v) =>
        parseFloat(String(v || "0").replace(/\s|,/g, "")) || 0;

    const fmt = (num) =>
        Math.round(Number(num || 0))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const formatNumber = (value) => {
        if (!value) return "0";
        return Number(value).toLocaleString("ru-RU").replace(/,/g, " ");
    };
    // jami so'm
    const jami_som =
        clean(FormData.naqd_sum) +
        clean(FormData.plastik_sum) +
        clean(FormData.clic_sum) +
        clean(FormData.perech_sum)
    const jami_dollar =
        clean(FormData.perech_val) +
        clean(FormData.naqd_val);
    const saveHarajatlar = (data) => {
        localStorage.setItem("harajatlar", JSON.stringify(data));
        setHarajatlar(data);
    };

    const handleSubmit = async () => {
        if (!FormData.operatsiya_code) {
            Swal.fire({
                icon: "warning",
                title: "Harajat tanlanmagan!",
                confirmButtonColor: "#006CAC"
            });
            return;
        }

        try {
            const oldData = JSON.parse(localStorage.getItem("harajatlar") || "[]");

            const newData = {
                id: editData?.id || Date.now(),  // ✅ edit bo'lsa eski id, yangi bo'lsa timestamp
                ...FormData,
                naqd_sum: clean(FormData.naqd_sum),
                plastik_sum: clean(FormData.plastik_sum),
                clic_sum: clean(FormData.clic_sum),
                naqd_val: clean(FormData.naqd_val),
                perech_sum: clean(FormData.perech_sum),
                perech_val: clean(FormData.perech_val),
                jami_sum: jami_som,
                jami_val: jami_dollar,
                kurs: clean(kurs)
            };

            let updatedData = [];

            if (editData?.id) {
                // ✅ EDIT: id mavjud bo'lsa yangilash
                updatedData = oldData.map((item) =>
                    item.id === editData.id ? newData : item
                );
            } else {
                // ✅ ADD: id yo'q bo'lsa yangi qo'shish
                updatedData = [...oldData, newData];
            }

            saveHarajatlar(updatedData);

            Swal.fire({
                icon: "success",
                title: editData?.id ? "Tahrirlandi!" : "Muvofaqiyatli!",
                timer: 800,
                showConfirmButton: false
            });

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
    const handleHarajatUpdate = (updated) => {
        setHarajat([...updated]);
    };
    return (
        <>
            <div className="overlay">
                <div className="modal" style={{ maxHeight: "95vh", flexDirection: "column" }}>
                    <div className="modal-title" style={{ justifyContent: "center" }}>
                        Harajat
                    </div>

                    {/* Sana + Kurs */}
                    <div className="tolov-row">
                        <div className="input-group" style={{ width: "48%" }}>
                            <label>Sana:</label>
                            <input
                                type="text"
                                className="input tolov-blue-input"
                                style={{ textAlign: "center" }}
                                value={FormData.date}
                                readOnly
                            />
                        </div>

                        <div className="input-group" style={{ width: "48%" }}>
                            <label>Kurs:</label>
                            <input
                                type="text"
                                className="input tolov-blue-input"
                                style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px" }}
                                inputMode="decimal"
                                value={fmt(kurs)}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d.]/g, "");
                                    setKurs(raw === "" ? "" : raw);
                                }}
                            />
                        </div>
                    </div>

                    {/* Harajat turi */}
                    <div className="form-group full-width">
                        <label className="form-label">Harajat turi:</label>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '10px'
                            }}
                        >
                            <div className="select-input-wrapper" onClick={() => {
                                setOpenSelectHarajat(true)
                            }
                            }>
                                <input
                                    readOnly
                                    type="text"
                                    value={FormData.operatsiya_name}
                                    className="select-input-field"
                                    placeholder="Mijozni tanlang"
                                />
                                <button
                                    type="button"
                                    className="select-clear-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        if (FormData.operatsiya_name) {
                                            setFormData(prev => ({
                                                ...prev,
                                                operatsiya_name: "",
                                                operatsiya_code: "",
                                            }));
                                        } else {
                                            setOpenSelectHarajat(true);
                                        }
                                    }}
                                >
                                    {FormData.operatsiya_name ? (
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
                            <button type="button" onClick={() => setHarajatAdd(true)} className="btn-add">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                            </button>

                        </div>
                    </div>
                    {/* <div className="input-group add" style={{ width: '100%' }}>
                        <label>Harajat turi:</label>
                        <div className="input-row">
                            <input
                                readOnly
                                type="text"
                                className="input"
                                value={FormData.operatsiya_name}
                                onClick={() => setOpenSelectHarajat(true)}
                                placeholder=""
                            />
                            
                        </div>
                    </div> */}
                    <div className="tolov-section harajat-section">
                        <div className="input-group">
                            <label>Naqd:</label>
                            <div className="currency">
                                <input
                                    type="tel"
                                    className="input"
                                    style={{ textAlign: "center" }}
                                    value={formatNumber(FormData.naqd_sum)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        set("naqd_sum", raw);
                                    }}
                                />
                                <span>so'm</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Plastik:</label>
                            <div className="currency">
                                <input
                                    type="tel"
                                    className="input"
                                    style={{ textAlign: "center" }}
                                    value={formatNumber(FormData.plastik_sum)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        set("plastik_sum", raw);
                                    }}
                                />
                                <span>so'm</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Click:</label>
                            <div className="currency">
                                <input
                                    type="tel"
                                    className="input"
                                    style={{ textAlign: "center" }}
                                    value={formatNumber(FormData.clic_sum)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        set("clic_sum", raw);
                                    }}
                                />
                                <span>so'm</span>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Naqd:</label>
                            <div className="currency">
                                <input
                                    type="tel"
                                    className="input"
                                    style={{ textAlign: "center" }}
                                    value={formatNumber(FormData.naqd_val)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        set("naqd_val", raw);
                                    }}
                                />
                                <span>$</span>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Bank:</label>
                            <div className="currency">
                                <input
                                    type="tel"
                                    className="input"
                                    style={{ textAlign: "center" }}
                                    value={formatNumber(FormData.perech_sum)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        set("perech_sum", raw);
                                    }}
                                />
                                <span>so'm</span>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Bank val:</label>
                            <div className="currency">
                                <input
                                    type="tel"
                                    className="input"
                                    style={{ textAlign: "center" }}
                                    value={formatNumber(FormData.perech_val)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        set("perech_val", raw);
                                    }}
                                />
                                <span>$</span>

                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="input-group" style={{ width: '60%' }}>
                                <label>Jami to'lov :</label>
                                <div className="currency">
                                    <input
                                        type="tel"
                                        style={{ textAlign: "center" }}
                                        className="input tolov-jami"
                                        readOnly
                                        // value={fmt(jami_som)}
                                        value={`${fmt(jami_som)} so'm`}

                                    />
                                </div>
                            </div>
                            <div className="input-group" style={{ width: '38%' }}>
                                <label>Jami to'lov:</label>
                                <div className="currency">
                                    <input
                                        type="tel"
                                        style={{ textAlign: "center" }}
                                        className="input tolov-jami"
                                        readOnly
                                        value={`${fmt(jami_dollar)} $`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Izox */}
                    <div className="input-group" style={{ width: "100%" }}>
                        <label>Izox:</label>
                        <textarea
                            className="input tolov-textarea"
                            value={FormData.izoh}
                            onChange={(e) => set("izoh", e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="btn-row" style={{ marginTop: "10px" }}>
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            BEKOR QILISH
                        </button>
                        <button type="button" className="btn-submit" onClick={handleSubmit}>
                            SAQLASH
                        </button>
                    </div>
                </div>
            </div>

            {openSelectHarajat && (
                <HarajatSelect
                    setOpenSelectHarajat={setOpenSelectHarajat}
                    onClose={() => setOpenSelectHarajat(false)}
                    FormData={FormData}
                    setFormData={setFormData}
                    Harajat={Harajat}
                    setHarajat={setHarajat}
                />
            )}
            {HarajatAdd && (
                <HarajataddModal
                    onClose={() => setHarajatAdd(false)}
                    handleHarajatUpdate={handleHarajatUpdate}
                    FormData={FormData}
                    setFormData={setFormData}
                />
            )}
        </>
    );
}
