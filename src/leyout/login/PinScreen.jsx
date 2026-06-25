// ✅ To'g'ri — barcha import yuqorida
import { useState, useEffect, useRef } from "react";
import { checkPin } from "../login/auth";
import Swal from "sweetalert2";
import { downloadBackendData } from "../../utils/backendSync";
import Loader from "../../componrnts/loader/loader";
import './PinScreen.css';
import { SERVER_ADDRESS_KEY, getServerAddressInputValue, saveServerAddress } from "../../utils/serverConfig";
import {
    saveKontragent,
    saveData,
    saveTovar,
    saveXodim,
    saveRegion,
    saveHarajat,
} from '../../utils/storage';
const MAX_ATTEMPTS = 5;        // ← importlardan keyin
const LOCK_DURATION = 30 * 1000;
const SECRET_TAP_COUNT = 6;
const SECRET_SETTINGS_PASSWORD = "2026";

const KEYS = [
    { num: "1" }, { num: "2", sub: "ABC" }, { num: "3", sub: "DEF" },
    { num: "4", sub: "GHI" }, { num: "5", sub: "JKL" }, { num: "6", sub: "MNO" },
    { num: "7", sub: "PQRS" }, { num: "8", sub: "TUV" }, { num: "9", sub: "WXYZ" },
];

let lockState = {
    attempts: 0,
    lockedUntil: null,
};

const YES = "Да";

const demoRawUser = {
    code: "DEV-001",
    name: "Dev operator",
    password: "2026",
    rol: "1",
    bushatilgan: "Yo'q",
    hisobot: YES,
    izoh: YES,
    narx1: YES,
    narx2: YES,
    narx3: YES,
    narx4: YES,
    narx_korish: YES,
    narx_turi_ozgartirish: YES,
    qarzdorlik: YES,
    qaytarish: YES,
    savdo: YES,
    tolov: YES,
    harajat: YES,
};

const demoUser = {
    ...demoRawUser,
    bushatilgan: false,
    hisobot: true,
    izoh: true,
    narx1: true,
    narx2: true,
    narx3: true,
    narx4: true,
    narx_korish: true,
    narx_turi_ozgartirish: true,
    qarzdorlik: true,
    qaytarish: true,
    savdo: true,
    tolov: true,
    harajat: true,
};

const demoProductGroups = [
    { c: "G-001", n: "Tovuq go'shti", i: null },
    { c: "G-002", n: "Tuxum mahsulotlari", i: null },
    { c: "G-003", n: "Yem mahsulotlari", i: null },
];

const demoTovarlar = [
    {
        code: "T-001",
        name: "Tovuq butun",
        group_tovar_code: "G-001",
        group_tovar_name: "Tovuq go'shti",
        narh_sum1: "38000",
        narh_sum2: "37000",
        narh_sum3: "36000",
        narh_sum4: "35000",
        narh_val1: "3",
        narh_val2: "2.9",
        narh_val3: "2.8",
        narh_val4: "2.7",
        valyuta_turi: "1",
        hajm: "1",
        ul_bir: "kg",
        qoldiq: "120",
        date_invoys: "19.06.2026",
        number_invoys: "D-001",
        term: "19.07.2026",
        bayyer: "Demo Yuk Beruvchi 1",
    },
    {
        code: "T-002",
        name: "Tovuq son go'shti",
        group_tovar_code: "G-001",
        group_tovar_name: "Tovuq go'shti",
        narh_sum1: "42000",
        narh_sum2: "40500",
        narh_sum3: "39500",
        narh_sum4: "38500",
        narh_val1: "3.35",
        narh_val2: "3.25",
        narh_val3: "3.15",
        narh_val4: "3.05",
        valyuta_turi: "1",
        hajm: "1",
        ul_bir: "kg",
        qoldiq: "85",
        date_invoys: "19.06.2026",
        number_invoys: "D-002",
        term: "24.07.2026",
        bayyer: "Demo Yuk Beruvchi 1",
    },
    {
        code: "T-003",
        name: "Tuxum 30 dona",
        group_tovar_code: "G-002",
        group_tovar_name: "Tuxum mahsulotlari",
        narh_sum1: "33000",
        narh_sum2: "31500",
        narh_sum3: "30000",
        narh_sum4: "29000",
        narh_val1: "2.65",
        narh_val2: "2.5",
        narh_val3: "2.4",
        narh_val4: "2.3",
        valyuta_turi: "1",
        hajm: "30",
        ul_bir: "dona",
        qoldiq: "60",
        date_invoys: "18.06.2026",
        number_invoys: "D-003",
        term: "30.06.2026",
        bayyer: "Demo Yuk Beruvchi 2",
    },
    {
        code: "T-004",
        name: "Jo'ja yemi",
        group_tovar_code: "G-003",
        group_tovar_name: "Yem mahsulotlari",
        narh_sum1: "145000",
        narh_sum2: "140000",
        narh_sum3: "137000",
        narh_sum4: "135000",
        narh_val1: "11.5",
        narh_val2: "11.1",
        narh_val3: "10.8",
        narh_val4: "10.6",
        valyuta_turi: "1",
        hajm: "25",
        ul_bir: "kg",
        qoldiq: "25",
        date_invoys: "17.06.2026",
        number_invoys: "D-004",
        term: "17.12.2026",
        bayyer: "Demo Yuk Beruvchi 3",
    },
];

const demoKontragentlar = [
    {
        code: "M-001",
        name: "Demo Market",
        tel_1: "+998901112233",
        tel_2: "",
        hudud_id: "R-001",
        hudud_code: "R-001",
        hudud_name: "Toshkent shahar",
        dostav_name: "Demo Yuk Beruvchi 1",
    },
    {
        code: "M-002",
        name: "Demo Oshxona",
        tel_1: "+998902223344",
        tel_2: "",
        hudud_id: "R-002",
        hudud_code: "R-002",
        hudud_name: "Toshkent viloyati",
        dostav_name: "Demo Yuk Beruvchi 2",
    },
    {
        code: "M-003",
        name: "Demo Yuk Beruvchi 1",
        tel_1: "+998903334455",
        tel_2: "",
        hudud_id: "R-003",
        hudud_code: "R-003",
        hudud_name: "Samarqand",
        dostav_name: "Yuk beruvchi",
    },
];

const demoRegions = [
    { code: "R-001", name: "Toshkent shahar", hudud_name: "Toshkent shahar" },
    { code: "R-002", name: "Toshkent viloyati", hudud_name: "Toshkent viloyati" },
    { code: "R-003", name: "Samarqand", hudud_name: "Samarqand" },
];

const demoHarajatlar = [
    { code: "H-001", name: "Transport" },
    { code: "H-002", name: "Yuk tushirish" },
    { code: "H-003", name: "Ombor xarajati" },
];

export default function PinScreen({ onSuccess }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);
    const [locked, setLocked] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("Yuklanmoqda...");
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
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

    const seedDemoDataAndLogin = async () => {
        await Promise.all([
            saveXodim([demoRawUser]),
            saveKontragent(demoKontragentlar),
            saveRegion(demoRegions),
            saveHarajat(demoHarajatlar),
            saveData("products", demoProductGroups),
            saveTovar(demoTovarlar),
        ]);

        localStorage.setItem("valyuta_kurs", JSON.stringify({ kurs: "12600" }));
        localStorage.setItem("current_user", JSON.stringify(demoUser));
    };

    const handleServerSettings = async () => {
        const result = await Swal.fire({
            title: "Secret sozlamalar",
            input: "text",
            inputLabel: "Server IP yoki domen",
            inputValue: getServerAddressInputValue(),
            inputPlaceholder: "192.168.1.103 yoki api.domain.uz",
            html: `<p style="font-size:12px;margin:0;color:#607080">IP yoki domen localStorage.${SERVER_ADDRESS_KEY} ga saqlanadi. Keyingi backend so'rovlari shu manzilga ketadi.</p>`,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "IP saqlash",
            denyButtonText: "Dev login",
            cancelButtonText: "Bekor",
            confirmButtonColor: "#1a2b4a",
            denyButtonColor: "#006CAC",
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputAttributes: {
                autocapitalize: "off",
                autocorrect: "off",
                spellcheck: "false",
            },
            preConfirm: (inputValue) => {
                try {
                    return saveServerAddress(inputValue);
                } catch (err) {
                    Swal.showValidationMessage(err.message);
                    return false;
                }
            },
        });

        if (result.isConfirmed) {
            const savedAddress = window.localStorage.getItem(SERVER_ADDRESS_KEY) || result.value;
            Swal.fire({
                icon: "success",
                title: "IP saqlandi",
                text: `${savedAddress} localStoragega saqlandi.`,
                confirmButtonColor: "#1a2b4a",
                timer: 900,
                showConfirmButton: false,
            });
        }

        if (result.isDenied) {
            try {
                await seedDemoDataAndLogin();
                await Swal.fire({
                    icon: "success",
                    title: "Dev login tayyor",
                    text: "Demo user, yuk beruvchi, mahsulot turi va mahsulotlar qo'shildi.",
                    confirmButtonColor: "#1a2b4a",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 900,
                    showConfirmButton: false,
                });
                onSuccess();
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: err.message,
                    confirmButtonColor: "#1a2b4a",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                });
            }
        }
    };

    const requestSecretPassword = async () => {
        const result = await Swal.fire({
            title: "Secret parol",
            input: "password",
            inputPlaceholder: "Parolni kiriting",
            showCancelButton: true,
            confirmButtonText: "Kirish",
            cancelButtonText: "Bekor",
            confirmButtonColor: "#1a2b4a",
            allowOutsideClick: false,
            allowEscapeKey: false,
            preConfirm: (value) => {
                if (String(value || "").trim() !== SECRET_SETTINGS_PASSWORD) {
                    Swal.showValidationMessage("Parol noto'g'ri");
                    return false;
                }
                return true;
            },
        });

        if (result.isConfirmed) {
            await handleServerSettings();
        }
    };

    const handleSecretTitleTap = () => {
        window.clearTimeout(secretTapRef.current.timeoutId);

        const nextCount = secretTapRef.current.count + 1;
        if (nextCount >= SECRET_TAP_COUNT) {
            secretTapRef.current.count = 0;
            requestSecretPassword();
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

        setSyncing(true);
        setSyncMessage("Yuklanmoqda...");
        setSyncProgress({ current: 0, total: 0 });

        try {
            const result = await downloadBackendData({
                onProgress: ({ stage, current, total }) => {
                    setSyncMessage(stage || "Yuklanmoqda...");
                    setSyncProgress({ current, total });
                },
            });

            if (result.cleared) {
                await Swal.fire({
                    icon: "warning",
                    title: "Ma'lumot yo'q!",
                    text: "1C dan bo'sh ma'lumot keldi. Barcha ma'lumotlar o'chirildi.",
                    confirmButtonColor: "#1a2b4a",
                });
                return;
            }

            await Swal.fire({
                icon: "success",
                title: "Yangilandi!",
                text: `${result.products.length} ta guruh, ${result.tovars.length} ta tovar saqlandi.`,
                confirmButtonColor: "#1a2b4a",
                timer: 1200,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({
                icon: err.message === "Yuklash to'xtatildi" ? "info" : "error",
                title: err.message === "Yuklash to'xtatildi" ? "To'xtatildi" : "Xato!",
                text: err.message,
                confirmButtonColor: "#1a2b4a",
            });
        } finally {
            setSyncing(false);
            setSyncProgress({ current: 0, total: 0 });
            setSyncMessage("Yuklanmoqda...");
        }

    };

    return (
        <div className="pin-page">
            {syncing && (
                <Loader
                    message={syncMessage}
                    current={syncProgress.current}
                    total={syncProgress.total}
                />
            )}
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
                        <svg color="#fff" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-backspace"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-11l-5 -5a1.5 1.5 0 0 1 0 -2l5 -5l11 0" /><path d="M12 10l4 4m0 -4l-4 4" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
