import { useState } from "react";
import SavdoRoyhatiModal from "./royhatlar/savdoRoyhati";
import "./savdoRoyhati.css";
import MijozSolishtirmaRoyhatiModal from "./royhatlar/MijozSolishtirmaRoyhati";
import MijozQarzdorligiRoyhatiModal from "./royhatlar/MijozQarzdorligiRoyhati";
import MahsulotQoldigiRoyhatiModal from "./royhatlar/MahsulotQoqldigi";

const OPTIONS = [
    { id: 1, label: "Savdo ro'yhati", sub: null },
    { id: 2, label: "Mijoz", sub: "Solishtirma\ndalolatnoma" },
    { id: 3, label: "Mijoz qarzdorligi", sub: null },
    { id: 4, label: "Mahsulot qoldigi", sub: null },
];

export default function HisobotModal({ onClose }) {
    const [selected, setSelected] = useState(1);
    const [SavdoRoyhati, setSavdoRoyhati] = useState(false);
    const handleSubmit = () => {
        setSavdoRoyhati(selected);
    };
    return (
        <>
            <div className="overlay">
                <div className="modal">
                    <div className="modal-title" style={{ justifyContent: 'center' }}>
                        Hisobotlar
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 20px' }}>
                        {OPTIONS.map(opt => (
                            <div
                                key={opt.id}
                                onClick={() => setSelected(opt.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    color: '#006cac'
                                }}
                            >
                                {/* Radio circle */}
                                <div style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    border: `2px solid #006CAC`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    color: '#006cac'
                                }}>
                                    {selected === opt.id && (
                                        <div style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            background: '#006CAC',

                                        }} />
                                    )}
                                </div>

                                {/* Label */}
                                <span style={{
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    color: '#006cac',
                                    fontWeight: 'bold'
                                }}>
                                    {opt.label}
                                    {opt.sub && (
                                        <div className="hisobot-sub-wrap">
                                            <span className="hisobot-sub-bracket">(</span>
                                            <span className="hisobot-sub">{opt.sub}</span>
                                            <span className="hisobot-sub-bracket">)</span>
                                        </div>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="btn-row" style={{ padding: '10px 20px' }}>
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            BEKOR QILISH
                        </button>
                        <button type="button" className="btn-submit" onClick={handleSubmit}>
                            DAVOM ETISH
                        </button>
                    </div>
                </div>
            </div>

            {SavdoRoyhati === 1 &&
                <SavdoRoyhatiModal
                    onClose={() => setSavdoRoyhati(false)}
                />}
            {SavdoRoyhati === 2 &&
                <MijozSolishtirmaRoyhatiModal
                    onClose={() => setSavdoRoyhati(false)}
                />}

                {SavdoRoyhati === 3 &&
                <MijozQarzdorligiRoyhatiModal
                    onClose={() => setSavdoRoyhati(false)}
                />}
                {SavdoRoyhati === 4 &&
                <MahsulotQoldigiRoyhatiModal
                    onClose={() => setSavdoRoyhati(false)}
                />}
        </>
    );
}