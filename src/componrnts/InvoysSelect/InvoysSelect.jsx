import { useEffect, useMemo, useState } from "react";
import "../SelectMijoz/MijozSelect.css";
import { apiFetch } from "../../utils/api";
import { getAllInvoys, replaceAllInvoys, addInvoys } from "../../utils/invoysDB";
import { useBackHandler } from "../../utils/backButtonStack";
import InvoysYaratish from "./InvoysYaratish";

const norm = (value) => String(value ?? "").trim().toLowerCase();

export default function InvoysSelect({ kontragentCode, kontragentName, onClose, onSelect }) {
    const [search, setSearch] = useState("");
    const [invoysList, setInvoysList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    useBackHandler(onClose);

    useEffect(() => {
        let cancelled = false;

        apiFetch("invoys", { timeoutMs: 15000, retries: 1 })
            .then((data) => {
                if (cancelled) return;
                const list = Array.isArray(data) ? data : [];
                setInvoysList(list);
                replaceAllInvoys(list);
            })
            .catch(async (err) => {
                if (cancelled) return;
                const cached = await getAllInvoys();
                if (cached.length) {
                    setInvoysList(cached);
                } else {
                    setError(err.message);
                }
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const kontragentInvoys = useMemo(() => {
        const byCode = invoysList.filter((inv) =>
            (inv.kontragent_code && norm(inv.kontragent_code) === norm(kontragentCode)) ||
            (inv.vlad_code && norm(inv.vlad_code) === norm(kontragentCode))
        );
        if (byCode.length) return byCode;

        return invoysList.filter((inv) =>
            (inv.kontragent_name && norm(inv.kontragent_name) === norm(kontragentName)) ||
            (inv.vlad_name && norm(inv.vlad_name) === norm(kontragentName))
        );
    }, [invoysList, kontragentCode, kontragentName]);

    const filtered = useMemo(() => {
        if (!search.trim()) return kontragentInvoys;
        const tokens = search.toLowerCase().trim().split(/\s+/);
        return kontragentInvoys.filter((inv) => {
            const haystack = [inv.name, inv.invoys_number, inv.data, inv.vlad_name]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
    }, [search, kontragentInvoys]);

    const isYopiq = (value) => ["да", "2"].includes(norm(value));

    return (
        <div className="overlay">
            <div className="modal kirim-modal" style={{ height: "95vh" }}>
                <div className="modal-title" onClick={onClose}>
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
                    <p>{kontragentName ? `${kontragentName} — invoyslar` : "Invoyslar ro'yxati"}</p>
                </div>
                <div className="invoys-search">
                    <div className="search">
                        <input
                            type="text"
                            placeholder="Qidirish..."
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
                    <button
                        type="button"
                        className="btn-add kirim-btn-add"
                        onClick={() => setOpenCreate(true)}
                        title="Yangi invoys yaratish"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                    </button>
                </div>
                <div className="selects" style={{ gridTemplateColumns: "1fr" }}>
                    {loading && <p style={{ padding: 20, textAlign: "center" }}>Yuklanmoqda...</p>}
                    {error && <p style={{ padding: 20, color: "red" }}>{error}</p>}
                    {!loading && !error && filtered.length === 0 && (
                        <p style={{ padding: 20, textAlign: "center" }}>Bu ta'minotchi uchun invoys topilmadi</p>
                    )}
                    {filtered.map((item, index) => (
                        <div
                            className="select"
                            key={item.code || index}
                            style={{ gridTemplateColumns: "1fr" }}
                            onClick={() => onSelect(item)}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <p>{index + 1})</p>
                                <p>{item.name}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p>№ {item.invoys_number}</p>
                                <p style={{ color: isYopiq(item.yopiq) ? "#dc2626" : "#059669" }}>
                                    {isYopiq(item.yopiq) ? "Yopiq" : "Ochiq"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {openCreate && (
                <InvoysYaratish
                    kontragentCode={kontragentCode}
                    kontragentName={kontragentName}
                    onClose={() => setOpenCreate(false)}
                    onCreated={(created) => {
                        setInvoysList(prev => [...prev, created]);
                        addInvoys(created);
                        setOpenCreate(false);
                        onSelect(created);
                    }}
                />
            )}
        </div>
    );
}
