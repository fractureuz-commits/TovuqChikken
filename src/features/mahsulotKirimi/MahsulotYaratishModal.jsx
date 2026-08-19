import { useState, useEffect } from "react";
import "../../componrnts/BuyurtmaModal/buyurtma.css";
import MahsulotGroupSelect from "../../componrnts/SelectMijoz/MahsulotGroupSelect";
import GroupTovarAdd from "../../componrnts/SelectMijoz/GroupTovarAdd";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import { loadProducts, loadTovar, saveTovar } from "../../utils/storage";
import { useBackHandler } from "../../utils/backButtonStack";
import { getUser } from "../../leyout/login/auth";
import { canViewPriceType } from "../../utils/permissions";

export default function MahsulotYaratishModal({ onClose, onCreated }) {
    const user = getUser();
    const visiblePriceTypes = ["1", "2", "3", "4"].filter((n) => canViewPriceType(user, n));
    const [formData, setFormData] = useState({
        name: "",
        GroupTovar_code: "",
        GroupTovar_name: "",
        val: "1",
        narh1: "",
        
        narh2: "",
        narh3: "",
        narh4: "",
    });

    const [openGroupSelect, setOpenGroupSelect] = useState(false);
    const [openGroupCreate, setOpenGroupCreate] = useState(false);
    const [loading, setLoading] = useState(false);

    const [mahsulotGroups, setMahsulotGroups] = useState([]);

    useBackHandler(onClose);

    useEffect(() => {
        loadProducts()
            .then(groups => {
                if (groups && groups.length > 0) {
                    setMahsulotGroups(groups);
                }
            })
            .catch(error => console.error("Mahsulot guruhlarini yuklashda xato:", error));
    }, []);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Mahsulot nomi kiritilmagan!",
                confirmButtonColor: "#d97706",
            });
            return;
        }

        if (!formData.GroupTovar_code) {
            Swal.fire({
                icon: "warning",
                title: "Mahsulot guruhi tanlanmagan!",
                confirmButtonColor: "#d97706",
            });
            return;
        }

        setLoading(true);

        const isVal = formData.val === "2";
        // Ruhsati yo'q narx turlari uchun foydalanuvchi qiymat kirita olmaydi —
        // shunga qaramay, serverga ham 0 ketishini kafolatlash uchun bu yerda tozalanadi.
        const narh1 = visiblePriceTypes.includes("1") ? (formData.narh1 || "0") : "0";
        const narh2 = visiblePriceTypes.includes("2") ? (formData.narh2 || "0") : "0";
        const narh3 = visiblePriceTypes.includes("3") ? (formData.narh3 || "0") : "0";
        const narh4 = visiblePriceTypes.includes("4") ? (formData.narh4 || "0") : "0";

        // App ichida narx narh_sum1-4 / narh_val1-4 juftligi orqali o'qiladi (utils/narx.js),
        // shu sababli tanlangan valyutaga qarab kiritilgan narh1-4 shu juftlikka taqsimlanadi.
        const priceFields = {
            narh_sum1: isVal ? "0" : narh1,
            narh_sum2: isVal ? "0" : narh2,
            narh_sum3: isVal ? "0" : narh3,
            narh_sum4: isVal ? "0" : narh4,
            narh_val1: isVal ? narh1 : "0",
            narh_val2: isVal ? narh2 : "0",
            narh_val3: isVal ? narh3 : "0",
            narh_val4: isVal ? narh4 : "0",
        };

        try {
            // Backendga to'g'ridan-to'g'ri yuboriladi — muvaffaqiyatsiz bo'lsa mahsulot yaratilmaydi
            const response = await apiPost("/tovuq/hs/tovar/post_tovar/", {
                name: formData.name,
                grupa_tovar_code: formData.GroupTovar_code,
                val: formData.val,
                narh1,
                narh2,
                narh3,
                narh4,
            });

            if (response && response.success === false) {
                Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: "1C dan xato javob keldi.",
                    confirmButtonColor: "#d97706",
                });
                return;
            }

            const newProduct = {
                code: response?.code || response?.success?.code || Date.now().toString(),
                name: formData.name,
                group_tovar_code: formData.GroupTovar_code,
                group_tovar_name: formData.GroupTovar_name,
                ...priceFields,
                valyuta_turi: formData.val,
                qoldiq: "0",
                i: null,
            };

            // Backendga yuborilgach, mahalliy Tovar katalogiga ham qo'shiladi (sinxronizatsiyani kutmasdan) —
            // Mahsulotlar.jsx aynan shu ro'yxatdan o'qiydi, "products" esa guruhlar ro'yxati
            const currentTovarlar = await loadTovar() || [];
            const updatedTovarlar = [...currentTovarlar, newProduct];
            await saveTovar(updatedTovarlar);

            Swal.fire({
                icon: "success",
                title: "Mahsulot yaratildi!",
                text: `${formData.name} muvaffaqiyatli qo'shildi`,
                confirmButtonColor: "#d97706",
                timer: 1200,
                showConfirmButton: false,
            });

            if (onCreated) {
                onCreated(newProduct);
            } else {
                onClose();
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#d97706",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="overlay">
                <div className="modal kirim-modal">
                    <div className="modal-title kirim-title" onClick={onClose}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_2001_556)">
                                <path d="M10 24H38" stroke="#d97706" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 24L18 32" stroke="#d97706" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 24L18 16" stroke="#d97706" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_2001_556">
                                    <rect width="48" height="48" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <p>Yangi mahsulot yaratish</p>
                    </div>
                    <form autoComplete="off" noValidate>
                        {/* Mahsulot nomi */}
                        <div className="input-group" style={{ width: '100%' }}>
                            <label>Mahsulot nomi</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="Mahsulot nomini kiriting"
                            />
                        </div>

                        {/* Mahsulot guruhi */}
                        <div className="input-group add" style={{ width: '100%' }}>
                            <label>Mahsulot guruhi</label>
                            <div className="input-row">
                                <input
                                    readOnly
                                    type="text"
                                    value={formData.GroupTovar_name}
                                    onClick={() => setOpenGroupSelect(true)}
                                    className="input"
                                    placeholder="Guruhni tanlang"
                                />
                                <button type="button" onClick={() => setOpenGroupCreate(true)} className="btn-add kirim-btn-add">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* Valyuta turi */}
                        <div className="checkbox-row" style={{ width: '100%', justifyContent: 'flex-start', gap: '24px' }}>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.val === "1"}
                                    onChange={() => setFormData(prev => ({ ...prev, val: "1" }))}
                                />
                                <span className="checkbox-custom kirim-checkbox-custom">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                So'm
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.val === "2"}
                                    onChange={() => setFormData(prev => ({ ...prev, val: "2" }))}
                                />
                                <span className="checkbox-custom kirim-checkbox-custom">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                Valyuta
                            </label>
                        </div>
                        <div className="divider" />

                        {/* Narxlar */}
                        {visiblePriceTypes.map((n) => (
                            <div className="input-group" style={{ width: '100%' }} key={n}>
                                <label>Narx {n}</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={formData[`narh${n}`]}
                                    onChange={(e) => setFormData(prev => ({ ...prev, [`narh${n}`]: e.target.value }))}
                                    className="input"
                                    placeholder="0"
                                />
                            </div>
                        ))}

                        {/* Buttons */}
                        <div className="btn-row" style={{ width: '100%' }}>
                            <button type="button" className="btn-cancel kirim-btn-cancel" onClick={onClose}>
                                BEKOR QILISH
                            </button>
                            <button type="button" onClick={handleSubmit} className="btn-submit kirim-btn-submit" disabled={loading}>
                                {loading ? "SAQLANMOQDA..." : "SAQLASH"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Mahsulot Group Select */}
            {openGroupSelect && (
                <MahsulotGroupSelect
                    onClose={() => setOpenGroupSelect(false)}
                    FormData={formData}
                    setFormData={setFormData}
                    MahsulotGroup={mahsulotGroups}
                    setMahsulotGroup={setMahsulotGroups}
                />
            )}

            {/* Yangi guruh yaratish */}
            {openGroupCreate && (
                <GroupTovarAdd
                    onClose={() => setOpenGroupCreate(false)}
                    setFormData={setFormData}
                    onCreated={(newGroup) => setMahsulotGroups(prev => [...prev, newGroup])}
                />
            )}
        </>
    );
}
