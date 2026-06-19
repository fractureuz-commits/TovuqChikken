// ✅ To'g'ri — barcha import yuqorida
import { useState, useEffect, useRef } from "react";
import { checkPin } from "../login/auth";
import { apiFetch } from "../../utils/api";        // ← yuqoriga
import Swal from "sweetalert2";
import './PinScreen.css';
import { getServerAddressInputValue, saveServerAddress } from "../../utils/serverConfig";
import {
    syncAndSave,
    checkInternet, clearAllData,
    saveKontragent,
    syncAndSaveTovar,
    syncKurs,
    saveXodim,
    saveRegion,
    saveHarajat,
} from '../../utils/storage';
const MAX_ATTEMPTS = 5;        // ← importlardan keyin
const LOCK_DURATION = 30 * 1000;
const SECRET_TAP_COUNT = 6;

const KEYS = [
    { num: "1" }, { num: "2", sub: "ABC" }, { num: "3", sub: "DEF" },
    { num: "4", sub: "GHI" }, { num: "5", sub: "JKL" }, { num: "6", sub: "MNO" },
    { num: "7", sub: "PQRS" }, { num: "8", sub: "TUV" }, { num: "9", sub: "WXYZ" },
];

let lockState = {
    attempts: 0,
    lockedUntil: null,
};

export default function PinScreen({ onSuccess }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);
    const [locked, setLocked] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const secretTapRef = useRef({ count: 0, timeoutId: null });
    useEffect(() => {
        if (lockState.lockedUntil && Date.now() < lockState.lockedUntil) {
            setLocked(true);
            setCountdown(Math.ceil((lockState.lockedUntil - Date.now()) / 1000));
        }
    }, []);

    useEffect(() => {
        if (!locked) return;
        const interval = setInterval(() => {
            const remaining = Math.ceil((lockState.lockedUntil - Date.now()) / 1000);
            if (remaining <= 0) {
                lockState = { attempts: 0, lockedUntil: null };
                setLocked(false);
                setCountdown(0);
            } else {
                setCountdown(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [locked]);

    useEffect(() => {
        const secretTap = secretTapRef.current;
        return () => window.clearTimeout(secretTap.timeoutId);
    }, []);

    const triggerError = () => {
        setError(true);
        setShake(true);
        setTimeout(() => {
            setError(false);
            setShake(false);
            setPin("");
        }, 1000);
    };

    const handlePress = async (num) => {
        if (locked || loading) return;

        const newPin = pin + num;
        setPin(newPin);

        // ✅ 4 ta bo'lsa darhol submit
        if (newPin.length === 4) {
            setLoading(true);
            const ok = await checkPin(newPin);
            setLoading(false);

            if (ok) {
                lockState = { attempts: 0, lockedUntil: null };
                onSuccess();
            } else {
                const attempts = lockState.attempts + 1;
                if (attempts >= MAX_ATTEMPTS) {
                    lockState = { attempts: 0, lockedUntil: Date.now() + LOCK_DURATION };
                    setLocked(true);
                    setCountdown(LOCK_DURATION / 1000);
                } else {
                    lockState = { ...lockState, attempts };
                }
                triggerError();
            }
        }
    };

    const handleDelete = () => {
        if (!locked && !loading) setPin(p => p.slice(0, -1));
    };

    const handleServerSettings = async () => {
        const result = await Swal.fire({
            title: "Server IP",
            input: "text",
            inputValue: getServerAddressInputValue(),
            inputPlaceholder: "192.168.1.103",
            showCancelButton: true,
            confirmButtonText: "Saqlash",
            cancelButtonText: "Bekor",
            confirmButtonColor: "#1a2b4a",
            preConfirm: (value) => {
                try {
                    return saveServerAddress(value);
                } catch (err) {
                    Swal.showValidationMessage(err.message);
                    return false;
                }
            },
        });

        if (result.isConfirmed) {
            Swal.fire({
                icon: "success",
                title: "IP saqlandi",
                text: result.value,
                confirmButtonColor: "#1a2b4a",
                timer: 900,
                showConfirmButton: false,
            });
        }
    };

    const handleSecretTitleTap = () => {
        window.clearTimeout(secretTapRef.current.timeoutId);

        const nextCount = secretTapRef.current.count + 1;
        if (nextCount >= SECRET_TAP_COUNT) {
            secretTapRef.current.count = 0;
            handleServerSettings();
            return;
        }

        secretTapRef.current.count = nextCount;
        secretTapRef.current.timeoutId = window.setTimeout(() => {
            secretTapRef.current.count = 0;
        }, 1800);
    };

    const handleSync = async () => {
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
                    return;
                }

                // ✅ 4 — Mahsulotlarni saqlash
                const products = await syncAndSave(data);

                // ✅ 5 — Kontragent va Tovar parallel yuklaymiz
                const [kontragentData, TovarData, _kurs, Xodim, Region ,Harajat] = await Promise.all([
                    apiFetch("kontragent"),
                    apiFetch("Tovar"),
                    syncKurs(),         
                    apiFetch("Xodim"),  
                    apiFetch("Region"), 
                    apiFetch("Harajat"),
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
            });
    };

    return (
        <div className="pin-page">
            <div className="pin-top">
                <p className="pin-title" onClick={handleSecretTitleTap}>
                    {locked
                        ? `🔒 ${countdown} soniyadan so'ng urinib ko'ring`
                        : error
                            ? `❌ Noto'g'ri parol (${lockState.attempts}/${MAX_ATTEMPTS})`
                            : "Parolni kiriting"}
                </p>
                <div className={`pin-dots ${shake ? "shake" : ""}`}>
                    {pin.length === 0
                        ? [0, 1, 2, 3].map(i => (
                            <div key={i} className="pin-dot" />
                        ))
                        : Array.from(pin).map((_, i) => (
                            <div key={i} className={`pin-dot filled ${error ? "error" : ""}`} />
                        ))
                    }
                </div>
            </div>

            <div className="pin-keypad">
                {[0, 1, 2].map((row) => (
                    <div key={row} className="pin-row">
                        {KEYS.slice(row * 3, row * 3 + 3).map((k) => (
                            <button
                                key={k.num}
                                className="pin-key"
                                onClick={() => handlePress(k.num)}
                                disabled={locked || loading}
                            >
                                <span className="pin-num">{k.num}</span>
                                {k.sub && <span className="pin-sub">{k.sub}</span>}
                            </button>
                        ))}
                    </div>
                ))}

                <div className="pin-row">
                    <button
                        className="pin-key"
                        onClick={() => handleSync()}
                        disabled={locked || loading}
                    >
                        <svg
                            width="40"
                            height="40"
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
                    </button>
                    <button
                        className="pin-key"
                        onClick={() => handlePress("0")}
                        disabled={locked || loading}
                    >
                        <span className="pin-num">0</span>
                    </button>
                    <button
                        className="pin-key"
                        onClick={handleDelete}
                        disabled={locked || loading}
                    >
                        <svg color="#fff" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-backspace"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-11l-5 -5a1.5 1.5 0 0 1 0 -2l5 -5l11 0" /><path d="M12 10l4 4m0 -4l-4 4" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
