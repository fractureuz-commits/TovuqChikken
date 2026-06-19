import { useCallback, useEffect, useRef, useState } from "react";
import "./QrModal.css";
import { apiPost } from "../../utils/api";
import { startFastQrScanner } from "../../utils/fastQrScanner";

const scanFormats = [
    "qr_code",
    "code_128",
    "code_39",
    "code_93",
    "ean_13",
    "ean_8",
    "itf",
    "upc_a",
    "upc_e",
];

const parseScanPayload = (decodedText) => {
    const value = decodedText.trim();

    try {
        return JSON.parse(value);
    } catch {
        return { code_product: value };
    }
};

function QrModal({ setProductadd, onScan, onClose, setshtrixData, handleModal, setProductData }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scannerRef = useRef(null);
    const scannedSet = useRef(new Set());
    const isProcessing = useRef(false);
    const [error, setError] = useState("");
    const [displayItems, setDisplayItems] = useState([]);

    const stopScanner = useCallback(() => {
        scannerRef.current?.stop?.();
        scannerRef.current = null;
    }, []);

    const handleClose = useCallback(() => {
        stopScanner();
        onClose?.();
        handleModal?.();
    }, [handleModal, onClose, stopScanner]);

    const handleDecoded = useCallback(async (decodedText) => {
        if (!decodedText || scannedSet.current.has(decodedText) || isProcessing.current) return;

        isProcessing.current = true;
        scannedSet.current.add(decodedText);
        setError("");

        const itemId = Date.now();
        setDisplayItems([{ id: itemId, text: decodedText, state: "visible" }]);
        setshtrixData?.((prev) => [...(Array.isArray(prev) ? prev : []), { id: itemId, text: decodedText }]);
        onScan?.(decodedText);

        try {
            const body = parseScanPayload(decodedText);
            const result = await apiPost("tovuq/hs/tovar/get_tovar", body);
            console.log("1C javobi:", result);
            console.log("1Cga yuborilgan so'rov:", body);
            setProductData?.(result);
            setProductadd?.(true);
            handleClose();
        } catch (err) {
            console.error("Scan xatosi:", err);
            scannedSet.current.delete(decodedText);
            setError(`1C xato qaytardi: ${err.message}`);
        } finally {
            isProcessing.current = false;
        }
    }, [handleClose, onScan, setProductData, setProductadd, setshtrixData]);

    useEffect(() => {
        let cancelled = false;

        startFastQrScanner({
            videoElement: videoRef.current,
            canvasElement: canvasRef.current,
            formats: scanFormats,
            scanInterval: 75,
            scanRegionRatio: 0.82,
            onScan: handleDecoded,
            onError: (err) => {
                if (!cancelled) {
                    console.error("Skaner xatosi:", err);
                }
            },
        })
            .then((scanner) => {
                if (cancelled) {
                    scanner.stop();
                    return;
                }
                scannerRef.current = scanner;
            })
            .catch((err) => {
                if (cancelled) return;
                setError("Kamera ochilmadi: " + (err?.message || err));
            });

        return () => {
            cancelled = true;
            stopScanner();
        };
    }, [handleDecoded, stopScanner]);

    const removeItem = (id) => {
        setshtrixData?.((prev) => prev.filter((i) => i.id !== id));
        setDisplayItems((prev) => {
            const found = prev.find((i) => i.id === id);
            if (found) scannedSet.current.delete(found.text);
            return prev.map((i) => (i.id === id ? { ...i, state: "leaving" } : i));
        });
        setTimeout(() => {
            setDisplayItems((prev) => prev.filter((i) => i.id !== id));
        }, 420);
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
                            x
                        </button>
                    </div>
                ))}
            </div>

            <div className="qr-modal">
                <div className="qr-camera-box">
                    <video ref={videoRef} className="qr-live-video" playsInline muted />
                    <canvas ref={canvasRef} className="qr-scan-buffer" aria-hidden="true" />
                    <div className="qr-corner qr-corner-tl" />
                    <div className="qr-corner qr-corner-tr" />
                    <div className="qr-corner qr-corner-bl" />
                    <div className="qr-corner qr-corner-br" />
                    <div className="qr-scan-line" />
                </div>

                <div className="qr-modal-footer">
                    <p className="qr-hint-text">QR yoki shtrix kodni ramkaga to'g'rilang</p>
                    <button className="qr-cancel-btn" onClick={handleClose}>
                        Bekor qilish
                    </button>
                    {error && <p className="qr-error-text">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default QrModal;
