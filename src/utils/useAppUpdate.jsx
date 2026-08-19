import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Capacitor } from "@capacitor/core";
import Loader from "../componrnts/loader/loader";
import { checkForNativeUpdate, CURRENT_VERSION } from "./appUpdate";
import ApkUpdater from "./nativeApkUpdater";
import { applyPwaUpdate, checkForPwaUpdateManually, onPwaNeedRefresh } from "./pwaUpdate";

const isAndroidNative = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

const escapeHtml = (str) =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

export const useAppUpdate = () => {
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [message, setMessage] = useState("Tekshirilmoqda...");
    const progressListenerRef = useRef(null);

    useEffect(() => {
        return () => {
            progressListenerRef.current?.remove?.();
        };
    }, []);

    const installNativeUpdate = async (release) => {
        const permission = await ApkUpdater.canInstallPackages();

        if (!permission.granted) {
            const confirm = await Swal.fire({
                icon: "warning",
                title: "Ruxsat kerak",
                text: "O'rnatishdan oldin \"Noma'lum ilovalarni o'rnatish\" ruxsatini yoqing.",
                showCancelButton: true,
                confirmButtonText: "Sozlamalarga o'tish",
                cancelButtonText: "Bekor qilish",
                confirmButtonColor: "#006CAC",
            });

            if (confirm.isConfirmed) {
                await ApkUpdater.openInstallPermissionSettings();
            }
            return;
        }

        setBusy(true);
        setMessage("Yuklab olinmoqda...");
        setProgress({ current: 0, total: 100 });

        progressListenerRef.current = await ApkUpdater.addListener("downloadProgress", (data) => {
            setProgress({ current: data.percent || 0, total: 100 });
        });

        try {
            await ApkUpdater.downloadAndInstall({ url: release.apkUrl });
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message || "Yuklab olishda xatolik yuz berdi",
                confirmButtonColor: "#006CAC",
            });
        } finally {
            progressListenerRef.current?.remove?.();
            progressListenerRef.current = null;
            setBusy(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    const promptNativeUpdate = async (release) => {
        const confirm = await Swal.fire({
            icon: "info",
            title: `Yangi versiya: ${release.version}`,
            html: release.notes
                ? `<div style="text-align:left; font-size:14px; white-space:pre-wrap">${escapeHtml(release.notes)}</div>`
                : "Yangi versiya mavjud.",
            showCancelButton: true,
            confirmButtonText: "Yangilash",
            cancelButtonText: "Keyinroq",
            confirmButtonColor: "#006CAC",
        });

        if (confirm.isConfirmed && release.apkUrl) {
            await installNativeUpdate(release);
        }
    };

    const promptPwaUpdate = async () => {
        const confirm = await Swal.fire({
            icon: "info",
            title: "Yangi versiya tayyor",
            text: "Ilovani yangilash uchun sahifa qayta yuklanadi.",
            showCancelButton: true,
            confirmButtonText: "Yangilash",
            cancelButtonText: "Keyinroq",
            confirmButtonColor: "#006CAC",
        });

        if (confirm.isConfirmed) {
            await applyPwaUpdate();
        }
    };

    const checkForUpdate = async ({ silent = false } = {}) => {
        if (!silent) {
            setBusy(true);
            setMessage("Yangilanish tekshirilmoqda...");
            setProgress({ current: 0, total: 0 });
        }

        let release = null;
        let hasPwaUpdate = false;
        let error = null;

        try {
            if (isAndroidNative()) {
                release = await checkForNativeUpdate();
            } else {
                hasPwaUpdate = await checkForPwaUpdateManually();
            }
        } catch (err) {
            error = err;
        } finally {
            if (!silent) setBusy(false);
        }

        if (error) {
            if (!silent) {
                await Swal.fire({
                    icon: "error",
                    title: "Xato!",
                    text: error.message || "Yangilanishni tekshirib bo'lmadi",
                    confirmButtonColor: "#006CAC",
                });
            }
            return;
        }

        if (isAndroidNative()) {
            if (release?.apkUrl) {
                await promptNativeUpdate(release);
            } else if (!silent) {
                await Swal.fire({
                    icon: "success",
                    title: "Eng so'nggi versiya",
                    text: `Sizda so'nggi versiya o'rnatilgan (${CURRENT_VERSION}).`,
                    confirmButtonColor: "#006CAC",
                    timer: 1800,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            }
            return;
        }

        if (hasPwaUpdate) {
            await promptPwaUpdate();
        } else if (!silent) {
            await Swal.fire({
                icon: "success",
                title: "Eng so'nggi versiya",
                text: "Sizda so'nggi versiya o'rnatilgan.",
                confirmButtonColor: "#006CAC",
                timer: 1800,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    useEffect(() => {
        const unsubscribe = onPwaNeedRefresh(() => {
            promptPwaUpdate();
        });
        return unsubscribe;
    }, []);

    const loader = busy ? <Loader message={message} current={progress.current} total={progress.total} /> : null;

    return { checkForUpdate, busy, loader };
};
