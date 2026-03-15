import { useState } from 'react';
import { savePin } from './auth';
import './PinScreen.css';

const KEYS = [
  { num: "1" }, { num: "2", sub: "ABC" }, { num: "3", sub: "DEF" },
  { num: "4", sub: "GHI" }, { num: "5", sub: "JKL" }, { num: "6", sub: "MNO" },
  { num: "7", sub: "PQRS" }, { num: "8", sub: "TUV" }, { num: "9", sub: "WXYZ" },
];

export default function SetPin({ onSuccess }) {
  const [step, setStep] = useState('set');     // 'set' | 'confirm'
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
      if (step === 'confirm') {
        // Tasdiqlash xato → boshidan
        setStep('set');
        setFirstPin('');
        setError('');
      }
    }, 1000);
  };

  const handlePress = async (num) => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      if (step === 'set') {
        // 1-qadam: PIN saqlash va tasdiqlashga o'tish
        setTimeout(() => {
          setFirstPin(newPin);
          setPin('');
          setStep('confirm');
          setError('');
        }, 300);
      } else {
        // 2-qadam: Tasdiqlash
        if (newPin === firstPin) {
          await savePin(newPin);
          onSuccess(); // ✅ App.jsx ga xabar
        } else {
          triggerError("PIN mos kelmadi, qaytadan kiriting");
        }
      }
    }
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="pin-page">
      <div className="pin-top">
        <p className="pin-title">
          {error
            ? `❌ ${error}`
            : step === 'set'
            ? "Yangi PIN o'rnating"
            : "PINni tasdiqlang"}
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
              <button key={k.num} className="pin-key" onClick={() => handlePress(k.num)}>
                <span className="pin-num">{k.num}</span>
                {k.sub && <span className="pin-sub">{k.sub}</span>}
              </button>
            ))}
          </div>
        ))}
        <div className="pin-row">
          <div className="pin-key-empty" />
          <button className="pin-key" onClick={() => handlePress("0")}>
            <span className="pin-num">0</span>
          </button>
          <button className="pin-delete" onClick={handleDelete}>⌫</button>
        </div>
      </div>
    </div>
  );
}