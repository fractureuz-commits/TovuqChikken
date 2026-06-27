import { useCallback, useEffect, useMemo, useState } from "react";
import "./tolov.css";
import Swal from "sweetalert2";
import { listQueueItems, QUEUE_TYPES, removeQueueItem } from "../../utils/offlineQueue";
import {
    formatMoney,
    getOrderDollarTotal,
    getOrderItems,
    getOrderSomTotal,
} from "../../utils/queueSummary";

const getOrderData = (order) => order?.data || order || {};

const getOrderTitle = (order) => {
    const data = getOrderData(order);
    return data.mijoz_name || data.kontragent || data.kontragent_name || data.mijoz_code || "Noma'lum mijoz";
};

const getOrderDate = (order) => {
    const data = getOrderData(order);
    return order?.sana || data?.date || order?.created_at || "";
};

export default function SavdolarPage({ onBack, onSend, onQueueChange }) {
    const [sending, setSending] = useState(false);
    const [orders, setOrders] = useState(null);

    const reloadOrders = useCallback(async () => {
        const data = await listQueueItems(QUEUE_TYPES.SAVDOLAR);
        setOrders(data);
        return data;
    }, []);

    useEffect(() => {
        reloadOrders();
    }, [reloadOrders]);

    const orderRows = orders || [];
    const ordersLoaded = orders !== null;

    const totalSom = useMemo(
        () => orderRows.reduce((sum, order) => sum + getOrderSomTotal(order), 0),
        [orderRows]
    );

    const totalDollar = useMemo(
        () => orderRows.reduce((sum, order) => sum + getOrderDollarTotal(order), 0),
        [orderRows]
    );

    const handleDelete = (id) => {
        Swal.fire({
            title: "Savdo o'chirilsinmi?",
            text: "Bu amalni ortga qaytarib bo'lmaydi!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ha, o'chirish",
            cancelButtonText: "Bekor qilish"
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            await removeQueueItem(QUEUE_TYPES.SAVDOLAR, id);
            const updated = await reloadOrders();
            await onQueueChange?.(updated);

            Swal.fire({
                title: "O'chirildi!",
                text: "Savdo muvaffaqiyatli o'chirildi.",
                icon: "success",
                timer: 500,
                showConfirmButton: false
            });
        });
    };

    const handleSend = async () => {
        setSending(true);
        try {
            await onSend?.();
            const updated = await reloadOrders();
            await onQueueChange?.(updated);
            onBack?.();
        } finally {
            setSending(false);
        }
    };

    const handleBack = async () => {
        await onQueueChange?.();
        onBack?.();
    };

    return (
        <div className="app-safe">
            <div className="tolov-wrapper">
                <div className="tolov-container">
                    <div className="tolov-header">
                        <button
                            className="tolov-back-btn"
                            onClick={handleBack}
                            aria-label="Orqaga"
                        >
                            <span className="icon-arrow-left" />
                        </button>
                        <span className="tolov-header-title">Yuborilmagan savdolar ro'yxati</span>
                    </div>

                    <div className="tolov-body">
                        <div className="tolov-totals">
                            <div className="tolov-total-row">
                                <span className="tolov-total-label">Jami summa so'mda:</span>
                                <span className="tolov-total-value">
                                    {ordersLoaded ? formatMoney(totalSom, "so'm") : ""}
                                </span>
                            </div>
                            <div className="tolov-total-row">
                                <span className="tolov-total-label">Jami summa dollarda:</span>
                                <span className="tolov-total-value">
                                    {ordersLoaded ? formatMoney(totalDollar, "$") : ""}
                                </span>
                            </div>
                        </div>

                        <div className="tolov-divider" />

                        <div className="tolov-list">
                            {ordersLoaded && orderRows.length === 0 ? (
                                <div className="tolov-empty">
                                    Hozircha savdolar mavjud emas
                                </div>
                            ) : (
                                orderRows.map((order) => {
                                    const items = getOrderItems(order);
                                    const somTotal = getOrderSomTotal(order);
                                    const dollarTotal = getOrderDollarTotal(order);

                                    return (
                                        <div key={order.id} className="tolov-item">
                                            <div className="tolov-icon-box">
                                                <svg width="37" height="37" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M6 6h15l-2 8H8L6 6Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                                                    <path d="M6 6 5.4 3H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="white" />
                                                    <path d="M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="white" />
                                                </svg>
                                            </div>
                                        
                                            <div className="tolov-item-info">
                                                <span className="tolov-item-title">{order.name}</span>
                                                <span className="tolov-item-subtitle">
                                                    {items.length} ta mahsulot
                                                </span>
                                                <span className="tolov-item-date">{getOrderDate(order)}</span>
                                            </div>

                                            <div className="tolov-item-right">
                                                <span className="tolov-item-amount">
                                                    {somTotal > 0 && <span>{formatMoney(somTotal, "so'm")}</span>}
                                                    {dollarTotal > 0 && <span>{formatMoney(dollarTotal, "$")}</span>}
                                                    {somTotal === 0 && dollarTotal === 0 && <span>{formatMoney(0, "so'm")}</span>}
                                                </span>
                                                <div className="tolov-actions">
                                                    <button
                                                        className="tolov-action-btn tolov-delete-btn"
                                                        onClick={() => handleDelete(order.id)}
                                                        aria-label="O'chirish"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M4 7l16 0" />
                                                            <path d="M10 11l0 6" />
                                                            <path d="M14 11l0 6" />
                                                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <button
                        className="tolov-send-btn"
                        onClick={handleSend}
                        disabled={sending || !ordersLoaded || orderRows.length === 0}
                    >
                        {sending ? "YUBORILMOQDA..." : "YUBORISH"}
                    </button>
                </div>
            </div>
        </div>
    );
}
