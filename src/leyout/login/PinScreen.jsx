import { useState, useEffect } from "react";
import { checkPin } from "../login/auth";
import { useBiometric } from "./useBiometric";
import './PinScreen.css';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 1000;

const KEYS = [
  { num: "1" },           { num: "2", sub: "ABC" }, { num: "3", sub: "DEF" },
  { num: "4", sub: "GHI" }, { num: "5", sub: "JKL" }, { num: "6", sub: "MNO" },
  { num: "7", sub: "PQRS" }, { num: "8", sub: "TUV" }, { num: "9", sub: "WXYZ" },
];

// Lock holati xotirada saqlanadi (ilovani yopmaguncha)
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
  const { available: biometricAvailable, authenticate } = useBiometric();

  // ✅ Komponent ochilganda lock tekshirish
  useEffect(() => {
    if (lockState.lockedUntil && Date.now() < lockState.lockedUntil) {
      setLocked(true);
      setCountdown(Math.ceil((lockState.lockedUntil - Date.now()) / 1000));
    }
  }, []);

  // ✅ Countdown timer
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

  const handlePress = async (num) => {
    if (locked || pin.length >= 4) return;

    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      const ok = await checkPin(newPin);

      if (ok) {
        // ✅ To'g'ri PIN
        lockState = { attempts: 0, lockedUntil: null };
        onSuccess();
      } else {
        // ❌ Noto'g'ri PIN
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
    if (!locked) setPin((p) => p.slice(0, -1));
  };

  const handleBiometric = async () => {
    const ok = await authenticate();
    if (ok) {
      lockState = { attempts: 0, lockedUntil: null };
      onSuccess();
    }
  };

  return (
    <div className="pin-page">
      <div className="pin-top">
        <p className="pin-title">
          {locked
            ? `🔒 ${countdown} soniyadan so'ng urinib ko'ring`
            : error
            ? `❌ Noto'g'ri PIN (${lockState.attempts}/${MAX_ATTEMPTS})`
            : "Parolni kiriting"}
        </p>

        <div className={`pin-dots ${shake ? "shake" : ""}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`pin-dot ${i < pin.length ? "filled" : ""} ${error ? "error" : ""}`}
            />
          ))}
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
                disabled={locked}
              >
                <span className="pin-num">{k.num}</span>
                {k.sub && <span className="pin-sub">{k.sub}</span>}
              </button>
            ))}
          </div>
        ))}

        <div className="pin-row">
          {biometricAvailable ? (
            <button
              className="pin-key pin-biometric"
              onClick={handleBiometric}
              disabled={locked}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24" />
                <path d="M12 6c3.31 0 6 2.69 6 6 0 1.1-.28 2.12-.76 3.01" />
                <path d="M12 10c-1.1 0-2 .9-2 2 0 2.76 2 7 2 7" />
                <path d="M12 10c1.1 0 2 .9 2 2 0 1.09-.27 2.12-.71 3" />
              </svg>
            </button>
          ) : (
            <div className="pin-key-empty" />
          )}

          <button
            className="pin-key"
            onClick={() => handlePress("0")}
            disabled={locked}
          >
            <span className="pin-num">0</span>
          </button>

          <button
            className="pin-delete"
            onClick={handleDelete}
            disabled={locked}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}