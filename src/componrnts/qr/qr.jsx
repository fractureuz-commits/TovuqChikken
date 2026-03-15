import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./qrScanner.css";

function QrScanner({ onScan }) {
    const [scanning, setScanning] = useState(false);
    const [success, setSuccess] = useState(false);
    const [scannedData, setScannedData] = useState("");
    const scannerRef = useRef(null);
    const isRunningRef = useRef(false);

    useEffect(() => {
        if (!scanning) return;

        const html5Qrcode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5Qrcode;

        html5Qrcode.start(
            { facingMode: "environment" },
            {
                fps: 30,                          // ✅ yuqori fps — tezroq focus
                qrbox: { width: 230, height: 230 },
                aspectRatio: 1.0,
                disableFlip: false,
                videoConstraints: {
                    facingMode: "environment",
                    focusMode: "continuous",      // ✅ doimiy autofocus
                    advanced: [{ focusMode: "continuous" }],
                }
            },
            (decodedText) => {
                handleSuccess(decodedText);
            },
            () => {}
        )
        .then(() => { isRunningRef.current = true; })
        .catch((err) => {
            console.error("Kamera ochilmadi:", err);
            isRunningRef.current = false;
            setScanning(false);
        });

        return () => {
            if (scannerRef.current && isRunningRef.current) {
                scannerRef.current.stop()
                    .then(() => { scannerRef.current?.clear(); isRunningRef.current = false; })
                    .catch(() => {});
            }
        };
    }, [scanning]);

    const handleSuccess = async (data) => {
        // ✅ avval scanner to'xtatamiz
        if (scannerRef.current && isRunningRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) {}
            isRunningRef.current = false;
        }
        setScanning(false);
        setScannedData(data);
        setSuccess(true);  // ✅ success animatsiyasini boshlaydi

        // 2 sekunddan keyin formaga yuboradi va yopiladi
        setTimeout(() => {
            onScan(data);
            setSuccess(false);
            setScannedData("");
        }, 2000);
    };

    const stopScan = async () => {
        if (scannerRef.current && isRunningRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) {}
            finally {
                isRunningRef.current = false;
                scannerRef.current = null;
            }
        }
        setScanning(false);
    };

    return (
        <div className="qr-wrap">

            {/* ── SUCCESS animatsiya ── */}
            {success && (
                <div className="qr-success-overlay">
                    <div className="qr-success-card">
                        <div className="qr-checkmark">
                            <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                                <circle className="qr-check-circle" cx="26" cy="26" r="25" fill="none"/>
                                <path className="qr-check-tick" fill="none" d="M14 27l8 8 16-16"/>
                            </svg>
                        </div>
                        <p className="qr-success-title">Muvaffaqiyatli!</p>
                        <p className="qr-success-data">{scannedData}</p>
                    </div>
                </div>
            )}

            {/* ── QR ikonka (skan qilmasdan oldin) ── */}
            {!scanning && !success && (
                <div className="kaf-qr-box" onClick={() => setScanning(true)}>
                    <svg className="kaf-qr-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5"  y="5"  width="35" height="35" rx="4" fill="none" stroke="#224594" strokeWidth="5"/>
                        <rect x="15" y="15" width="15" height="15" fill="#224594"/>
                        <rect x="60" y="5"  width="35" height="35" rx="4" fill="none" stroke="#224594" strokeWidth="5"/>
                        <rect x="70" y="15" width="15" height="15" fill="#224594"/>
                        <rect x="5"  y="60" width="35" height="35" rx="4" fill="none" stroke="#224594" strokeWidth="5"/>
                        <rect x="15" y="70" width="15" height="15" fill="#224594"/>
                        <rect x="60" y="60" width="10" height="10" fill="#224594"/>
                        <rect x="75" y="60" width="10" height="10" fill="#224594"/>
                        <rect x="60" y="75" width="10" height="10" fill="#224594"/>
                        <rect x="75" y="75" width="10" height="10" fill="#224594"/>
                        <rect x="45" y="5"  width="10" height="10" fill="#224594"/>
                        <rect x="45" y="20" width="10" height="10" fill="#224594"/>
                        <rect x="45" y="35" width="10" height="10" fill="#224594"/>
                        <rect x="5"  y="45" width="10" height="10" fill="#224594"/>
                        <rect x="20" y="45" width="10" height="10" fill="#224594"/>
                        <rect x="35" y="45" width="10" height="10" fill="#224594"/>
                    </svg>
                    <p className="kaf-qr-hint">Bosing va skanerlang</p>
                </div>
            )}

            {/* ── Kamera oynasi ── */}
            {scanning && (
                <div className="kaf-qr-scanner-wrap">
                    <div className="qr-camera-box">
                        <div id="qr-reader" className="kaf-qr-live" />
                        {/* ✅ Burchak chiziqlari — focus ko'rsatkichi */}
                        <div className="qr-corner qr-corner-tl" />
                        <div className="qr-corner qr-corner-tr" />
                        <div className="qr-corner qr-corner-bl" />
                        <div className="qr-corner qr-corner-br" />
                        {/* ✅ Skanerlash chizig'i */}
                        <div className="qr-scan-line" />
                    </div>
                    <p className="qr-camera-hint">QR kodni ramkaga to'g'rilang</p>
                    <button className="kaf-qr-stop" onClick={stopScan}>
                        ✕ Bekor qilish
                    </button>
                </div>
            )}
        </div>
    );
}

export default QrScanner;