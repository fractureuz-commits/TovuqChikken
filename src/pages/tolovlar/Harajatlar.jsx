import { useCallback, useEffect, useMemo, useState } from "react";
import HarajatModal from "../../componrnts/Harajat/HarajatModal";
import Swal from "sweetalert2";
import { listQueueItems, QUEUE_TYPES, removeQueueItem } from "../../utils/offlineQueue";
import { getUser } from "../../leyout/login/auth";
import { canViewNotes } from "../../utils/permissions";
import { formatMoney, getExpenseDollarTotal, getExpenseSomTotal } from "../../utils/queueSummary";

export default function HarajatPage({ onBack, onSend, onQueueChange }) {
    const user = getUser();
    const canSeeNotes = canViewNotes(user);
    const [sending, setSending] = useState(false);
    const [editPayment, setEditPayment] = useState(null);

    const [payments, setPayments] = useState(null);

    const reloadPayments = useCallback(async () => {
        const data = await listQueueItems(QUEUE_TYPES.HARAJATLAR);
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

    const totalSom = useMemo(
        () => paymentRows.reduce((sum, p) => sum + getExpenseSomTotal(p), 0),
        [paymentRows]
    );
    const totalDollar = useMemo(
        () => paymentRows.reduce((sum, p) => sum + getExpenseDollarTotal(p), 0),
        [paymentRows]
    );

    // ── O'chirish ─────────────────────────────────────────────────
    const handleDelete = (id) => {
        Swal.fire({
            title: "Harajat o'chirilsinmi?",
            text: "Bu amalni ortga qaytarib bo'lmaydi!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ha, o'chirish",
            cancelButtonText: "Bekor qilish"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await removeQueueItem(QUEUE_TYPES.HARAJATLAR, id);
                const updated = await reloadPayments();
                await onQueueChange?.(updated);

                Swal.fire({
                    title: "O'chirildi!",
                    text: "Harajat muvaffaqiyatli o'chirildi.",
                    icon: "success",
                    timer: 200,
                    showConfirmButton: false
                });
            }
        });
    };

    // ── Edit saqlash ──────────────────────────────────────────────
    const handleEditSave = async (newData) => {
        await syncAfterQueueChange(newData);
        setEditPayment(null);
    };

    // ── Yuborish ──────────────────────────────────────────────────
    const handleSend = async () => {
        setSending(true);
        try {
            await onSend?.();
            const updated = await reloadPayments();
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
        <>
            <div className="app-safe">
                <div className="tolov-wrapper">
                    <div className="tolov-container">

                        {/* Header */}
                        <div className="tolov-header harajat">
                            <div>
                                <button
                                    className="tolov-back-btn"
                                    onClick={handleBack}
                                    aria-label="Orqaga"
                                >
                                    <span className="icon-arrow-left" />
                                </button>
                                <span className="tolov-header-title">
                                    Harajatlar ro'yxati
                                </span>
                            </div>

                            <button
                                className="tolov-back-btn"
                                onClick={() => setEditPayment({})}
                                aria-label="Qo'shish"
                            >
                                <svg
                                    color="#fff"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1 -2 0v-6h-6a1 1 0 0 1 0 -2h6v-6a1 1 0 0 1 1 -1" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
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

                            {/* List */}
                            <div className="tolov-list">
                                {paymentsLoaded && paymentRows.length === 0 ? (
                                    <div className="tolov-empty">
                                        Hozircha harajat mavjud emas
                                    </div>
                                ) : (
                                    paymentRows.map((p) => {
                                        const somTotal = getExpenseSomTotal(p);
                                        const dollarTotal = getExpenseDollarTotal(p);

                                        return (
                                            <div key={p.id} className="tolov-item">

                                                {/* Info */}
                                                <div className="tolov-item-info" style={{ gap: "10px" }}>
                                                    <span className="tolov-item-title">
                                                        {p.operatsiya_name || "Noma'lum harajat"}
                                                    </span>
                                                    {canSeeNotes && p.izoh && (
                                                        <span style={{ fontSize: "12px", opacity: 0.7 }}>
                                                            {p.izoh}
                                                        </span>
                                                    )}
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
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" />
                                                                <path d="M16 5l3 3" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="tolov-action-btn tolov-delete-btn"
                                                            onClick={() => handleDelete(p.id)}
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
                            disabled={sending || !paymentsLoaded || paymentRows.length === 0}
                        >
                            {sending ? "YUBORILMOQDA..." : "YUBORISH"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {editPayment && (
                <HarajatModal
                    editData={editPayment}
                    onClose={(rows) => {
                        if (Array.isArray(rows)) {
                            syncAfterQueueChange(rows);
                        }
                        setEditPayment(null);
                    }}
                    setHarajatlar={handleEditSave}
                    removeSyncedHarajatlar={() => { }}
                />
            )}
        </>
    );
}
