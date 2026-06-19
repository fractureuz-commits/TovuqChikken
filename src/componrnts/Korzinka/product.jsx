import { useEffect, useMemo, useState, useCallback } from "react";
import { loadTovar, loadImage } from "../../utils/storage";
import { apiPost } from "../../utils/api";
import QrModal from "../QrModal/qrModal";
import ProductQoshish from "./ProductQoshish";
import "./tovar.css";
import Swal from "sweetalert2";
import PartiyaSelect from "./PartiyiyaSelect";
import ModalHeader from "../BuyurtmaModal/ModalHeader";
import { getNarx } from "../../utils/narx";
import { format } from "date-fns";
import { getUser } from "../../leyout/login/auth";
import QaytarishSelect from "./QaytarishPartiya";

export function Tovar({ item, search, highlightText, onClick }) {
    const [imgSrc, setImgSrc] = useState(null);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const { narx: currentNarx, isVal } = getNarx(item, FormData); // ✅
    useEffect(() => {
        if (item?.i) loadImage(item.i).then(src => setImgSrc(src));
    }, [item?.i]);
    const user = getUser()

    const name = item?.name || item?.n || "";
    return (
        <>

            <div className="tovar" onClick={() => onClick?.(item)}>

                <div className="tovar-img">
                    {imgSrc
                        ? <img src={imgSrc} alt={name} />
                        : <div className="tovar-img-placeholder" />
                    }
                </div>
                <div className="tovarTitles">
                    <div className="title">
                        {highlightText ? highlightText(name, search) : name}
                    </div>
                    {item?.hajm && (
                        <div className="volume">{item.hajm} {item?.ul_bir}</div>
                    )}
                    <div className="tovar-narxlar">
                        {currentNarx > 0 && (
                            <span className={isVal ? "price-val" : "price"}>
                                {(user?.rol === "1" || user?.narx_korish) && (
                                    <>
                                        {currentNarx.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} {isVal ? "$" : "so'm"}
                                    </>
                                )}

                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══ TOVAR MODAL ═══
export default function TovarModal({ onClose, groupCode, KorzinkaModal, qaytarish }) {
    const [search, setSearch] = useState('');
    const [ProductGroup, setProductGroup] = useState([]);
    const [ShtrixModal, setShtrixModal] = useState(false);
    const [shtrixData, setshtrixData] = useState([]);
    const [ProductData, setProductData] = useState(null);
    const [Productadd, setProductadd] = useState(false);
    const [PartiyaSelectModal, setPartiyaSelectModal] = useState(false);
    const [QaytarishPartiyaSelectModal, setQaytarishPartiyaSelectModal] = useState(false);
    const [QaytarishPartiya, setQaytarishPartiya] = useState(false);
    const [ProductGroupLoading, setProductGroupLoading] = useState(true);
    const [ProductGroupError, setProductGroupError] = useState(null);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const user = getUser();
    useEffect(() => {
        loadTovar()
            .then(data => setProductGroup(data || []))
            .catch(err => setProductGroupError(err.message))
            .finally(() => setProductGroupLoading(false));
    }, []);
    const filtered = useMemo(() => {
        let list = ProductGroup;

        // ✅ 1 — Gruppa bo'yicha filter
        if (groupCode) {
            list = list.filter(doc => doc.group_tovar_code === groupCode);
        }

        // ✅ 2 — Search filter
        if (!search.trim()) return list;
        const tokens = search.toLowerCase().trim().split(/\s+/);
        return list.filter((doc) => {
            const haystack = [doc.name, doc.code]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
    }, [search, ProductGroup, groupCode]);

    const highlightText = useCallback((text, search) => {
        if (!search?.trim() || typeof text !== "string") return text;
        const tokens = search
            .trim()
            .split(/\s+/)
            .map(token => token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .filter(Boolean);
        if (!tokens.length) return text;
        const regex = new RegExp(`(${tokens.join("|")})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
    }, []);
    const handleSubmit = async (code) => {
        const selectedItem = filtered.find(item => item.code === code);
        if (!selectedItem) return;

        try {
            const body = {
                code_product: selectedItem.code,
            };
            const result = await apiPost("tovuq/hs/tovar/get_partya", body);
            setProductData(result);
            setPartiyaSelectModal(true);
        } catch (err) {
            console.error("❌ Xato:", err.message);
        }
    };
    const [Sending, setSending] = useState({ tovarlar: [] });
    const handleQaytarish = async (item) => {
        const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
        if (!item) return;
        setSending(true);
        try {
            const narhTuri = FormData?.narh_turi || 1;

            const narh =
                Number(item[`narh_sum${narhTuri}`]?.toString().replace(/\s/g, "")) || 0;

            const payload = {
                date: FormData?.date || format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                date_1: format(FormData?.date_1, "dd.MM.yyyy"),
                date_2: format(FormData?.date_2, "dd.MM.yyyy"),
                mijoz_code: FormData?.Mijoz_code || "",
                narh_turi: narhTuri,
                ost_sum: 0,
                ost_val: 0,
                user_code: FormData?.user_code || user?.code || "",
                vid_val: FormData?.vid_val || "1",
                tovarlar: [
                    {
                        itemId: `${item.date_invoys || "nodate"}_${item.code}`,
                        tovar_code: item.code,
                        number_invoys: item.number_invoys || "",
                        date_invoys: item.date_invoys || "",
                        qoldiq: item.qoldiq || "0",
                        bayyer: "",
                        name: item.name || "",
                        group_tovar_code: item.group_tovar_code || "",
                        group_tovar_name: item.group_tovar_name || "",
                        narh_val1: item.narh_val1 || "0",
                        narh_val2: item.narh_val2 || "0",
                        narh_val3: item.narh_val3 || "0",
                        narh_val4: item.narh_val4 || "0",
                        narh_sum1: item.narh_sum1 || "0",
                        narh_sum2: item.narh_sum2 || "0",
                        narh_sum3: item.narh_sum3 || "0",
                        narh_sum4: item.narh_sum4 || "0",
                        ul_bir: item.ul_bir || "",
                        term: "",
                        valyuta_turi: item.valyuta_turi || "1",
                        hajm: item.hajm || "",
                        soni: "1",
                        Summa: narh,
                        narh: narh,
                    }
                ]
            };

            console.log("Qaytarish payload:", payload);

            const result = await apiPost("tovuq/hs/vozvrat/get_vozvrat/", payload);
            setQaytarishPartiya(result)
            setQaytarishPartiyaSelectModal(true)
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#006CAC",
            });
        } finally {
            setSending(false);
        }
    };
    return (
        <>
            <div className="overlay" style={{ flexDirection: 'column' }}>
                <div className="app-safe" >
                    <ModalHeader
                        activeTab="sotib"
                        onSotib={() => { }}
                        onKoriznka={() => KorzinkaModal?.()}
                        onSkaner={() => setShtrixModal(prev => !prev)}
                    />
                    <div className="modal" style={{ height: '100vh', width: '100%', borderRadius: "0px", }}>
                        {/* ✅ Orqaga + title */}
                        <div className="modal-title" style={{
                            justifyContent: 'space-between',
                            margin: '0px 0',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <button onClick={onClose} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#006CAC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <span>Tovarlar</span>
                            <span style={{ width: 32 }} />
                        </div>
                        <div className="search" style={{ marginTop: '10px' }}>
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
                                <defs><clipPath id="clip0_176_771"><rect width="25" height="25" fill="white" /></clipPath></defs>
                            </svg>
                        </div>

                        {ProductGroupLoading ? (
                            <p style={{ padding: 20, textAlign: 'center' }}>📦 Yuklanmoqda...</p>
                        ) : ProductGroupError ? (
                            <p style={{ padding: 20, color: 'red' }}>❌ {ProductGroupError}</p>
                        ) : filtered.length === 0 ? (
                            <p style={{ padding: 20, textAlign: 'center' }}>Mahsulot topilmadi</p>
                        ) : (
                            <div className="tovarlar">
                                {filtered.map((item) => (
                                    <Tovar
                                        key={item.code}
                                        item={item}
                                        search={search}
                                        highlightText={highlightText}
                                        onClick={() => { qaytarish ? handleQaytarish(item) : handleSubmit(item.code) }}
                                        FormData={FormData}   // ← qo'shildi
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {ShtrixModal &&
                <QrModal
                    handleModal={() => setShtrixModal(prev => !prev)}
                    setshtrixData={setshtrixData}
                    shtrixData={shtrixData}
                    setProductData={setProductData}
                    ProductData={ProductData}
                    setProductadd={setProductadd}
                />
            }
            {PartiyaSelectModal &&
                <PartiyaSelect
                    onClose={() => setPartiyaSelectModal(false)}
                    ProductData={ProductData}
                    FormData={FormData}
                />
            }
            {QaytarishPartiyaSelectModal &&
                <QaytarishSelect
                    onClose={() => setQaytarishPartiyaSelectModal(false)}
                    ProductData={QaytarishPartiya}
                    FormData={FormData}
                />
            }

            {Productadd &&
                <ProductQoshish
                    item={ProductData}
                    onClose={() => setProductadd(false)}
                    FormData={FormData}
                />
            }
        </>
    );
}
