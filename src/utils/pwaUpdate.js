import { Capacitor } from "@capacitor/core";

let updateSWFn = null;
const needRefreshListeners = new Set();

export function initPwaUpdate() {
    if (Capacitor.isNativePlatform()) return;
    if (!("serviceWorker" in navigator)) return;

    import("virtual:pwa-register")
        .then(({ registerSW }) => {
            updateSWFn = registerSW({
                immediate: true,
                onNeedRefresh() {
                    needRefreshListeners.forEach((cb) => cb());
                },
                onRegisteredSW(_swUrl, registration) {
                    if (!registration) return;
                    setInterval(() => {
                        registration.update().catch(() => {});
                    }, 30 * 60 * 1000);
                },
            });
        })
        .catch(() => {});
}

export function onPwaNeedRefresh(callback) {
    needRefreshListeners.add(callback);
    return () => needRefreshListeners.delete(callback);
}

export async function applyPwaUpdate() {
    if (updateSWFn) await updateSWFn(true);
}

export async function checkForPwaUpdateManually() {
    if (Capacitor.isNativePlatform()) return false;
    if (!("serviceWorker" in navigator)) return false;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    await registration.update();

    for (let i = 0; i < 10; i += 1) {
        if (registration.waiting) return true;
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return !!registration.waiting;
}
