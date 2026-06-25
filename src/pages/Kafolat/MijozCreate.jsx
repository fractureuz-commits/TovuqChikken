// MijozModal.jsx
import { useState } from "react";
import "./mijozModal.css";
import Modal from "../../componrnts/Modal/Modal";
import SearchAndSelect from "../../componrnts/drop_serach/dropSearch";
import Swal from "sweetalert2";
import { apiPostJson } from "../../utils/api";
export default function MijozModal({ open, onClose, fetchMijoz }) {
    const [form, setForm] = useState({
        id: '',
        name: '',
        id_1s: 2,
        tel_1: '',
        tel_2: '',
        viloyat: '',
        shahar: '',
        hudud: '',
        tugilgan_sana: '',
        ruyhat_sana: '',
        jinsi: '',
    });
    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
    const [searchViloyat, setsearchViloyat] = useState("");
    const [searchShahar, setsearchShahar] = useState("");
    const viloyatlar = [
        { id: 1, name: "Fargona " },
        { id: 2, name: "Namangan" },
    ];
    const Shaxar = [
        { id: 1, name: "Margilon " },
        { id: 2, name: "asaka" },
    ];
    const resetForm = () => {
        setForm({
            id: '',
            name: '',
            id_1s: 2,
            tel_1: '',
            tel_2: '',
            viloyat: '',
            shahar: '',
            hudud: '',
            tugilgan_sana: '',
            ruyhat_sana: '',
            jinsi: '',
        });
        onClose()
        fetchMijoz(); // Yangilash!
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await apiPostJson("/mijoz/", form, {
                auth: false,
                timeoutMs: 60000,
            });
            console.log('Response data:', data);
            resetForm();
            Swal.fire({
                icon: 'success',
                title: 'Muvaffaqiyatli!',
                text: 'Mijoz saqlandi',
                confirmButtonText: 'OK',
                timer: 2000,
                timerProgressBar: true,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Xatolik!',
                text: error.message,
                confirmButtonText: 'OK',
            });
            console.error('Xatolik yuz berdi:', error.message);
        }
    };
    return (
        <Modal open={open} onClose={onClose} title="Mijoz yaratish">
            <form onSubmit={handleSubmit} className="mf-form">
                {/* Nomi */}
                <div style={{ width: '100%' }} className={`mf-field ${form.name ? "has-value" : ""}`}>
                    <label className="mf-label">Nomi</label>
                    <input
                        className="mf-input"
                        type="text"
                        value={form.name}
                        onChange={e => set("name", e.target.value)}
                    />
                </div>
                {/* Tel 1 */}
                <div style={{ width: '100%' }} className={`mf-field ${form.tel_1 ? "has-value" : ""}`}>
                    <label className="mf-label">Tel 1</label>
                    <input
                        className="mf-input"
                        type="tel"
                        value={form.tel_1}
                        onChange={e => set("tel_1", e.target.value)}
                    />
                </div>
                {/* Tel 2 */}
                <div style={{ width: '100%' }} className={`mf-field ${form.tel_2 ? "has-value" : ""}`}>
                    <label className="mf-label">Tel 2</label>
                    <input
                        className="mf-input"
                        type="tel"
                        value={form.tel_2}
                        onChange={e => set("tel_2", e.target.value)}
                    />
                </div>
                <SearchAndSelect
                    setFormData={setForm}
                    items={viloyatlar}
                    selectname={'Viloyat'}
                    formData={form}
                    width="100%"
                    marginTop={'20px'}
                    formDataHududname={form.viloyat}
                    formdataName='viloyat_id'
                    selectitem='viloyat'
                    search={searchViloyat}
                    setSearch={setsearchViloyat}
                // OnModal={() => {}}
                // OnSelect={() => {}}
                />
                <SearchAndSelect
                    setFormData={setForm}
                    items={Shaxar}
                    selectname={'Shahar'}
                    formData={form}
                    width="100%"
                    marginTop={'25px'}
                    formDataHududname={form.shahar}
                    formdataName='shahar_id'
                    selectitem='shahar'
                    search={searchShahar}
                    setSearch={setsearchShahar}
                // OnModal={() => {}}
                // OnSelect={() => {}}
                />
                <div style={{ width: '49%' }} className={`mf-field ${form.jinsi !== "" ? "has-value" : ""}`}>
                    <label className="spes-lebel">Jinsi</label>
                    <select
                        name="jinsi"
                        className="mf-input"
                        value={form.jinsi}   // MUHIM
                        onChange={e => set("jinsi", e.target.value)}
                    >
                        <option value="" disabled>Jinsni tanlang</option>
                        <option value="1">Erkak</option>
                        <option value="0">Ayol</option>
                    </select>
                </div>
                <div style={{ width: '49%' }} className={`mf-field ${form.tugilgan_sana ? "has-value" : ""}`}>
                    <label className="spes-lebel" >Tug'ilgan sana</label>
                    <input
                        type="date"
                        name="tugilgan_sana"
                        className="mf-input"
                        onChange={e => set("tugilgan_sana", e.target.value)}
                    />
                </div>
                <div className="mf-buttons">
                    <button className="mf-btn-cancel" onClick={onClose}>BEKOR QILISH</button>
                    <button className="mf-btn-save">SAQLASH</button>
                </div>

            </form>
        </Modal>
    );
}
