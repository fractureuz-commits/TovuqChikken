import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QrModal.css";
import { apiPost } from "../../utils/api";

const MAX_VISIBLE = 2;

const safeStop = async (scanner) => {
    if (!scanner) return;
    try {
        await scanner.stop();
        scanner.clear();
    } catch (_) { }
};

function QrModal({setProductadd, onScan, onClose, setshtrixData, shtrixData, handleModal , ProductData ,setProductData }) {
    const html5QrRef = useRef(null);
    const scannedSet = useRef(new Set());
    const [error, setError] = useState("");
    const counterRef = useRef(0);
    const [displayItems, setDisplayItems] = useState([]);
    const isProcessing = useRef(false);

    useEffect(() => {
        const qrScanner = new Html5Qrcode("qr-reader");
        html5QrRef.current = qrScanner;

        qrScanner.start(
            { facingMode: "environment" },
            {
                fps: 100,
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.1,
            },
            async (decodedText) => {
                if (scannedSet.current.has(decodedText)) return;
                if (isProcessing.current) return;

                isProcessing.current = true;
                scannedSet.current.add(decodedText);

                try {
                    const body = JSON.parse(decodedText);
                    const result = await apiPost(
                        "tovuq/hs/tovar/get_tovar",
                        body
                    );
                    console.log("✅ 1C javobi:", result);
                    setProductData(result)
                    handleClose();
                    setProductadd(true)
                } catch (err) {
                    console.error("❌ Xato:", err);
                    alert("1C xato qaytardi" , err);
                    scannedSet.current.delete(decodedText);

                } finally {
                    isProcessing.current = false;
                }
            }
        ).catch((err) => {
            setError("Kamera ochilmadi: " + err);
        });

        return () => {
            const s = html5QrRef.current;
            html5QrRef.current = null;
            safeStop(s);
        };
    }, []);

    const removeItem = (id) => {
        setshtrixData((prev) => prev.filter((i) => i.id !== id));
        setDisplayItems((prev) => {
            const found = prev.find((i) => i.id === id);
            if (found) scannedSet.current.delete(found.text);
            return prev.map((i) => (i.id === id ? { ...i, state: "leaving" } : i));
        });
        setTimeout(() => {
            setDisplayItems((prev) => prev.filter((i) => i.id !== id));
        }, 420);
    };

    const handleClose = () => {
        const s = html5QrRef.current;
        html5QrRef.current = null;
        safeStop(s);
        handleModal?.();
    };
    return (
        <div className="qr-modal-overlay">
            <div className="qr-scanned-list">
                {displayItems.map((item) => (
                    <div key={item.id} className={`qr-scanned-row qr-row-${item.state}`}>
                        <div className="qr-item-index">
                            <span>{item.id}</span>
                        </div>
                        <div className="qr-item-info">
                            <span className="qr-item-text">{item.text}</span>
                        </div>
                        <button className="qr-row-delete" onClick={() => removeItem(item.id)}>
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div className="qr-modal">
                <div className="qr-camera-box">
                    <div id="qr-reader" />
                    <div className="qr-corner qr-corner-tl" />
                    <div className="qr-corner qr-corner-tr" />
                    <div className="qr-corner qr-corner-bl" />
                    <div className="qr-corner qr-corner-br" />
                    <div className="qr-scan-line" />
                </div>

                <div className="qr-modal-footer">
                    <p className="qr-hint-text">Shtrix kodni ramkaga to'g'rilang</p>
                    <button className="qr-cancel-btn" onClick={handleClose}>
                        ✕ Bekor qilish
                    </button>
                    {error && <p className="qr-error-text">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default QrModal;
