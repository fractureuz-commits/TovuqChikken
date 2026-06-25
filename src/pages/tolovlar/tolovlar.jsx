import { useCallback, useEffect, useMemo, useState } from "react";
import "./tolov.css";
import TolovModal from "../../componrnts/TolovModal/TolovModal";
import Swal from "sweetalert2";
import { listQueueItems, QUEUE_TYPES, removeQueueItem } from "../../utils/offlineQueue";
import { getUser } from "../../leyout/login/auth";
import { canViewNotes } from "../../utils/permissions";
import { formatMoney, getPaymentDollarTotal, getPaymentSomTotal } from "../../utils/queueSummary";

export default function TolovPage({ onBack, onSend, onQueueChange }) {
    const user = getUser();
    const canSeeNotes = canViewNotes(user);
    const [sending, setSending] = useState(false);
    const [editPayment, setEditPayment] = useState(null);

    const [payments, setPayments] = useState(null);

    const reloadPayments = useCallback(async () => {
        const data = await listQueueItems(QUEUE_TYPES.TOLOVLAR);
        setPayments(data);
        return data;
    }, []);

    const syncAfterQueueChange = useCallback(async (nextRows) => {
        const data = Array.isArray(nextRows) ? nextRows : await reloadPayments();
        setPayments(data);
        await onQueueChange?.(data);
        return data;
    }, [onQueueChange, reloadPayments]);

    useEffect(() => {
        reloadPayments();
    }, [reloadPayments]);

    const paymentRows = payments || [];
    const paymentsLoaded = payments !== null;

    // Umumiy jami
    const totalSom = useMemo(
        () => paymentRows.reduce((sum, p) => sum + getPaymentSomTotal(p), 0),
        [paymentRows]
    );
    const totalDollar = useMemo(
        () => paymentRows.reduce((sum, p) => sum + getPaymentDollarTotal(p), 0),
        [paymentRows]
    );
    // ── O'chirish ────────────────────────────────────────────────
    const handleDelete = (id) => {
        Swal.fire({
            title: "To‘lov o‘chirilsinmi?",
            text: "Bu amalni ortga qaytarib bo‘lmaydi!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ha, o‘chirish",
            cancelButtonText: "Bekor qilish"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await removeQueueItem(QUEUE_TYPES.TOLOVLAR, id);
                const updated = await reloadPayments();
                await onQueueChange?.(updated);

                Swal.fire({
                    title: "O‘chirildi!",
                    text: "To‘lov muvaffaqiyatli o‘chirildi.",
                    icon: "success",
                    timer: 200,
                    showConfirmButton: false
                });
            }
        });
    };

    // ── Edit saqlash ─────────────────────────────────────────────
    // TolovModal ichida setTolovlar(newData) chaqiriladi —
    // bu yerda shunday interceptor qo'yamiz
    const handleEditSave = async (newData) => {
        await syncAfterQueueChange(newData);
        setEditPayment(null);
    };

    // ── Yuborish ─────────────────────────────────────────────────
    const handleSend = async () => {
        setSending(true);
        try {
            await onSend?.();
            const updated = await reloadPayments();
            await onQueueChange?.(updated);
            onBack();
        } finally {
            setSending(false);
        }
    };

    const handleBack = async () => {
        await onQueueChange?.();
        onBack?.();
    };

    return (
        <>
            <div className="app-safe">
                <div className="tolov-wrapper">
                    <div className="tolov-container">
                        {/* ── Header ── */}
                        <div className="tolov-header">
                            <button
                                className="tolov-back-btn"
                                onClick={handleBack}
                                aria-label="Orqaga"
                            >
                                <span className="icon-arrow-left" />
                            </button>
                            <span className="tolov-header-title">Yuborilmagan to'lovlar ro'yxati</span>
                        </div>

                        {/* ── Body ── */}
                        <div className="tolov-body">
                            {/* Totals */}
                            <div className="tolov-totals">
                                <div className="tolov-total-row">
                                    <span className="tolov-total-label">Jami summa so'mda:</span>
                                    <span className="tolov-total-value">
                                        {paymentsLoaded ? formatMoney(totalSom, "so'm") : ""}
                                    </span>
                                </div>
                                <div className="tolov-total-row">
                                    <span className="tolov-total-label">Jami summa dollarda:</span>
                                    <span className="tolov-total-value">
                                        {paymentsLoaded ? formatMoney(totalDollar, "$") : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="tolov-divider" />

                            {/* Payment List */}
                            <div className="tolov-list">
                                {paymentsLoaded && paymentRows.length === 0 ? (
                                    <div className="tolov-empty">
                                        Hozircha to'lovlar mavjud emas
                                    </div>
                                ) : (
                                    paymentRows.map((p) => {
                                        const somTotal = getPaymentSomTotal(p);
                                        const dollarTotal = getPaymentDollarTotal(p);
                                        return (
                                            <div key={p.id} className="tolov-item">

                                                {/* Icon */}
                                                <div className="tolov-icon-box">
                                                    <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <g clipPath="url(#clip0_2203_52)">
                                                            <path d="M26.2084 12.3334V7.70841C26.2084 7.29954 26.046 6.90741 25.7569 6.61829C25.4678 6.32917 25.0756 6.16675 24.6667 6.16675H9.25008C8.43233 6.16675 7.64807 6.4916 7.06984 7.06984C6.4916 7.64807 6.16675 8.43233 6.16675 9.25008M6.16675 9.25008C6.16675 10.0678 6.4916 10.8521 7.06984 11.4303C7.64807 12.0086 8.43233 12.3334 9.25008 12.3334H27.7501C28.159 12.3334 28.5511 12.4958 28.8402 12.785C29.1293 13.0741 29.2917 13.4662 29.2917 13.8751V18.5001M6.16675 9.25008V27.7501C6.16675 28.5678 6.4916 29.3521 7.06984 29.9303C7.64807 30.5086 8.43233 30.8334 9.25008 30.8334H27.7501C28.159 30.8334 28.5511 30.671 28.8402 30.3819C29.1293 30.0928 29.2917 29.7006 29.2917 29.2917V24.6667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M30.8333 18.5V24.6667H24.6666C23.8488 24.6667 23.0646 24.3418 22.4863 23.7636C21.9081 23.1853 21.5833 22.4011 21.5833 21.5833C21.5833 20.7656 21.9081 19.9813 22.4863 19.4031C23.0646 18.8249 23.8488 18.5 24.6666 18.5H30.8333Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_2203_52">
                                                                <rect width="37" height="37" fill="white" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </div>

                                                {/* Info */}
                                                <div className="tolov-item-info">
                                                    <span className="tolov-item-title">
                                                        {p.mijoz_name || "Noma'lum mijoz"}
                                                    </span>
                                                    <span className="tolov-item-subtitle">
                                                        {canSeeNotes ? (p.izoh || "To'lov") : "To'lov"}
                                                    </span>
                                                    <span className="tolov-item-date">{p.date}</span>
                                                </div>

                                                {/* Summa + amallar */}
                                                <div className="tolov-item-right">
                                                    <span className="tolov-item-amount">
                                                        {somTotal > 0 && <span>{formatMoney(somTotal, "so'm")}</span>}
                                                        {dollarTotal > 0 && <span>{formatMoney(dollarTotal, "$")}</span>}
                                                        {somTotal === 0 && dollarTotal === 0 && <span>{formatMoney(0, "so'm")}</span>}
                                                    </span>
                                                    <div className="tolov-actions">
                                                        <button
                                                            className="tolov-action-btn tolov-edit-btn"
                                                            onClick={() => setEditPayment(p)}
                                                            aria-label="Tahrirlash"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>                                                        </button>
                                                        <button
                                                            className="tolov-action-btn tolov-delete-btn"
                                                            onClick={() => handleDelete(p.id)}
                                                            aria-label="O'chirish"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>                                                        </button>
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
                            disabled={sending || !paymentsLoaded || paymentRows.length === 0}
                        >
                            {sending ? "YUBORILMOQDA..." : "YUBORISH"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Edit Modal ── */}
            {editPayment && (
                <TolovModal
                    editData={editPayment}
                    onClose={(rows) => {
                        if (Array.isArray(rows)) {
                            syncAfterQueueChange(rows);
                        }
                        setEditPayment(null);
                    }}
                    setTolovlar={handleEditSave}
                    removeSyncedTolovlar={() => { }}
                />
            )}
        </>
    );
}
