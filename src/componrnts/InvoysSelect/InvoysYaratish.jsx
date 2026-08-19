import { useState } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { apiPost, API } from "../../utils/api";
import { useBackHandler } from "../../utils/backButtonStack";

export default function InvoysYaratish({ kontragentCode, kontragentName, onClose, onCreated }) {
    useBackHandler(onClose);

    const [invoysNumber, setInvoysNumber] = useState("");
    const [sana, setSana] = useState(format(new Date(), "yyyy-MM-dd"));
    const [yopiq, setYopiq] = useState("1");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invoysNumber.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Invoys raqami kiritilmagan!",
                confirmButtonColor: "#d97706",
            });
            return;
        }

        const data = format(new Date(sana), "yyyy.MM.dd");

        setSaving(true);
        try {
            const payload = {
                data,
                kontragent_code: kontragentCode,
                invoys_number: invoysNumber.trim(),
                yopiq,
            };
            const result = await apiPost(API.invoys, payload);

            if (result && result.success === false) {
                Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: "1C dan xato javob keldi.",
                    confirmButtonColor: "#1a2b4a",
                });
                return;
            }

            const created = {
                name: `${data} - ${invoysNumber.trim()}${kontragentName ? ` - ${kontragentName}` : ""}`,
                invoys_number: invoysNumber.trim(),
                data,
                kontragent_code: kontragentCode,
                vlad_code: kontragentCode,
                vlad_name: kontragentName,
                yopiq,
                ...result,
            };

            onCreated(created);
        } catch (err) {
            console.error("❌ Xato:", err.message);
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#1a2b4a",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="overlay">
            <div className="modal kirim-modal">
                <div className="modal-title" style={{ justifyContent: "center" }}>Yangi invoys yaratish</div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ width: "100%" }}>
                        <label>Ta'minotchi</label>
                        <input
                            readOnly
                            type="text"
                            value={kontragentName || ""}
                            className="input"
                        />
                    </div>

                    <div className="input-group" style={{ width: "100%" }}>
                        <label>Invoys raqami</label>
                        <input
                            type="text"
                            value={invoysNumber}
                            onChange={(e) => setInvoysNumber(e.target.value)}
                            className="input"
                            placeholder=""
                        />
                    </div>

                    <div className="input-group" style={{ width: "100%" }}>
                        <label>Sana</label>
                        <input
                            type="date"
                            value={sana}
                            onChange={(e) => setSana(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="checkbox-row" style={{ width: "100%", justifyContent: "flex-start", gap: "24px" }}>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={yopiq === "1"}
                                onChange={() => setYopiq("1")}
                            />
                            <span className="checkbox-custom">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            Ochiq
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={yopiq === "2"}
                                onChange={() => setYopiq("2")}
                            />
                            <span className="checkbox-custom">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            Yopiq
                        </label>
                    </div>
                    <div className="divider" />

                    <div className="btn-row">
                        <button type="button" className="btn-cancel kirim-btn-cancel" onClick={onClose}>
                            BEKOR QILISH
                        </button>
                        <button type="submit" className="btn-submit kirim-btn-submit" disabled={saving}>
                            {saving ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
