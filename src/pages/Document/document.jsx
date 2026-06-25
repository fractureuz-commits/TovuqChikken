import './document.css';
import { getUser } from '../../leyout/login/auth';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiGet } from '../../utils/api';

const PAGE_SIZE = 20;

function Document() {
    const [allDocuments, setAllDocuments] = useState([]);
    const [visible, setVisible] = useState([]);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const visibleCountRef = useRef(PAGE_SIZE);
    const observerRef = useRef(null);
    const allDocumentsRef = useRef([]);

    const filtered = useMemo(() => {
        if (!search.trim()) return visible;

        const tokens = search.toLowerCase().trim().split(/\s+/);
        return allDocuments.filter((doc) => {
            const haystack = [
                doc.mijoz_momi,
                doc.mahsulot_nomi,
                doc.mahsulot_id_1s,
                doc.sotilgan_sana,
                doc.QR,
                doc.id,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return tokens.every((token) => haystack.includes(token));
        });
    }, [search, allDocuments, visible]);

    useEffect(() => {
        setUser(getUser());
    }, []);

    useEffect(() => {
        if (!user?.id_1s) return;
        fetchDocument();
    }, [user?.id_1s]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting) return;

                const all = allDocumentsRef.current;
                const next = visibleCountRef.current + PAGE_SIZE;
                if (visibleCountRef.current >= all.length) return;

                visibleCountRef.current = next;
                setVisible(all.slice(0, next));
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [allDocuments]);

    const applyDocuments = (data) => {
        const rows = Array.isArray(data) ? data : [];
        allDocumentsRef.current = rows;
        setAllDocuments(rows);
        visibleCountRef.current = PAGE_SIZE;
        setVisible(rows.slice(0, PAGE_SIZE));
    };

    const fetchDocument = async () => {
        setLoading(true);
        try {
            const data = await apiGet(`/diller_umumiy/${user.id_1s}/`, {
                auth: false,
                timeoutMs: 60000,
                retries: 0,
            });
            applyDocuments(data);
        } catch (error) {
            console.log(`Xato: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const highlightText = (text, searchValue) => {
        if (!searchValue?.trim() || typeof text !== 'string') return text;

        const tokens = searchValue
            .trim()
            .split(/\s+/)
            .map(token => token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .filter(Boolean);

        if (!tokens.length) return text;

        const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
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
        <>
            <div className="Home">
                <h1 className="home-title" style={{ marginTop: '1vh' }}>
                    <p>Savdolar ro&apos;yxati</p>
                </h1>
            </div>
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
            <div className="list">
                {loading && <p style={{ textAlign: 'center' }}>Yuklanmoqda...</p>}

                {filtered.map((doc) => (
                    <div className="kaf-card-row" key={doc.id}>
                        <div className="kaf-card-id">
                            <span>{highlightText(doc.id, search)}</span>
                        </div>
                        <div className="kaf-card-info">
                            <div className="kaf-card-top">
                                <span className="kaf-card-sana">{highlightText(doc.sotilgan_sana, search)}</span>
                                <span className="kaf-card-divider" />
                                <span className="kaf-card-mijoz">{highlightText(doc.mijoz_momi, search)}</span>
                            </div>
                            <div className="kaf-card-bottom">
                                <span className="kaf-card-mahsulot">
                                    {highlightText(doc.mahsulot_nomi ?? doc.mahsulot_id_1s, search)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {!search.trim() && visible.length < allDocuments.length && (
                    <div ref={observerRef} style={{ height: 30 }} />
                )}

                {!loading && !search.trim() && visible.length === allDocuments.length && allDocuments.length > 0 && (
                    <p style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                        Hammasi yuklandi ({allDocuments.length} ta)
                    </p>
                )}

                {!loading && search.trim() && (
                    <p style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                        {filtered.length} ta natija topildi
                    </p>
                )}
            </div>
        </>
    );
}

export default Document;
