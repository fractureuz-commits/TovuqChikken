import { useEffect, useRef, useState } from "react";
import Loader from "../loader/loader";
import "../BuyurtmaModal/buyurtma.css";
import "./majburiySync.css";
import { checkInternet } from "../../utils/storage";
import { useBackHandler } from "../../utils/backButtonStack";

const RETRY_DELAY_MS = 5000;

// phase: "checking" (internet tekshirilmoqda) | "syncing" (onSend/onDownload
// o'zining loaderini ko'rsatadi, bu yerda alohida UI kerak emas) | "offline"
export default function MajburiySync({ onSend, onDownload, onFinished }) {
    const [phase, setPhase] = useState("checking");
    const attemptingRef = useRef(false);
    const mountedRef = useRef(true);
    const timerRef = useRef(null);

    // Sinxronizatsiya tugamaguncha ilovadan chiqib ketilmasin, lekin mijozga
    // "majburiy" ekanini bildiradigan xabar chiqarilmaydi.
    useBackHandler(() => {});

    useEffect(() => {
        mountedRef.current = true;

        const scheduleRetry = () => {
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(attemptSync, RETRY_DELAY_MS);
        };

        const attemptSync = async () => {
            if (attemptingRef.current || !mountedRef.current) return;
            attemptingRef.current = true;
            setPhase("checking");

            const online = await checkInternet();
            if (!online) {
                if (mountedRef.current) setPhase("offline");
                attemptingRef.current = false;
                scheduleRetry();
                return;
            }

            if (mountedRef.current) setPhase("syncing");

            try {
                await onSend?.();
                await onDownload?.();
                if (mountedRef.current) onFinished?.();
            } catch {
                if (mountedRef.current) setPhase("offline");
                scheduleRetry();
            } finally {
                attemptingRef.current = false;
            }
        };

        attemptSync();
        window.addEventListener("online", attemptSync);

        return () => {
            mountedRef.current = false;
            window.removeEventListener("online", attemptSync);
            window.clearTimeout(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (phase === "offline") {
        return (
            <div className="overlay" style={{ flexDirection: "column" }}>
                <div className="app-safe">
                    <div className="modal force-sync-modal">
                        <div className="force-sync-icon">📡</div>
                        <h2 className="force-sync-title">Internetga ulaning</h2>
                        <p className="force-sync-text">
                            Internet aloqasi yo&apos;q. Ulanish tiklangach davom etadi.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "checking") {
        return <Loader message="Yuklanmoqda..." />;
    }

    // phase === "syncing": onSend/onDownload Home'dagi umumiy Loader'ni ko'rsatadi
    return null;
}
