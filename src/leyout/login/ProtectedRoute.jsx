import { useState, useEffect } from "react";
import { checkPin } from "./auth";
import './PinScreen.css';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 1000;

const KEYS = [
    { num: "1" },              { num: "2", sub: "ABC" },  { num: "3", sub: "DEF" },
    { num: "4", sub: "GHI" },  { num: "5", sub: "JKL" },  { num: "6", sub: "MNO" },
    { num: "7", sub: "PQRS" }, { num: "8", sub: "TUV" },  { num: "9", sub: "WXYZ" },
];

let lockState = { attempts: 0, lockedUntil: null };

export default function PinScreen({ onSuccess }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);
    const [locked, setLocked] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);

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

    const triggerError = () => {
        setError(true);
        setShake(true);
        setTimeout(() => {
            setError(false);
            setShake(false);
            setPin("");
        }, 1000);
    };

    const handlePress = (num) => {
        if (locked || loading) return;
        setPin(prev => prev + num);
    };

    const handleDelete = () => {
        if (!locked && !loading) setPin(p => p.slice(0, -1));
    };

    const handleConfirm = async () => {
        if (locked || loading || pin.length === 0) return;

        setLoading(true);
        const ok = await checkPin(pin);
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
    };

    return (
        <div className="pin-page">
            <div className="pin-top">
                <p className="pin-title">
                    {locked
                        ? `🔒 ${countdown} soniyadan so'ng urinib ko'ring`
                        : error
                        ? `❌ Noto'g'ri parol (${lockState.attempts}/${MAX_ATTEMPTS})`
                        : "Parolni kiriting"}
                </p>

                <div className={`pin-dots ${shake ? "shake" : ""}`}>
                    {pin.length === 0
                        ? [0, 1, 2, 3].map(i => <div key={i} className="pin-dot" />)
                        : Array.from(pin).map((_, i) => (
                            <div key={i} className={`pin-dot filled ${error ? "error" : ""}`} />
                        ))
                    }
                </div>
            </div>

            <div className="pin-keypad">
                {[0, 1, 2].map(row => (
                    <div key={row} className="pin-row">
                        {KEYS.slice(row * 3, row * 3 + 3).map(k => (
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
                    <div className="pin-key-empty" />
                    <button
                        className="pin-key"
                        onClick={() => handlePress("0")}
                        disabled={locked || loading}
                    >
                        <span className="pin-num">0</span>
                    </button>
                    <button
                        className="pin-delete"
                        onClick={handleDelete}
                        disabled={locked || loading}
                    >
                        ⌫
                    </button>
                </div>
            </div>

            <button
                className="pin-confirm-btn"
                onClick={handleConfirm}
                disabled={locked || loading || pin.length === 0}
            >
                {loading ? "Tekshirilmoqda..." : "KIRISH"}
            </button>
        </div>
    );
}