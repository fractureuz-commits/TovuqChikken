import { useState } from "react";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import QrModal from "../QrModal/qrModal";
import { saveKontragent, loadKontragent, loadHarajat, saveHarajat } from "../../utils/storage";
import { useBackHandler } from "../../utils/backButtonStack";

export default function HarajataddModal({ onClose, handleHarajatUpdate, setFormData }) {
    useBackHandler(onClose);

    const [FormDataHarajat, setFormDataHarajat] = useState({
        name: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await apiPost("tovuq/hs/harajat/get_harajat", FormDataHarajat);

            if (result.success) {
                // backenddan code + name olish
                const newHarajat = {
                    id: Date.now(),
                    code: result.code || result.data?.code || "",
                    name: result.name || result.data?.name || FormDataHarajat.name,
                };
                setFormData(prev => ({
                    ...prev,
                    kontragent: result.name,
                    kontragent_id: result.code,
                    hudud: result.hudud_name,
                    hudud_id: result.hudud_code || '',
                    tel_1: result.tel_1,
                    tel_2: result.tel_2,
                    Hudud_code: result.hudud_code,
                    Hudud_name: result.hudud_name,
                    Mijoz_code: result.code,
                }));        // file/local storage dan eski harajatlarni olish
                const existing = (await loadHarajat()) || [];

                // takroriy code bo‘lsa qo‘shmaslik
                const alreadyExists = existing.some(
                    (item) => item.code === newHarajat.code
                );

                let updated = existing;

                if (!alreadyExists) {
                    updated = [...existing, newHarajat];

                    // file storage ga yozish
                    await saveHarajat(updated);
                }

                if (handleHarajatUpdate) handleHarajatUpdate(updated);
                onClose();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: "Backenddan xato javob keldi.",
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
                    <div className="modal-title">Harajat turi</div>
                    <form onSubmit={handleSubmit}>
                        {/* Harajat nomi */}
                        <div className="input-group add" style={{ width: '100%' }}>
                            <label>Harajat nomi</label>
                            <div className="input-row">
                                <input
                                    type="text"
                                    value={FormDataHarajat.name}
                                    onChange={(e) => setFormDataHarajat(prev => ({ ...prev, name: e.target.value }))}
                                    className="input"
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div className="divider" />

                        <div className="btn-row">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                BEKOR QILISH
                            </button>
                            <button type="submit" className="btn-submit">
                                Saqlash
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </>
    );
}
