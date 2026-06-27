import { useCallback, useEffect, useMemo, useState } from "react";
import "../../componrnts/Korzinka/cart.css";
import QrModal from "../../componrnts/QrModal/qrModal";
import ProductQoshish from "./ProductQoshish";
import KirimProductQoshish from "../mahsulotKirimi/ProductQoshish";
import TovarModal from "./Mahsulotlar";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import ModalHeader from "../../componrnts/BuyurtmaModal/ModalHeader";
import { getUser } from "../../leyout/login/auth";
import { format } from "date-fns";
import { useBackHandler } from "../../utils/backButtonStack";
import { QUEUE_TYPES, saveQueueItem } from "../../utils/offlineQueue";
import { getCartItemTotal } from "../../utils/queueSummary";
import { makeSavdoItemId } from "../../utils/savdoIdentity";
import { saveKirimHistory } from "../mahsulotKirimi/storage";

export default function CartModal({ onExit, qaytarish, kirim = false, KorzinkaModal, onClose, }) {

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState(null);
    const [sending, setSending] = useState(false);
    const CART_KEY = qaytarish ? "qaytarish" : kirim ? "mahsulot_kirimi_cart" : "buyurtma_cart";
    const FormData_KEY = kirim ? "mahsulot_kirimi_form" : "formData";
    const FormData = JSON.parse(localStorage.getItem(FormData_KEY) || "{}");
    const [ShtrixModal, setShtrixModal] = useState(false);
    const [shtrixData, setshtrixData] = useState([]);
    const [ProductData, setProductData] = useState(null);
    const [Productadd, setProductadd] = useState(false);
    const user = getUser();
    useBackHandler(onClose);

    const loadCart = useCallback(() => {
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
                date: format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                mijoz_code: FormData?.kontragent_id,
                ost_sum: FormData?.dt_kt_sum,
                ost_val: FormData?.dt_kt_val,
                vid_val: FormData?.valyuta_turi,
                narh_turi: FormData?.narh_turi,
                tovarlar: [],
            });
        }
    }, [
        CART_KEY,
        FormData?.dt_kt_sum,
        FormData?.dt_kt_val,
        FormData?.kontragent_id,
        FormData?.narh_turi,
        FormData?.valyuta_turi,
        user?.code,
    ]);
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const cartLoaded = cart !== null;
    const cartItems = useMemo(() => cart?.tovarlar || [], [cart?.tovarlar]);

    // qidiruv
    const filtered = useMemo(() => {
        if (!search.trim()) return cartItems;

        const q = search.toLowerCase();

        return cartItems.filter(item =>
            item.name?.toLowerCase().includes(q) ||
            item.tovar_code?.toLowerCase().includes(q)
        );

    }, [search, cartItems]);

    // jami summa
    const totalSum = useMemo(() => {
        return (cart?.tovarlar || []).reduce(
            (acc, item) => acc + (parseFloat(item.Summa) || 0),
            0
        );
    }, [cart?.tovarlar]);
    const kirimTotals = useMemo(() => {
        return cartItems.reduce((totals, item) => {
            if (String(item.valyuta_turi) === "2") {
                totals.val += parseFloat(item.Summa) || 0;
            } else {
                totals.sum += parseFloat(item.Summa) || 0;
            }
            return totals;
        }, { sum: 0, val: 0 });
    }, [cartItems]);

    const itemsWithTotals = useMemo(() => {
        return cartItems.map(item => ({
            ...item,
            Summa: getCartItemTotal(item),
        }));
    }, [cartItems]);

    // delete
    const handleDelete = (itemId) => {
        if (!cartLoaded) return;

        Swal.fire({
            title: "O'chirilsinmi?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ha",
            cancelButtonText: "Yo'q",
            confirmButtonColor: "#006CAC",
        }).then(res => {
            if (!res.isConfirmed) return;

            const newTovarlar = cartItems.filter(i => i.itemId !== itemId);

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
    // buyurtmani localga saqlash
    const handleYopish = async () => {
        const items = cartItems;

        if (items.length === 0) return;

        const confirm = await Swal.fire({
            title: kirim ? "Mahsulot kirimini saqlash" : "Savdoni saqlash",
            text: kirim
                ? `${items.length} ta mahsulot kirimga saqlanadi`
                : `${items.length} ta mahsulot yuborilmagan savdolarga qo'shiladi`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Saqlash",
            cancelButtonText: "Bekor",
            confirmButtonColor: "#006CAC",
        });

        if (!confirm.isConfirmed) return;

        setSending(true);

        try {
            const itemId = kirim
                ? (globalThis.crypto?.randomUUID?.() || `kirim_${Date.now()}`)
                : makeSavdoItemId();
            const newOrder = {
                id: itemId,
                itemId,
                name: FormData?.kontragent || cart?.mijoz_code || "Noma'lum mijoz",
                sana: new Date().toLocaleString("uz-UZ"),
                created_at: new Date().toISOString(),
                data: {
                    ...cart,
                    itemId,
                    date: cart?.date || format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                    tovarlar: itemsWithTotals,
                },
            };

            if (kirim) {
                saveKirimHistory({
                    id: itemId,
                    itemId,
                    date: newOrder.data.date,
                    taminotchi_code: FormData?.kontragent_id || "",
                    taminotchi_name: FormData?.kontragent || "",
                    user_code: user?.code || "",
                    tovarlar: itemsWithTotals,
                    created_at: newOrder.created_at,
                    status: "local",
                });
            } else {
                await saveQueueItem(QUEUE_TYPES.SAVDOLAR, newOrder);
            }

            localStorage.removeItem(CART_KEY);
            localStorage.removeItem(FormData_KEY);

            setCart({ tovarlar: [] });
            onExit?.();
            Swal.fire({
                icon: "success",
                title: "Saqlandi!",
                text: kirim
                    ? "Mahsulot kirimi saqlandi"
                    : "Savdo yuborilmagan savdolarga qo'shildi",
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
        const items = cartItems;
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
            await apiPost("tovuq/hs/vozvrat/post_vozvrat/", newData);

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
                <div className="app-safe cart-safe">
                    {/* header */}
                    <ModalHeader
                        activeTab="koriznka"
                        onSotib={() => KorzinkaModal?.()}
                        onKoriznka={() => { }}
                        qaytarish={qaytarish}
                        kirim={kirim}
                        onSkaner={() => setShtrixModal(prev => !prev)}
                    />

                    <div className="modal cart-modal"
                        style={{ width: '100%', borderRadius: "0px", }}
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
                            <span>{qaytarish ? 'Qaytarish' : kirim ? 'Kirim savati' : 'Savatcha'}</span>
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
                                        {kirim
                                            ? (
                                                <>
                                                    {kirimTotals.sum.toLocaleString("uz-UZ")} So&apos;m
                                                    {kirimTotals.val > 0 && ` · ${kirimTotals.val.toLocaleString("uz-UZ")} $`}
                                                </>
                                            )
                                            : `${totalSum.toLocaleString("uz-UZ")} ${cart?.vid_val === '1' ? "So'm" : "$"}`
                                        }
                                    </span>
                                </div>
                            </>
                        )}
                        {/* jami summa */}


                        {/* cart items */}
                        {!cartLoaded ? null : filtered.length === 0 ? (
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
                                                Miqdor: {item.soni}
                                            </div>
                                            {(user?.rol === "1" || user?.narx_korish) && (
                                                <>
                                                    <div className="cart-item-narx">
                                                        {Number(item.Summa).toLocaleString("uz-UZ")} {
                                                            kirim
                                                                ? (String(item.valyuta_turi) === "2" ? "$" : "So'm")
                                                                : (cart?.vid_val === '1' ? "So'm" : "$")
                                                        }
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="cart-item-right">
                                            <button
                                                className="cart-item-delete"
                                                onClick={() => handleDelete(item.itemId)}
                                            >
                                                <svg color="#fff" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                ))}

                            </div>

                        )}
                        <button
                            className="cart-yopish-btn"
                            onClick={qaytarish ? handleQaytarish : handleYopish}
                            disabled={sending || !cartLoaded || cartItems.length === 0}
                        >
                            {sending
                                ? (qaytarish ? "Yuborilmoqda..." : "Saqlanmoqda...")
                                : (qaytarish ? "BUYURTMANI YOPISH" : "SAQLASH")}
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
            {Productadd && (() => {
                const ActiveProductQoshish = kirim ? KirimProductQoshish : ProductQoshish;
                return <ActiveProductQoshish
                    item={ProductData}
                    onClose={() => setProductadd(false)}
                    FormData={FormData}
                />;
            })()}
        </>
    );
}
