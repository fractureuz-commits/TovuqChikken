import { useState } from "react";
import Swal from "sweetalert2";
import { API, apiPost } from "../../utils/api";
import { loadProducts, saveProducts } from "../../utils/storage";
import { useBackHandler } from "../../utils/backButtonStack";

export default function GroupTovarAdd({ onClose, onCreated, setFormData }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    useBackHandler(onClose);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Guruh nomini kiriting!",
                confirmButtonColor: "#d97706",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await apiPost(API.products, { name: name.trim() });

            if (response && response.success === false) {
                Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: "1C dan xato javob keldi.",
                    confirmButtonColor: "#d97706",
                });
                return;
            }

            const newGroup = {
                c: response?.code || response?.success?.code || Date.now().toString(),
                n: response?.name || name.trim(),
                i: null,
            };

            const existing = await loadProducts() || [];
            await saveProducts([...existing, newGroup]);

            if (onCreated) {
                onCreated(newGroup);
            }

            if (setFormData) {
                setFormData(prev => ({
                    ...prev,
                    GroupTovar_code: newGroup.c,
                    GroupTovar_name: newGroup.n,
                }));
            }

            Swal.fire({
                icon: "success",
                title: "Guruh yaratildi!",
                text: newGroup.n,
                confirmButtonColor: "#d97706",
                timer: 1200,
                showConfirmButton: false,
            });

            onClose();
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
        <div className="overlay">
            <div className="modal">
                <div className="modal-title">Yangi guruh qo'shish</div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ width: '100%' }}>
                        <label>Guruh nomi</label>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            placeholder="Guruh nomini kiriting"
                        />
                    </div>

                    <div className="divider" />

                    <div className="btn-row">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            BEKOR QILISH
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? "SAQLANMOQDA..." : "SAQLASH"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
