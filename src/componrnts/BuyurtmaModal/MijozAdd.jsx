import { useState } from "react";
import MijozSelect from "../SelectMijoz/SelectMijoz";
import { BaseUrl } from "../../baseUrl";
import Swal from "sweetalert2";
import { apiFetch, apiPost } from "../../utils/api";
import QrModal from "../QrModal/qrModal";
import { saveKontragent ,loadKontragent } from "../../utils/storage";

export default function MijozaddModal({ onClose,onKontragentUpdate ,setKontragent}) {
    const [FormDataMijoz, setFormDataMijoz] = useState({
        name: "",
        tel_1: "",
        tel_2: "",
        hudud_code: 1,
        dostav_code: 2,
        manzil: "",
        lat: "",
        lang: ""
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await apiPost("tovuq/hs/kontragent/get_kontragent", FormDataMijoz);
            console.log("✅ Javob:", result);

            if (result.success) {
                // ✅ Fildan o'qib yangi elementni qo'shamiz
                const existing = await loadKontragent() || [];
                const updated = [...existing, result];

                // ✅ Filega saqlaymiz (kontragent.json)
                await saveKontragent(updated);
                console.log("💾 kontragent.json yangilandi:", updated.length, "ta");

                // ✅ Parentga yangilangan listni yuboramiz
                if (onKontragentUpdate) onKontragentUpdate(updated);

                Swal.fire({
                    icon: "success",
                    title: "Saqlandi!",
                    confirmButtonColor: "#1a2b4a",
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                onClose();
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
                    <div className="modal-title">Yangi mijoz qo’shish</div>
                    <form onSubmit={handleSubmit}>
                        {/* Mijoz nomi */}
                        <div className="input-group add" style={{width:'100%'}}>
                            <label>Mijoz nomi</label>
                            <div className="input-row">
                                <input
                                    type="text"
                                    value={FormDataMijoz.name}
                                    onChange={(e) => setFormDataMijoz(prev => ({ ...prev, name: e.target.value }))}
                                    className="input"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/* Telefon raqami */}
                        <div className="input-group" style={{width:'100%'}}>
                            <label>Telefon raqami </label>
                            <input
                                type="tel"
                                value={FormDataMijoz.tel_1}
                                onChange={(e) => setFormDataMijoz(prev => ({ ...prev, tel_1: e.target.value }))}
                                className="input"
                                placeholder=""
                            />
                        </div>
                        <div className="input-group" style={{width:'100%'}}>
                            <label>Telefon raqami 2</label>
                            <input
                                type="tel"
                                value={FormDataMijoz.tel_2}
                                onChange={(e) => setFormDataMijoz(prev => ({ ...prev, tel_2: e.target.value }))}
                                className="input"
                                placeholder=""
                            />
                        </div>
                        {/* Hudud nomi */}
                        <div className="input-group" style={{width:'100%'}}>
                            <label>Manzil</label>
                            <input
                                type="text"
                                value={FormDataMijoz.manzil}
                                onChange={(e) => setFormDataMijoz(prev => ({ ...prev, manzil: e.target.value }))}
                                className="input"
                                placeholder=""
                            />
                        </div>

                        {/* Location */}
                        <div className="input-group add" style={{width:'100%'}}>
                            <label>Location</label>
                            <div className="input-row">
                                <input
                                    type="text"
                                    readOnly
                                    value={FormDataMijoz.lat && FormDataMijoz.lang
                                        ? `${FormDataMijoz.lat}, ${FormDataMijoz.lang}`
                                        : ""
                                    }
                                    className="input"
                                    placeholder=""
                                />
                                <button
                                    type="button"
                                    className="btn-add"
                                    onClick={() => {
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                setFormDataMijoz(prev => ({
                                                    ...prev,
                                                    lat: pos.coords.latitude.toFixed(6),
                                                    lang: pos.coords.longitude.toFixed(6),
                                                }));
                                            },
                                            (err) => console.error("Lokatsiya xato:", err.message)
                                        );
                                    }}
                                >
                                    <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.3641 2.63606C17.0164 4.28819 17.9614 6.51817 17.9993 8.85447C18.0372 11.1908 17.1649 13.4502 15.5671 15.1551L15.3641 15.3651L11.1211 19.6071C10.5827 20.1451 9.85993 20.4584 9.09921 20.4834C8.33849 20.5085 7.59668 20.2435 7.02406 19.7421L6.88006 19.6071L2.63606 15.3641C0.948218 13.6762 0 11.387 0 9.00006C0 6.61309 0.948218 4.32389 2.63606 2.63606C4.32389 0.948218 6.61309 0 9.00006 0C11.387 0 13.6762 0.948218 15.3641 2.63606ZM9.00006 6.00006C8.60609 6.00006 8.21598 6.07765 7.85201 6.22842C7.48803 6.37918 7.15731 6.60016 6.87873 6.87873C6.60016 7.15731 6.37918 7.48803 6.22842 7.85201C6.07765 8.21598 6.00006 8.60609 6.00006 9.00006C6.00006 9.39402 6.07765 9.78413 6.22842 10.1481C6.37918 10.5121 6.60016 10.8428 6.87873 11.1214C7.15731 11.4 7.48803 11.6209 7.85201 11.7717C8.21598 11.9225 8.60609 12.0001 9.00006 12.0001C9.7957 12.0001 10.5588 11.684 11.1214 11.1214C11.684 10.5588 12.0001 9.7957 12.0001 9.00006C12.0001 8.20441 11.684 7.44134 11.1214 6.87873C10.5588 6.31613 9.7957 6.00006 9.00006 6.00006Z" fill="#fff" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Izoh */}
                        <div className="input-group">
                            <label>Izoh</label>
                            <textarea
                                className="input"
                                value={FormDataMijoz.izoh || ""}
                                onChange={(e) => setFormDataMijoz(prev => ({ ...prev, izoh: e.target.value }))}
                            />
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
