import { useEffect, useMemo, useState, useCallback } from "react";
import "./cart.css";
import QrModal from "../QrModal/qrModal";
import ProductQoshish from "./ProductQoshish";
import TovarModal from "./product";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import ModalHeader from "../BuyurtmaModal/ModalHeader";
import { getUser } from "../../leyout/login/auth";
import { format, parseISO } from "date-fns";

export default function CartModal({ onExit, qaytarish, KorzinkaModal, onClose, }) {

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState({ tovarlar: [] });
    const [sending, setSending] = useState(false);
    const CART_KEY = qaytarish ? "qaytarish" : "buyurtma_cart"; const FormData_KEY = "formData";
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const [ShtrixModal, setShtrixModal] = useState(false);
    const [shtrixData, setshtrixData] = useState([]);
    const [ProductData, setProductData] = useState(null);
    const [Productadd, setProductadd] = useState(false);
    const user = getUser();
    const loadCart = () => {
        try {
            const data = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
            const cartData = {
                date: data?.date || '',
                mijoz_code: FormData?.kontragent_id,
                ost_sum: FormData?.dt_kt_sum,
                ost_val: FormData?.dt_kt_val,
                vid_val: FormData?.valyuta_turi,
                narh_turi: FormData?.narh_turi,
                user_code: user?.code,
                tovarlar: Array.isArray(data?.tovarlar) ? data.tovarlar : [],
            };

            setCart(cartData);

        } catch {
            setCart({
                date: date,
                mijoz_code: FormData?.kontragent_id,
                ost_sum: FormData?.dt_kt_sum,
                ost_val: FormData?.dt_kt_val,
                vid_val: FormData?.valyuta_turi,
                narh_turi: FormData?.narh_turi,
                tovarlar: [],
            });
        }
    };
    useEffect(() => {
        loadCart();
    }, []);
    // qidiruv
    const filtered = useMemo(() => {

        const items = cart?.tovarlar || [];

        if (!search.trim()) return items;

        const q = search.toLowerCase();

        return items.filter(item =>
            item.name?.toLowerCase().includes(q) ||
            item.tovar_code?.toLowerCase().includes(q)
        );

    }, [search, cart]);

    // jami summa
    const totalSum = useMemo(() => {
        return (cart?.tovarlar || []).reduce(
            (acc, item) => acc + (parseFloat(item.Summa) || 0),
            0
        );
    }, [cart?.tovarlar]);

    // delete
    const handleDelete = (itemId) => {
        Swal.fire({
            title: "O'chirilsinmi?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ha",
            cancelButtonText: "Yo'q",
            confirmButtonColor: "#006CAC",
        }).then(res => {
            if (!res.isConfirmed) return;

            const newTovarlar = cart.tovarlar.filter(i => i.itemId !== itemId);

            // ✅ Oxirgi tovar o'chirilsa — ikkalasini ham tozala
            if (newTovarlar.length === 0) {
                localStorage.removeItem(CART_KEY);
                localStorage.removeItem(FormData_KEY);
                setCart({ tovarlar: [] });
                return;
            }

            const updated = { ...cart, tovarlar: newTovarlar };
            localStorage.setItem(CART_KEY, JSON.stringify(updated));
            setCart(updated);
        });
    };
    // buyurtmani yuborish
    const handleYopish = async () => {
        const items = cart?.tovarlar || [];

        if (items.length === 0) return;

        const confirm = await Swal.fire({
            title: "Buyurtmani yopish",
            text: `${items.length} ta mahsulot yuboriladi`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yuborish",
            cancelButtonText: "Bekor",
            confirmButtonColor: "#006CAC",
        });

        if (!confirm.isConfirmed) return;

        setSending(true);

        try {
            const result = await apiPost("tovuq/hs/realiz/get_realiz", cart);

            // ===== QO‘SHIMCHA BUYURTMALAR LOCALGA SAQLASH =====
            const oldOrders = JSON.parse(localStorage.getItem("buyurtmalar") || "[]");

            const newOrder = {
                id: Date.now(),
                sana: new Date().toLocaleString("uz-UZ"),
                data: cart,
            };

            localStorage.setItem(
                "buyurtmalar",
                JSON.stringify([...oldOrders, newOrder])
            );
            // ================================================

            localStorage.removeItem(CART_KEY);
            localStorage.removeItem(FormData_KEY);

            setCart({ tovarlar: [] });
            onExit();
            Swal.fire({
                icon: "success",
                title: "Muvaffaqiyatli!",
                text: "Buyurtma yuborildi va saqlandi",
                confirmButtonColor: "#006CAC",
                timer: 500,
                showConfirmButton: false,
            });

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
    const handleQaytarish = async () => {
        const items = cart?.tovarlar || [];
        if (items.length === 0) return;

        const cleanedItems = items.map(item => ({
            ...item,

            term: item.term ? item.term.split(" ")[0] : "",
        }));

        const newData = {
            ...cart,
            term: cleanedItems[0]?.term || "",
            tovarlar: cleanedItems,
        };

        console.log("Yuboriladigan data:", newData);

        const confirm = await Swal.fire({
            title: "Mahsulotni qaytarish",
            text: `${items.length} ta mahsulot yuboriladi`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yuborish",
            cancelButtonText: "Bekor",
            confirmButtonColor: "#006CAC",
        });

        if (!confirm.isConfirmed) return;
        setSending(true);

        try {
            const result = await apiPost("tovuq/hs/vozvrat/post_vozvrat/", newData);

            localStorage.removeItem(CART_KEY);
            localStorage.removeItem(FormData_KEY);
            setCart({ tovarlar: [] });
            onExit();

            Swal.fire({
                icon: "success",
                title: "Muvaffaqiyatli!",
                text: "Mahsulot qaytarildi",
                confirmButtonColor: "#006CAC",
            });

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
                <div className="app-safe">
                    {/* header */}
                    <ModalHeader
                        activeTab="koriznka"
                        onSotib={() => KorzinkaModal?.()}
                        onKoriznka={() => { }}
                        onSkaner={() => setShtrixModal(prev => !prev)}
                    />

                    <div className="modal"
                        style={{ height: '100vh', width: '100%', borderRadius: "0px", }}
                    >
                        <div className="modal-title" style={{
                            justifyContent: 'space-between',
                            margin: '0px 0',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={onClose}
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
                            <span>{qaytarish ? 'Qaytarish' : 'Savatcha'}</span>
                            <span style={{ width: 32 }} />
                        </div>
                        {/* search */}
                        <div className="search" style={{ marginTop: '10px' }}>
                            <input
                                type="text"
                                placeholder="Barchasidan qidirish..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {(user?.rol === "1" || user?.narx_korish) && (
                            <>
                                <div className="cart-total">
                                    <span className="cart-total-label">
                                        Jami summa:
                                    </span>

                                    <span className="cart-total-value">
                                        {totalSum.toLocaleString("uz-UZ")} {cart?.vid_val === '1' ? "So'm" : "$"}
                                    </span>
                                </div>
                            </>
                        )}
                        {/* jami summa */}


                        {/* cart items */}
                        {filtered.length === 0 ? (
                            <p style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                                Korzinka bo'sh
                            </p>
                        ) : (

                            <div className="cart-list" style={{ marginTop: '20px' }}>

                                {filtered.map(item => (

                                    <div className="cart-item" key={item.itemId}>

                                        <div className="cart-item-left">

                                            <div className="cart-item-name">
                                                {item.name}
                                            </div>

                                            <div className="cart-item-sub">
                                                Soni: {item.soni}
                                            </div>
                                            {(user?.rol === "1" || user?.narx_korish) && (
                                                <>
                                                    <div className="cart-item-narx">
                                                        {Number(item.Summa).toLocaleString("uz-UZ")} {cart?.vid_val === '1' ? "So'm" : "$"}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="cart-item-right">
                                            <button
                                                className="cart-item-delete"
                                                onClick={() => handleDelete(item.itemId)}
                                            >
                                                <svg color="#fff" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                ))}

                            </div>

                        )}
                        <button
                            className="cart-yopish-btn"
                            onClick={qaytarish ? handleQaytarish : handleYopish}
                            disabled={sending || !cart?.tovarlar?.length}
                        >
                            {sending ? "Yuborilmoqda..." : "BUYURTMANI YOPISH"}
                        </button>
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
        </>
    );
}
