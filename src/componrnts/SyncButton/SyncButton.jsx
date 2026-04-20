import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    syncAndSave, cancelSync,
    checkInternet, clearAllData,
    saveKontragent, saveTovar,
    syncAndSaveTovar,
    syncKurs,
    saveXodim,
    saveRegion,
    saveHarajat,
} from '../../utils/storage';
import { apiFetch } from "../../utils/api";
import Loader from "../loader/loader";

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
                const [kontragentData, TovarData, _kurs, Xodim, Region, Harajat] = await Promise.all([
                    apiFetch("kontragent"),
                    apiFetch("Tovar"),
                    syncKurs(),          // ← 3-chi = _kurs ✅
                    apiFetch("Xodim"),   // ← 4-chi = Xodim ✅
                    apiFetch("Region"),   // ← 4-chi = Xodim ✅
                    apiFetch("Harajat"),   // ← 4-chi = Xodim ✅
                ]);

                await saveKontragent(kontragentData);
                await syncAndSaveTovar(TovarData);
                await saveXodim(Xodim);
                await saveRegion(Region);
                await saveHarajat(Harajat);
                // ✅ 6 — Muvaffaqiyat
                Swal.fire({
                    icon: "success",
                    title: "Yangilandi!",
                    text: `${products.length} ta mahsulot saqlandi.`,
                    confirmButtonColor: "#1a2b4a",
                    timer: 1000,
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
    const [dots, setDots] = useState("");
    useEffect(() => {
        if (!syncing) {
            setDots("");
            return;
        }

        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === "...") return "";
                return prev + ".";
            });
        }, 500);

        return () => clearInterval(interval);
    }, [syncing]);

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
            {syncing ? <Loader /> : ""}
            <button className="button" onClick={!syncing ? handleSync : undefined} disabled={syncing}>

                <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2001_92)">
                        <g clipPath="url(#clip1_2001_92)">
                            <path d="M24.5 63.0007C20.1329 63.0007 15.9448 61.3413 12.8568 58.3876C9.76884 55.4339 8.03404 51.4278 8.03404 47.2507C8.03404 43.0735 9.76884 39.0675 12.8568 36.1138C15.9448 33.1601 20.1329 31.5007 24.5 31.5007C25.5313 26.9058 28.5486 22.8679 32.888 20.2752C35.0367 18.9914 37.4452 18.1011 39.9762 17.6551C42.5071 17.2091 45.1109 17.2161 47.6388 17.6757C50.1668 18.1353 52.5694 19.0386 54.7095 20.3339C56.8496 21.6292 58.6852 23.2912 60.1116 25.2249C61.538 27.1587 62.5273 29.3264 63.0228 31.6043C63.5184 33.8821 63.5106 36.2255 63 38.5007H66.5C69.7489 38.5007 72.8647 39.7913 75.162 42.0886C77.4593 44.3859 78.75 47.5018 78.75 50.7507C78.75 53.9996 77.4593 57.1154 75.162 59.4127C72.8647 61.7101 69.7489 63.0007 66.5 63.0007H63" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M54 64.9995L43.5 75.4995L33 64.9995" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M43.4047 75.5V44" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </g>
                    <defs>
                        <clipPath id="clip0_2001_92">
                            <rect width="84" height="84" fill="white" />
                        </clipPath>
                        <clipPath id="clip1_2001_92">
                            <rect width="84" height="84" fill="white" />
                        </clipPath>
                    </defs>
                </svg>

                {/* {syncing && progress.total > 0 && (
                    <small>{progress.current}/{progress.total}</small>
                )} */}
                <p>{syncing ? `Yuklanmoqda${dots}` : "Yuklash"}</p>

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