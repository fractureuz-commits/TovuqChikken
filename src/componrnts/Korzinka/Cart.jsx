import { useEffect, useMemo, useState, useCallback } from "react";
import "./cart.css";
import QrModal from "../QrModal/qrModal";
import ProductQoshish from "./ProductQoshish";
import TovarModal from "./product";
import Swal from "sweetalert2";
import { apiPost } from "../../utils/api";
import ModalHeader from "../BuyurtmaModal/ModalHeader";

export default function CartModal({ KorzinkaModal ,onClose,}) {

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState({ tovarlar: [] });
    const [sending, setSending] = useState(false);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    
    const CART_KEY = "buyurtma_cart";
    const FormData_KEY = "formData";
    
    // localStorage dan o'qish
    const loadCart = () => {
        const data = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
        if (!data.tovarlar) {
            setCart({ tovarlar: [] });
        } else {
            setCart(data);
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

            const updated = {
                ...cart,
                tovarlar: cart.tovarlar.filter(i => i.itemId !== itemId)
            };

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
            const result = await apiPost("tovuq-api/tovuq/hs/realiz/get_realiz", cart);
            localStorage.removeItem(CART_KEY);
            localStorage.removeItem(FormData_KEY);
            setCart({ tovarlar: [] });
            onClose()
            Swal.fire({
                icon: "success",
                title: "Buyurtma yuborildi!",
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
    };

    return (
        <div className="overlay" style={{ flexDirection: 'column' }}>

            {/* header */}
            <ModalHeader
                activeTab="koriznka"
                onSotib={() => KorzinkaModal?.()}
                onKoriznka={() => { }}
            />

            <div className="modal"
                style={{
                    height: '95vh',
                    width: '100%',
                    borderRadius: "0px",
                    display: 'flex',
                    flexDirection: 'column',
                    paddingBottom: '80px'
                }}
            >

                {/* search */}
                <div className="search" style={{ marginTop: '10px' }}>
                    <input
                        type="text"
                        placeholder="Barchasidan qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* jami summa */}
                <div className="cart-total">
                    <span className="cart-total-label">
                        Jami summa:
                    </span>

                    <span className="cart-total-value">
                        {totalSum.toLocaleString("uz-UZ")} {cart?.vid_val === '1' ? "So'm" : "$"}
                    </span>
                </div>

                {/* cart items */}
                {filtered.length === 0 ? (

                    <p style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                        Korzinka bo'sh
                    </p>

                ) : (

                    <div className="cart-list">

                        {filtered.map(item => (

                            <div className="cart-item" key={item.itemId}>

                                <div className="cart-item-left">

                                    <div className="cart-item-name">
                                        {item.name}
                                    </div>

                                    <div className="cart-item-sub">
                                        Soni: {item.soni}
                                    </div>

                                    <div className="cart-item-narx">
                                        {Number(item.Summa).toLocaleString("uz-UZ")} {cart?.vid_val === '1' ? "So'm" : "$"}
                                    </div>

                                </div>

                                <div className="cart-item-right">
                                    <button
                                        className="cart-item-delete"
                                        onClick={() => handleDelete(item.itemId)}
                                    >
                                        <svg color="#fff" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                        ))}

                    </div>

                )}
                <button
                    className="cart-yopish-btn"
                    onClick={handleYopish}
                    disabled={sending || !cart?.tovarlar?.length}
                >
                    {sending ? "Yuborilmoqda..." : "BUYURTMANI YOPISH"}
                </button>
            </div>

        </div>
    );
}
