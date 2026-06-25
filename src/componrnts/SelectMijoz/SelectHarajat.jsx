import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../../utils/api";
import {  loadHarajat   } from "../../utils/storage";
import { apiPost } from "../../utils/api";
import { useBackHandler } from "../../utils/backButtonStack";
    
export default function HarajatSelect({TD, onClose,FormData, setFormData, setHarajat, Harajat }) {
    const [search, setSearch] = useState('');
    const [HarajatLoading, setHarajatLoading] = useState(true);
    const [HarajatError, setHarajatError] = useState(null);
    useBackHandler(onClose);

    useEffect(() => {
        loadHarajat()
            .then(data => {
                if (!data || data.length === 0) {
                    setHarajat([]);
                    return;
                }
                setHarajat(data);
            })
            .catch(err => setHarajatError(err.message))
            .finally(() => setHarajatLoading(false));
    }, []);
    
    const filtered = useMemo(() => {
        if (!search.trim()) return Harajat; // ✅ search yo'q → paginated visible
        const tokens = search.toLowerCase().trim().split(/\s+/);
        return Harajat.filter((doc) => {
            const haystack = [
                doc.name,
                doc.tel_1,
                doc.tel_2,
                doc.hudud_name,
                doc.dostav_name,
                doc.code
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
    }, [search, Harajat]);
    const highlightText = (text, search) => {
        if (!search?.trim() || typeof text !== "string") return text;

        // Tokenlarni regex uchun escape qilib, bitta pattern qil
        const tokens = search
            .trim()
            .split(/\s+/)
            .map(token => token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .filter(Boolean);

        if (!tokens.length) return text;

        // "falo|9166|mar" — har birini alohida qidiradi
        const regex = new RegExp(`(${tokens.join("|")})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i}>{part}</mark>
            ) : (
                part
            )
        );
    };
    
    return (
        <div className="overlay">
            <div className="modal" style={{ height: '95vh' }}>
                <div className="modal-title" onClick={onClose}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_2001_556)">
                            <path d="M10 24H38" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 24L18 32" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 24L18 16" stroke="#006CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                        <defs>
                            <clipPath id="clip0_2001_556">
                                <rect width="48" height="48" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    <p>Harajatlar royxati</p>
                </div>
                <div className="search">
                    <input
                        type="text"
                        placeholder='Qidirish...'
                        value={search}
                        autoComplete="off"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
                        <g clipPath="url(#clip0_176_771)">
                            <path d="M3.12488 10.4167C3.12488 11.3742 3.31348 12.3224 3.67992 13.2071C4.04636 14.0917 4.58346 14.8956 5.26056 15.5727C5.93765 16.2497 6.74148 16.7868 7.62614 17.1533C8.51081 17.5197 9.45899 17.7083 10.4165 17.7083C11.3741 17.7083 12.3223 17.5197 13.2069 17.1533C14.0916 16.7868 14.8954 16.2497 15.5725 15.5727C16.2496 14.8956 16.7867 14.0917 17.1532 13.2071C17.5196 12.3224 17.7082 11.3742 17.7082 10.4167C17.7082 9.45911 17.5196 8.51093 17.1532 7.62627C16.7867 6.7416 16.2496 5.93777 15.5725 5.26068C14.8954 4.58359 14.0916 4.04649 13.2069 3.68004C12.3223 3.3136 11.3741 3.125 10.4165 3.125C9.45899 3.125 8.51081 3.3136 7.62614 3.68004C6.74148 4.04649 5.93765 4.58359 5.26056 5.26068C4.58346 5.93777 4.04636 6.7416 3.67992 7.62627C3.31348 8.51093 3.12488 9.45911 3.12488 10.4167Z" stroke="#123A9B" strokeWidth="1.24" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21.8749 21.875L15.6249 15.625" stroke="#123A9B" strokeWidth="1.24" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                        <defs>
                            <clipPath id="clip0_176_771">
                                <rect width="25" height="25" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
                <div className="selects">
                    {filtered.map((item, index) => (
                        <div className="select" key={item.code}
                            onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    operatsiya_name: item.name,
                                    operatsiya_code: item.code,
                                }));
                                onClose()
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <p>{index + 1})</p>
                                <p>{highlightText(item.name, search)}</p>
                            </div>
                            <div>
                                <p>{highlightText(item.hudud_name, search)}</p>
                                <p>{highlightText(item.tel_1, search)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
