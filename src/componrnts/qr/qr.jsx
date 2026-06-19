import { useCallback, useEffect, useRef, useState } from "react";
import { startFastQrScanner } from "../../utils/fastQrScanner";
import "./qrScanner.css";

function QrScanner({ onScan }) {
    const [scanning, setScanning] = useState(false);
    const [success, setSuccess] = useState(false);
    const [scannedData, setScannedData] = useState("");
    const [error, setError] = useState("");
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scannerRef = useRef(null);
    const successTimeoutRef = useRef(null);
    const scanHandledRef = useRef(false);

    const stopScanner = useCallback(() => {
        scannerRef.current?.stop?.();
        scannerRef.current = null;
    }, []);

    const handleSuccess = useCallback((data) => {
        if (scanHandledRef.current) return;

        scanHandledRef.current = true;
        stopScanner();
        setScanning(false);
        setScannedData(data);
        setSuccess(true);
        onScan?.(data);

        window.clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = window.setTimeout(() => {
            setSuccess(false);
            setScannedData("");
            scanHandledRef.current = false;
        }, 650);
    }, [onScan, stopScanner]);

    useEffect(() => {
        if (!scanning) return undefined;

        let cancelled = false;
        setError("");
        scanHandledRef.current = false;

        startFastQrScanner({
            videoElement: videoRef.current,
            canvasElement: canvasRef.current,
            formats: ["qr_code"],
            scanInterval: 70,
            scanRegionRatio: 0.78,
            onScan: handleSuccess,
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
                console.error("Kamera ochilmadi:", err);
                setError("Kamera ochilmadi. Ruxsatni tekshiring.");
                setScanning(false);
            });

        return () => {
            cancelled = true;
            stopScanner();
        };
    }, [handleSuccess, scanning, stopScanner]);

    useEffect(() => {
        return () => {
            window.clearTimeout(successTimeoutRef.current);
            stopScanner();
        };
    }, [stopScanner]);

    const startScan = () => {
        window.clearTimeout(successTimeoutRef.current);
        setSuccess(false);
        setScannedData("");
        setError("");
        setScanning(true);
    };

    const stopScan = () => {
        stopScanner();
        setScanning(false);
        scanHandledRef.current = false;
    };

    return (
        <div className="qr-wrap">
            {success && (
                <div className="qr-success-overlay">
                    <div className="qr-success-card">
                        <div className="qr-checkmark">
                            <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                                <circle className="qr-check-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="qr-check-tick" fill="none" d="M14 27l8 8 16-16" />
                            </svg>
                        </div>
                        <p className="qr-success-title">Muvaffaqiyatli!</p>
                        <p className="qr-success-data">{scannedData}</p>
                    </div>
                </div>
            )}

            {!scanning && !success && (
                <div className="kaf-qr-box" onClick={startScan}>
                    <svg className="kaf-qr-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="35" height="35" rx="4" fill="none" stroke="#224594" strokeWidth="5" />
                        <rect x="15" y="15" width="15" height="15" fill="#224594" />
                        <rect x="60" y="5" width="35" height="35" rx="4" fill="none" stroke="#224594" strokeWidth="5" />
                        <rect x="70" y="15" width="15" height="15" fill="#224594" />
                        <rect x="5" y="60" width="35" height="35" rx="4" fill="none" stroke="#224594" strokeWidth="5" />
                        <rect x="15" y="70" width="15" height="15" fill="#224594" />
                        <rect x="60" y="60" width="10" height="10" fill="#224594" />
                        <rect x="75" y="60" width="10" height="10" fill="#224594" />
                        <rect x="60" y="75" width="10" height="10" fill="#224594" />
                        <rect x="75" y="75" width="10" height="10" fill="#224594" />
                        <rect x="45" y="5" width="10" height="10" fill="#224594" />
                        <rect x="45" y="20" width="10" height="10" fill="#224594" />
                        <rect x="45" y="35" width="10" height="10" fill="#224594" />
                        <rect x="5" y="45" width="10" height="10" fill="#224594" />
                        <rect x="20" y="45" width="10" height="10" fill="#224594" />
                        <rect x="35" y="45" width="10" height="10" fill="#224594" />
                    </svg>
                    <p className="kaf-qr-hint">Bosing va skanerlang</p>
                    {error && <p className="qr-error-text">{error}</p>}
                </div>
            )}

            {scanning && (
                <div className="kaf-qr-scanner-wrap">
                    <div className="qr-camera-box">
                        <video ref={videoRef} className="kaf-qr-live" playsInline muted />
                        <canvas ref={canvasRef} className="qr-scan-buffer" aria-hidden="true" />
                        <div className="qr-corner qr-corner-tl" />
                        <div className="qr-corner qr-corner-tr" />
                        <div className="qr-corner qr-corner-bl" />
                        <div className="qr-corner qr-corner-br" />
                        <div className="qr-scan-line" />
                    </div>
                    <p className="qr-camera-hint">QR kodni ramkaga to'g'rilang</p>
                    <button className="kaf-qr-stop" onClick={stopScan}>
                        Bekor qilish
                    </button>
                </div>
            )}
        </div>
    );
}

export default QrScanner;
