import { useEffect, useMemo, useState, useCallback } from "react";
import "./korzinka.css";
import { loadProducts, loadImage } from "../../utils/storage";
import QrModal from "../QrModal/qrModal";
import ProductQoshish from "./ProductQoshish";
import TovarModal from "./product";
import Swal from "sweetalert2";
import ModalHeader from "../BuyurtmaModal/ModalHeader";
import { useBackHandler } from "../../utils/backButtonStack";

// ═══ ProductCard ═══
function ProductCard({ item, search, highlightText, onClick, KorzinkaModal }) {
    const [imgSrc, setImgSrc] = useState(null);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    useEffect(() => {
        if (item.i) loadImage(item.i).then(src => setImgSrc(src));
    }, [item.i]);

    return (
        <div className="product" onClick={() => onClick?.()}>
            {imgSrc
                ? <img src={imgSrc} alt={item.n} className="product-image" />
                : <div className="product-image product-placeholder" />
            }
            <p>{highlightText(item.n, search)}</p>
        </div>
    );
}
export default function KorzinkaModal({qaytarish,  onClose, handleModal, KorzinkaModal, allClose }) {
    const [search, setSearch] = useState('');
    const [ProductGroup, setProductGroup] = useState([]);
    const [ShtrixModal, setShtrixModal] = useState(false);
    const [Products, setProducts] = useState(null); // ← null = yopiq, string = groupCode
    const [shtrixData, setshtrixData] = useState([]);
    const [ProductData, setProductData] = useState(null);
    const [Productadd, setProductadd] = useState(false);
    const [ProductGroupLoading, setProductGroupLoading] = useState(true);
    const [ProductGroupError, setProductGroupError] = useState(null);
    const CART_KEY = "buyurtma_cart";
    const Qaytarish_KEY = "qaytarish";
    const FormData_KEY = "formData";
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const Buyurtma_cart = JSON.parse(localStorage.getItem("buyurtma_cart") || "{}");
    const handleBackClose = useCallback(async () => {
        const cartData = localStorage.getItem(CART_KEY);
        const formData = localStorage.getItem(FormData_KEY);

        if (cartData || formData) {
            const result = await Swal.fire({
                title: "Chiqishni xohlaysizmi?",
                text: "Chiqsangiz, saqlangan buyurtma ma'lumotlari o'chiriladi.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ha, chiqish",
                cancelButtonText: "Bekor qilish",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });

            if (result.isConfirmed) {
                localStorage.removeItem(CART_KEY);
                localStorage.removeItem(Qaytarish_KEY);
                localStorage.removeItem(FormData_KEY);
                handleModal();
            }

            return;
        }

        handleModal();
    }, [handleModal]);

    useBackHandler(handleBackClose);

    useEffect(() => {
        loadProducts()
            .then(data => setProductGroup(data || []))
            .catch(err => setProductGroupError(err.message))
            .finally(() => setProductGroupLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return ProductGroup;
        const tokens = search.toLowerCase().trim().split(/\s+/);
        return ProductGroup.filter((doc) => {
            const haystack = [doc.n, doc.c]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
    }, [search, ProductGroup]);

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
    return (
        <>
            <div className="overlay" style={{ flexDirection: 'column' }}>
                <div className="app-safe" style={{ height: '100vh', width: '100%', borderRadius: "0px",  }}>

                    <ModalHeader
                        activeTab="sotib"
                        qaytarish={qaytarish}
                        onSotib={() => { }}
                        onKoriznka={() => KorzinkaModal?.()}
                        onSkaner={() => setShtrixModal(prev => !prev)}
                    />
                    <div className="modal" style={{ height: '100vh', width: '100%', borderRadius: "0px",  }}>
                        <div className="modal-title" style={{
                            justifyContent: 'space-between',
                            margin: '0px 0',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={handleBackClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M19 12H5M5 12L12 19M5 12L12 5"
                                        stroke="#006CAC"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <span>Tovarlar guruhi</span>
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
                            <div className="products">
                                {filtered.map((item) => (
                                    <ProductCard
                                        key={item.c}
                                        item={item}
                                        search={search}
                                        highlightText={highlightText}
                                        onClick={() => setProducts(item.c)} // ← group kodi
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

            {/* ✅ Products = groupCode bo'lganda ochiladi */}
            {Products &&
                <TovarModal
                    groupCode={Products}
                    onClose={() => setProducts(null)}
                    onKoriznka={handleModal}
                    FormData={FormData}
                    allClose={allClose}
                    onSkaner={() => setShtrixModal(prev => !prev)}
                    KorzinkaModal={KorzinkaModal}
                    qaytarish={qaytarish}
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
