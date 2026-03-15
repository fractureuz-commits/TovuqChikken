import { useState } from "react";
import Swal from "sweetalert2";
import {
    syncAndSave, cancelSync,
    checkInternet, clearAllData,
    saveKontragent, saveTovar,
    syncAndSaveTovar,
    syncKurs,
} from '../../utils/storage';
import { apiFetch } from "../../utils/api";

const SyncButton = ({ onSyncComplete }) => {
    const [syncing, setSyncing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleSync = async () => {

        // ✅ 1 — Bosishni tasdiqlash
        const confirm = await Swal.fire({
            icon: "question",
            title: "Yangilash",
            text: "Ma'lumotlarni 1C dan yangilashni xohlaysizmi?",
            showCancelButton: true,
            confirmButtonText: "Ha, yangilash",
            cancelButtonText: "Yo'q",
            confirmButtonColor: "#1a2b4a",
            cancelButtonColor: "#d33",
        });

        if (!confirm.isConfirmed) return;

        // ✅ 2 — Internet tekshirish
        const online = await checkInternet();
        if (!online) {
            Swal.fire({
                icon: "error",
                title: "Ulanish xatosi!",
                text: "Server ga ulanib bo'lmadi! WiFi ni tekshiring.",
                confirmButtonColor: "#1a2b4a",
            });
            return;
        }

        setSyncing(true);
        setProgress({ current: 0, total: 0 });

        apiFetch("products")
            .then(async (data) => {

                // ✅ 3 — Bo'sh JSON
                if (!data || data.length === 0) {
                    await clearAllData();
                    Swal.fire({
                        icon: "warning",
                        title: "Ma'lumot yo'q!",
                        text: "1C dan bo'sh ma'lumot keldi. Barcha ma'lumotlar o'chirildi.",
                        confirmButtonColor: "#1a2b4a",
                    });
                    if (onSyncComplete) onSyncComplete([]);
                    return;
                }

                // ✅ 4 — Mahsulotlarni saqlash
                setProgress({ current: 0, total: data.length });

                const products = await syncAndSave(data, (current, total) => {
                    setProgress({ current, total });
                });

                // ✅ 5 — Kontragent va Tovar parallel yuklaymiz
                const [kontragentData, TovarData, _kurs] = await Promise.all([
                    apiFetch("kontragent"),
                    apiFetch("Tovar"),
                    syncKurs(),              // ← qo'shildi

                ]);

                await saveKontragent(kontragentData);
                await syncAndSaveTovar(TovarData);
                // ✅ 6 — Muvaffaqiyat
                Swal.fire({
                    icon: "success",
                    title: "Yangilandi!",
                    text: `${products.length} ta mahsulot saqlandi.`,
                    confirmButtonColor: "#1a2b4a",
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                if (onSyncComplete) onSyncComplete(products);
            })
            .catch(async (err) => {

                // ✅ 7 — JSON xatosi
                if (
                    err.message.includes("Unexpected") ||
                    err.message.includes("JSON") ||
                    err.message.includes("json")
                ) {
                    await clearAllData();
                    Swal.fire({
                        icon: "error",
                        title: "Ma'lumot buzilgan!",
                        text: "Barcha ma'lumotlar o'chirildi. Qayta yangilang.",
                        confirmButtonColor: "#1a2b4a",
                    });
                    if (onSyncComplete) onSyncComplete([]);
                    return;
                }

                // ✅ 8 — Boshqa xatolar
                Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: err.message,
                    confirmButtonColor: "#1a2b4a",
                });
            })
            .finally(() => {
                setSyncing(false);
                setProgress({ current: 0, total: 0 });
            });
    };

    // ✅ To'xtatish
    const handleCancel = async () => {
        const confirm = await Swal.fire({
            icon: "warning",
            title: "To'xtatish",
            text: "Yuklanishni to'xtatishni xohlaysizmi?",
            showCancelButton: true,
            confirmButtonText: "Ha, to'xtatish",
            cancelButtonText: "Yo'q, davom etsin",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1a2b4a",
        });

        if (!confirm.isConfirmed) return;

        cancelSync();
        setSyncing(false);

        Swal.fire({
            icon: "info",
            title: "To'xtatildi",
            text: `${progress.current} ta mahsulot saqlandi.`,
            confirmButtonColor: "#1a2b4a",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    };

    return (
        <>
            <button className="button" onClick={!syncing ? handleSync : undefined} disabled={syncing}>
                <svg
                    width="84" height="84"
                    viewBox="0 0 84 84"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ animation: syncing ? "spin 1s linear infinite" : "none" }}
                >
                    <g clipPath="url(#clip0_2001_92)">
                        <path d="M70 38.5004C69.144 32.3412 66.2867 26.6342 61.8682 22.2587C57.4497 17.8831 51.7151 15.0817 45.5478 14.2859C39.3805 13.4901 33.1227 14.7441 27.7382 17.8548C22.3537 20.9655 18.1414 25.7602 15.75 31.5004M14 17.5004V31.5004H28" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 45.5C14.856 51.6592 17.7133 57.3662 22.1318 61.7418C26.5503 66.1173 32.2849 68.9188 38.4522 69.7146C44.6195 70.5103 50.8773 69.2563 56.2618 66.1456C61.6463 63.035 65.8586 58.2402 68.25 52.5M70 66.5V52.5H56" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                        <clipPath id="clip0_2001_92">
                            <rect width="84" height="84" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
                {syncing && progress.total > 0 && (
                    <small>{progress.current}/{progress.total}</small>
                )}
                <p>{syncing ? "Yuklanmoqda..." : "Yangilash"}</p>

                {/* {syncing && (
                    <div
                        onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                        style={{ fontSize: 10, color: "red", marginTop: 4 }}>
                        ⛔ To'xtatish
                    </div>
                )} */}

                <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
            </button>


        </>
    );
};

export default SyncButton;