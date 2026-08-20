import { useCallback, useEffect, useMemo, useState } from "react";
import "../../componrnts/Korzinka/cart.css";
import QrModal from "../../componrnts/QrModal/qrModal";
import ProductQoshish from "./ProductQoshish";
import KirimProductQoshish from "../mahsulotKirimi/ProductQoshish";
import TovarModal from "./Mahsulotlar";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import ModalHeader from "../../componrnts/BuyurtmaModal/ModalHeader";
import MahsulotYaratishModal from "../mahsulotKirimi/MahsulotYaratishModal";
import { getUser } from "../../leyout/login/auth";
import { format } from "date-fns";
import { useBackHandler } from "../../utils/backButtonStack";
import { QUEUE_TYPES, saveQueueItem } from "../../utils/offlineQueue";
import { getCartItemTotal, toNumber } from "../../utils/queueSummary";
import { makeSavdoItemId } from "../../utils/savdoIdentity";
import { SAVDO_SEND_ENDPOINT, saveOrderHistory } from "../../utils/savdoHistory";
import { canViewPrice, sanitizeDebtFields, sanitizePriceItem } from "../../utils/permissions";
import QuantityInput from "../../componrnts/QuantityInput/QuantityInput";
import { formatQty, parseQty } from "../../utils/quantity";
import { clearCart, getCartKey, getFormKey, readCart, useCartCount, writeCart } from "../../utils/cart";
import { getReservedQty, useReservedPartiya } from "../../utils/partiya";
import { fuzzySearch } from "../../utils/fuzzySearch";

const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export default function CartModal({ onExit, qaytarish, kirim = false, boshQoldiq = false, KorzinkaModal, onClose, }) {

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState(null);
    const [sending, setSending] = useState(false);
    const CART_KEY = getCartKey({ qaytarish, kirim, boshQoldiq });
    const FormData_KEY = getFormKey({ qaytarish, kirim, boshQoldiq });
    const FormData = JSON.parse(localStorage.getItem(FormData_KEY) || "{}");
    const [ShtrixModal, setShtrixModal] = useState(false);
    const [openMahsulotYaratish, setOpenMahsulotYaratish] = useState(false);
    const [shtrixData, setshtrixData] = useState([]);
    const [ProductData, setProductData] = useState(null);
    const [Productadd, setProductadd] = useState(false);
    const [qtyDraft, setQtyDraft] = useState({});
    const { reserved } = useReservedPartiya();
    const cartCount = useCartCount(CART_KEY);
    const user = getUser();
    const canSeePrice = canViewPrice(user);
    useBackHandler(onClose);

    const loadCart = useCallback(() => {
        try {
            const data = readCart(CART_KEY);
            const cartData = sanitizeDebtFields({
                date: data?.date || '',
                mijoz_code: FormData?.kontragent_id,
                ost_sum: FormData?.dt_kt_sum,
                ost_val: FormData?.dt_kt_val,
                vid_val: FormData?.valyuta_turi,
                narh_turi: FormData?.narh_turi,
                user_code: user?.code,
                tovarlar: Array.isArray(data?.tovarlar) ? data.tovarlar : [],
            }, user);

            setCart(cartData);

        } catch {
            setCart(sanitizeDebtFields({
                date: format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                mijoz_code: FormData?.kontragent_id,
                ost_sum: FormData?.dt_kt_sum,
                ost_val: FormData?.dt_kt_val,
                vid_val: FormData?.valyuta_turi,
                narh_turi: FormData?.narh_turi,
                tovarlar: [],
            }, user));
        }
    }, [
        CART_KEY,
        FormData?.dt_kt_sum,
        FormData?.dt_kt_val,
        FormData?.kontragent_id,
        FormData?.narh_turi,
        FormData?.valyuta_turi,
        user,
    ]);
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const cartLoaded = cart !== null;
    const cartItems = useMemo(() => cart?.tovarlar || [], [cart?.tovarlar]);

    // qidiruv — imloviy xatolarga chidamli
    const filtered = useMemo(() => (
        fuzzySearch(cartItems, search, item => `${item?.name || ""} ${item?.tovar_code || ""}`)
    ), [search, cartItems]);

    // jami summa
    const totalSum = useMemo(() => {
        return (cart?.tovarlar || []).reduce(
            (acc, item) => acc + (parseFloat(item.Summa) || 0),
            0
        );
    }, [cart?.tovarlar]);
    const totalQuantity = useMemo(
        () => cartItems.reduce((sum, item) => sum + toNumber(item.soni), 0),
        [cartItems]
    );

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
        return cartItems.map(item => sanitizePriceItem({
            ...item,
            // Yaroqlilik muddati kiritilmagan bo'lsa 1C ga "0" ketadi
            term: (kirim || boshQoldiq) ? (item.term || "0") : item.term,
            Summa: getCartItemTotal(item),
        }, user));
    }, [cartItems, user, kirim, boshQoldiq]);

    // Savatdagi mahsulot uchun ruxsat etilgan maksimal miqdor:
    // partiya qoldig'i − yuborilmagan savdolarda band qilingani
    const getMaxSoni = useCallback((item) => {
        if (kirim || boshQoldiq || qaytarish) return null;

        const qoldiq = toNumber(item?.qoldiq);
        if (qoldiq <= 0) return null;

        const available = qoldiq - getReservedQty(item, reserved);
        return available > 0 ? available : 0;
    }, [kirim, boshQoldiq, qaytarish, reserved]);

    const persistCart = useCallback((tovarlar) => {
        const updated = { ...cart, tovarlar };
        writeCart(CART_KEY, updated);
        setCart(updated);
    }, [cart, CART_KEY]);

    // delete
    const handleDelete = useCallback((itemId) => {
        if (!cartLoaded) return Promise.resolve(false);

        return Swal.fire({
            title: "O'chirilsinmi?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ha",
            cancelButtonText: "Yo'q",
            confirmButtonColor: "#006CAC",
        }).then(res => {
            if (!res.isConfirmed) return false;

            const newTovarlar = cartItems.filter(i => i.itemId !== itemId);

            // ✅ Oxirgi tovar o'chirilsa — ikkalasini ham tozala
            if (newTovarlar.length === 0) {
                clearCart(CART_KEY, FormData_KEY);
                setCart({ tovarlar: [] });
                return true;
            }

            persistCart(newTovarlar);
            return true;
        });
    }, [cartLoaded, cartItems, CART_KEY, FormData_KEY, persistCart]);

    // Miqdorni saqlash (summalar qayta hisoblanadi)
    const applySoni = useCallback((item, soni) => {
        const newTovarlar = cartItems.map((row) => {
            if (row.itemId !== item.itemId) return row;

            const narh = toNumber(row.narh);
            const kirimNarhSum = toNumber(row.kirim_narh_sum);
            const kirimNarhVal = toNumber(row.kirim_narh_val);

            return {
                ...row,
                soni,
                Summa: narh * soni,
                kirim_summa_sum: kirimNarhSum * soni,
                kirim_summa_val: kirimNarhVal * soni,
            };
        });

        persistCart(newTovarlar);
    }, [cartItems, persistCart]);

    const handleSoniChange = (item, raw) => {
        setQtyDraft(prev => ({ ...prev, [item.itemId]: raw }));

        const soni = parseQty(raw);
        if (raw === "" || soni <= 0) return;

        applySoni(item, soni);
    };

    // Blur yoki −/+ tugmasidan keyin yakuniy qiymatni qayd etish
    const handleSoniBlur = (item, soni) => {
        setQtyDraft((prev) => {
            const next = { ...prev };
            delete next[item.itemId];
            return next;
        });

        // 0 kiritilsa — mahsulotni savatdan olib tashlash taklif qilinadi
        if (soni <= 0) {
            handleDelete(item.itemId);
            return;
        }

        if (soni !== toNumber(item.soni)) applySoni(item, soni);
    };

    const handleLimit = (item, max) => {
        Swal.fire({
            icon: "warning",
            toast: true,
            position: "top",
            title: `Partiyada faqat ${formatQty(max)} ${item?.ul_bir || ""} qoldi`,
            showConfirmButton: false,
            timer: 1600,
            timerProgressBar: true,
        });
    };
    // Savdoni serverga yuborish (xato bo'lsa — yuborilmagan savdolarga saqlanadi)
    const handleYopish = async () => {
        const items = cartItems;

        if (items.length === 0) return;

        if (boshQoldiq) {
            const { value: izoh, isConfirmed } = await Swal.fire({
                title: "Boshlang'ich qoldiqni yuborish",
                html: `<p style="margin:0 0 10px">${items.length} ta mahsulot boshlang'ich qoldiq sifatida yuboriladi</p>`,
                input: "textarea",
                inputPlaceholder: "Izoh (ixtiyoriy)...",
                showCancelButton: true,
                confirmButtonText: "Yuborish",
                cancelButtonText: "Bekor",
                confirmButtonColor: "#006CAC",
            });

            if (!isConfirmed) return;

            setSending(true);

            try {
                const payload = {
                    date: format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                    user_code: user?.code || "",
                    mijoz_code: "0",
                    ost_sum: "0",
                    ost_val: "0",
                    invoys_code: "0",
                    bosh_qoldiq: 2,
                    izoh: izoh || "",
                    tovarlar: itemsWithTotals.map(item => ({
                        term: item.term || "0",
                        tovar_code: item.tovar_code,
                        soni: item.soni,
                        narh: item.narh,
                        Summa: item.Summa,
                    })),
                };

                await apiPost("tovuq/hs/postup/get_postup/", payload);

                clearCart(CART_KEY, FormData_KEY);

                setCart({ tovarlar: [] });
                onExit?.();
                Swal.fire({
                    icon: "success",
                    title: "Yuborildi!",
                    text: "Boshlang'ich qoldiq yuborildi",
                    confirmButtonColor: "#006CAC",
                    timer: 1500,
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

            return;
        }

        const confirm = await Swal.fire({
            title: kirim ? "Mahsulot kirimini yuborish" : "Savdoni yuborish",
            text: kirim
                ? `${items.length} ta mahsulot kirim sifatida yuboriladi`
                : `${items.length} ta mahsulot serverga yuboriladi`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yuborish",
            cancelButtonText: "Bekor",
            confirmButtonColor: "#006CAC",
        });

        if (!confirm.isConfirmed) return;

        setSending(true);

        try {
            if (kirim) {
                const postupPayload = {
                    ...cart,
                    date: cart?.date || format(new Date(), "dd.MM.yyyy HH:mm:ss"),
                    invoys_code: FormData?.invoys_code || "",
                    invoys_number: FormData?.invoys_number || "",
                    bosh_qoldiq: "1",
                    tovarlar: itemsWithTotals,
                };

                await apiPost("tovuq/hs/postup/get_postup/", postupPayload);

                clearCart(CART_KEY, FormData_KEY);
                setCart({ tovarlar: [] });
                onExit?.();

                Swal.fire({
                    icon: "success",
                    title: "Yuborildi!",
                    text: "Mahsulot kirimi yuborildi",
                    confirmButtonColor: "#006CAC",
                    timer: 1500,
                    showConfirmButton: false,
                });

                return;
            }

            const itemId = makeSavdoItemId();
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

            // Savdo avval to'g'ridan-to'g'ri serverga yuboriladi.
            // Faqat internet yoki server muammosi bo'lsa — yuborilmagan savdolarga saqlanadi.
            let sendError = null;

            try {
                const res = await apiPost(SAVDO_SEND_ENDPOINT, { realiz: [newOrder.data] });

                // Server 200 qaytarib, javobda xato yozsa ham — yuborilmagan deb hisoblaymiz
                const serverError = res?.error || res?.Error || res?.xato;
                if (serverError) throw new Error(String(serverError));

                saveOrderHistory(newOrder);
            } catch (err) {
                sendError = err;
                await saveQueueItem(QUEUE_TYPES.SAVDOLAR, newOrder);
            }

            clearCart(CART_KEY, FormData_KEY);
            setCart({ tovarlar: [] });
            onExit?.();

            if (sendError) {
                Swal.fire({
                    icon: "warning",
                    title: "Serverga yuborilmadi",
                    html: "Savdo <b>yuborilmagan savdolar</b>ga saqlandi va aloqa tiklanganda yuboriladi."
                        + `<br><small style="color:#888">${escapeHtml(sendError.message)}</small>`,
                    confirmButtonColor: "#006CAC",
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Yuborildi!",
                    text: "Savdo serverga yuborildi",
                    confirmButtonColor: "#006CAC",
                    timer: 1200,
                    showConfirmButton: false,
                });
            }

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

        const cleanedItems = items.map(item => sanitizePriceItem({
            ...item,

            term: item.term ? item.term.split(" ")[0] : "",
        }, user));

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

            clearCart(CART_KEY, FormData_KEY);
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
                        cartCount={cartCount}
                        qaytarish={qaytarish}
                        kirim={kirim}
                        boshQoldiq={boshQoldiq}
                        onSkaner={() => kirim ? setOpenMahsulotYaratish(true) : setShtrixModal(prev => !prev)}
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
                            <span>
                                {qaytarish ? 'Qaytarish' : boshQoldiq ? "Qoldiq savati" : kirim ? 'Kirim savati' : 'Savatcha'}
                                {cartItems.length > 0 && ` (${cartItems.length})`}
                            </span>
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
                        {/* savatdagi mahsulotlar soni */}
                        <div className="cart-count">
                            <span className="cart-count-badge">{cartItems.length}</span>
                            <span className="cart-count-label">
                                xil mahsulot
                                {totalQuantity > 0 && ` · jami ${formatQty(totalQuantity)}`}
                            </span>
                            {search.trim() && filtered.length !== cartItems.length && (
                                <span className="cart-count-filtered">
                                    topildi: {filtered.length}
                                </span>
                            )}
                        </div>
                        {canSeePrice && (
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
                                                Miqdor: {formatQty(item.soni)} {item.ul_bir || ""}
                                                {getMaxSoni(item) !== null && (
                                                    <span className="cart-item-limit">
                                                        {" "}/ mavjud: {formatQty(getMaxSoni(item))}
                                                    </span>
                                                )}
                                            </div>
                                            {canSeePrice && (
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
                                            <QuantityInput
                                                value={qtyDraft[item.itemId] ?? String(toNumber(item.soni))}
                                                onChange={(raw) => handleSoniChange(item, raw)}
                                                onCommit={(soni) => handleSoniBlur(item, soni)}
                                                onLimit={(max) => handleLimit(item, max)}
                                                max={getMaxSoni(item)}
                                                min={0}
                                                variant="cart"
                                            />
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
                                ? "Yuborilmoqda..."
                                : (qaytarish ? "BUYURTMANI YOPISH" : "YUBORISH")}
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
                    boshQoldiq={boshQoldiq}
                />;
            })()}
            {openMahsulotYaratish && (
                <MahsulotYaratishModal
                    onClose={() => setOpenMahsulotYaratish(false)}
                    onCreated={(product) => {
                        setOpenMahsulotYaratish(false);
                        setProductData(product);
                        setProductadd(true);
                    }}
                />
            )}
        </>
    );
}
