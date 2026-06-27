import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "./pwaInstall.css";

const HIDDEN_UNTIL_KEY = "tovuq-pwa-install-hidden-until";
const HIDE_FOR_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

function isIosDevice() {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

function isSafariBrowser() {
    const ua = window.navigator.userAgent.toLowerCase();
    const vendor = window.navigator.vendor?.toLowerCase?.() || "";
    const isAppleBrowser = vendor.includes("apple") && ua.includes("safari");
    const isOtherIosBrowser = /crios|fxios|edgios|opios|duckduckgo|yabrowser/.test(ua);
    return isAppleBrowser && !isOtherIosBrowser;
}

function isNativeApp() {
    return window.Capacitor?.isNativePlatform?.() === true;
}

export default function PwaInstallButton({
    variant = "floating",
    className = "",
    icon = null,
    label = "Ilovani o'rnatish",
    showDivider = false,
}) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const isIos = useMemo(() => isIosDevice(), []);
    const isMenu = variant === "menu";

    useEffect(() => {
        if (isNativeApp() || isStandaloneMode()) return;

        const hiddenUntil = Number(localStorage.getItem(HIDDEN_UNTIL_KEY) || 0);
        if (!isMenu && hiddenUntil > Date.now()) return;

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setVisible(true);
        };

        const handleInstalled = () => {
            setDeferredPrompt(null);
            setVisible(false);
            localStorage.removeItem(HIDDEN_UNTIL_KEY);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleInstalled);

        if (isIos || isMenu) {
            setVisible(true);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, [isIos, isMenu]);

    const hideButton = () => {
        localStorage.setItem(HIDDEN_UNTIL_KEY, String(Date.now() + HIDE_FOR_MS));
        setVisible(false);
    };

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice.catch(() => null);

            if (choice?.outcome === "accepted") {
                setVisible(false);
            }

            setDeferredPrompt(null);
            return;
        }

        if (isIos) {
            if (isSafariBrowser()) {
                await Swal.fire({
                    icon: "info",
                    title: "iPhone ga qo'shish",
                    html: `
                        <div style="text-align:left; font-size:16px; line-height:1.45">
                            <p style="margin:0 0 10px">iOS ilovani avtomatik o'rnatishga ruxsat bermaydi.</p>
                            <ol style="margin:0; padding-left:20px">
                                <li>Pastdagi ulashish belgisini bosing.</li>
                                <li><b>Add to Home Screen</b> ni tanlang.</li>
                                <li><b>Add</b> tugmasini bosing.</li>
                            </ol>
                        </div>
                    `,
                    confirmButtonText: "Tushunarli",
                });
                return;
            }

            await Swal.fire({
                icon: "info",
                title: "iOS ga o'rnatish",
                html: `
                    <div style="text-align:left; font-size:16px; line-height:1.45">
                        <p style="margin:0 0 10px">iPhone/iPad uchun saytni Safari'da ochish kerak.</p>
                        <ol style="margin:0; padding-left:20px">
                            <li>Havolani Safari'da oching.</li>
                            <li>Ulashish belgisi -> <b>Add to Home Screen</b>.</li>
                            <li><b>Add</b> tugmasini bosing.</li>
                        </ol>
                    </div>
                `,
                confirmButtonText: "Tushunarli",
            });
            return;
        }

        await Swal.fire({
            icon: "info",
            title: "Ilovani o'rnatish",
            text: "Brauzer menyusidan Install app yoki Add to Home Screen ni tanlang.",
            confirmButtonText: "OK",
        });
    };

    if (!visible || isNativeApp() || isStandaloneMode()) return null;

    if (isMenu) {
        return (
            <>
                <button className={className || "menu-item"} type="button" onClick={handleInstall}>
                    {icon && <span className="menu-icon">{icon}</span>}
                    <span className="menu-label">{label}</span>
                </button>
                {showDivider && <div className="divider" />}
            </>
        );
    }

    return (
        <div className="pwa-install">
            <button className="pwa-install__button" type="button" onClick={handleInstall}>
                {label}
            </button>
            <button className="pwa-install__close" type="button" onClick={hideButton} aria-label="Yopish">
                {"\u00d7"}
            </button>
        </div>
    );
}
