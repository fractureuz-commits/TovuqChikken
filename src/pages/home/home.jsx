import './home.css'
import './homeMedia.css'
import { useCallback, useEffect, useState } from "react";
import BuyurtmaModal from '../../componrnts/BuyurtmaModal/BuyurtmaModal';
import Header from '../../header/header';
import SyncButton from '../../componrnts/SyncButton/SyncButton';
import { loadProducts } from '../../utils/storage';
import KorzinkaModal from '../../componrnts/Korzinka/korzinka';
import CartModal from '../../componrnts/Korzinka/Cart';
import TolovModal from '../../componrnts/TolovModal/TolovModal';
import HisobotModal from '../../componrnts/Hisobotlar/HisobotTypeSelect';
import Swal from 'sweetalert2';
import TolovPage from '../tolovlar/tolovlar';
import QaytarishModal from '../../componrnts/BuyurtmaModal/qaytarish';
import HarajatPage from '../tolovlar/Harajatlar';
import SavdolarPage from '../tolovlar/Savdolar';
import { getUser } from '../../leyout/login/auth';
import Loader from '../../componrnts/loader/loader';
import { listQueueItems, QUEUE_CHANGED_EVENT, QUEUE_TYPES } from '../../utils/offlineQueue';
import { hasPermission } from '../../utils/permissions';
import { uploadQueueBatches } from '../../utils/backendSync';
import { getSavdoConfirmIds, getSavdoPayload, normalizeSavdoId, withSavdoItemId } from '../../utils/savdoIdentity';

const queueCountValue = (value) => value ?? "";
const positiveCount = (value) => Number(value || 0) > 0;

const saveOrderHistory = (order) => {
    const oldOrders = JSON.parse(localStorage.getItem("buyurtmalar") || "[]");
    const exists = oldOrders.some(item => String(item.id) === String(order.id));

    if (!exists) {
        localStorage.setItem("buyurtmalar", JSON.stringify([...oldOrders, order]));
    }
};

function Home() {
    const user = getUser()
    const [openBuyurtma, setOpenBuyurtma] = useState(false);
    const [OpenQaytarish, setOpenQaytarish] = useState(false);
    const FormData = JSON.parse(localStorage.getItem("formData") || "{}");
    const [tolovlarCount, setTolovlarCount] = useState(null);
    const [harajatlarCount, setHarajatlarCount] = useState(null);
    const [savdolarCount, setSavdolarCount] = useState(null);
    const reloadTolovlar = useCallback(async () => {
        try {
            const [tolovlar, harajatlar, savdolar] = await Promise.all([
                listQueueItems(QUEUE_TYPES.TOLOVLAR),
                listQueueItems(QUEUE_TYPES.HARAJATLAR),
                listQueueItems(QUEUE_TYPES.SAVDOLAR),
            ]);
            const tolovCount = tolovlar.length;
            const harajatCount = harajatlar.length;
            const savdoCount = savdolar.length;

            setTolovlarCount(tolovCount);
            setHarajatlarCount(harajatCount);
            setSavdolarCount(savdoCount);
            return { tolovCount, harajatCount, savdoCount, tolovlar, harajatlar, savdolar };
        } catch (err) {
            console.error("Yuborilmagan amallar sanog'ini yangilashda xato:", err);
            return null;
        }
    }, []);
    const refreshQueueCounts = useCallback(async () => {
        await reloadTolovlar();
        window.setTimeout(reloadTolovlar, 0);
        window.setTimeout(reloadTolovlar, 150);
    }, [reloadTolovlar]);

    const handleTolovlarChange = useCallback(async (rows) => {
        if (Array.isArray(rows)) setTolovlarCount(rows.length);
        await refreshQueueCounts();
    }, [refreshQueueCounts]);

    const handleHarajatlarChange = useCallback(async (rows) => {
        if (Array.isArray(rows)) setHarajatlarCount(rows.length);
        await refreshQueueCounts();
    }, [refreshQueueCounts]);

    const handleSavdolarChange = useCallback(async (rows) => {
        if (Array.isArray(rows)) setSavdolarCount(rows.length);
        await refreshQueueCounts();
    }, [refreshQueueCounts]);
    const CART_KEY = "buyurtma_cart";
    const Qaytarish_KEY = "qaytarish";
    const FormData_KEY = "formData";
    const isEmpty = Object.keys(FormData).length === 0;
    const [, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Yuklanmoqda...");
    const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
    const [activeView, setActiveView] = useState("sotib"); // "sotib" | "cart"
    const [Korzinka, setKorzinka] = useState(false);
    const [TolovPageModal, setTolovPageModal] = useState(false);
    const [HarajatModal, setHarajatModal] = useState(false);
    const [SavdolarModal, setSavdolarModal] = useState(false);
    const [Tolov, setTolov] = useState(false);
    const [Hissobot, setHissobot] = useState(false);
    useEffect(() => {
        loadProducts().then(data => {
            if (data) setProducts(data);
            setLoading(false);
        });
    }, []);
    useEffect(() => {
        reloadTolovlar();

        const handleQueueChange = () => {
            reloadTolovlar();
        };
        const handleVisibilityChange = () => {
            if (!document.hidden) reloadTolovlar();
        };

        window.addEventListener(QUEUE_CHANGED_EVENT, handleQueueChange);
        window.addEventListener("focus", handleQueueChange);
        window.addEventListener("pageshow", handleQueueChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        const intervalId = window.setInterval(handleQueueChange, 1000);

        return () => {
            window.removeEventListener(QUEUE_CHANGED_EVENT, handleQueueChange);
            window.removeEventListener("focus", handleQueueChange);
            window.removeEventListener("pageshow", handleQueueChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.clearInterval(intervalId);
        };
    }, [reloadTolovlar]);
    // ✅ Sync tugaganda state yangilanadi
    const handleSyncComplete = (newProducts) => {
        setProducts([...newProducts]); // ← yangi array reference
    };
    const handleUploadProgress = useCallback(({ stage, current, total }) => {
        setLoadingMessage(stage || "Serverga yuborilmoqda...");
        setLoadingProgress({ current, total });
    }, []);

    const startLoading = useCallback((message) => {
        setLoadingMessage(message);
        setLoadingProgress({ current: 0, total: 0 });
        setLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setLoading(false);
        setLoadingMessage("Yuklanmoqda...");
        setLoadingProgress({ current: 0, total: 0 });
    }, []);

    const sendTolovlarQueue = async () => {
        const syncedCount = await uploadQueueBatches({
            type: QUEUE_TYPES.TOLOVLAR,
            endpoint: "tovuq/hs/tulov//mas_tulov/",
            makePayload: (batch) => ({ tulovlar: batch }),
            getConfirmedIds: (res) => (res?.id_lar || []).map(item => item.id),
            onProgress: handleUploadProgress,
        });

        await reloadTolovlar();
        return syncedCount;
    };

    const sendHarajatlarQueue = async () => {
        const syncedCount = await uploadQueueBatches({
            type: QUEUE_TYPES.HARAJATLAR,
            endpoint: "tovuq/hs/kassa_chiqim/get_kassa_chiqim/",
            makePayload: (batch) => ({ kassa_chiqim: batch }),
            getConfirmedIds: (res) => (res?.text || []).map(item => item.ID),
            onProgress: handleUploadProgress,
        });

        await reloadTolovlar();
        return syncedCount;
    };

    const sendSavdolarQueue = async () => {
        const syncedCount = await uploadQueueBatches({
            type: QUEUE_TYPES.SAVDOLAR,
            endpoint: "tovuq/hs/realizz/realizz",
            makePayload: (batch) => {
                const orders = batch.map(withSavdoItemId);

                orders.forEach(order => {
                    const payload = getSavdoPayload(order);
                    const historyOrder = order?.data
                        ? order
                        : {
                            id: order.id,
                            itemId: order.itemId,
                            sana: order.sana || payload.date || new Date().toLocaleString("uz-UZ"),
                            created_at: order.created_at || new Date().toISOString(),
                            data: payload,
                            date: payload.date,
                        };

                    saveOrderHistory(historyOrder);
                });

                const payloads = orders.map(getSavdoPayload);
                return { realiz: payloads };
            },
            getConfirmedIds: (res, batch) => {
                const idsFromServer = [
                    ...(res?.id_lar || []),
                    ...(res?.text || []),
                    ...(Array.isArray(res) ? res : []),
                ].map(item => item?.itemId ?? item?.id ?? item?.ID ?? item).map(normalizeSavdoId).filter(Boolean);

                return batch
                    .filter(order => getSavdoConfirmIds(order).some(id => idsFromServer.includes(id)))
                    .map(order => order.id);
            },
            removeWithoutIds: false,
            onProgress: handleUploadProgress,
        });

        await reloadTolovlar();
        return syncedCount;
    };
    const handleTolovlarQueue = async ({ showSuccess = true } = {}) => {
        startLoading("To'lovlar serverga yuborilmoqda...");
        try {
            const syncedCount = await sendTolovlarQueue();

            if (showSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Yuborildi!",
                    text: `${syncedCount} ta to'lov sinxron qilindi`,
                    timer: 1800,
                    showConfirmButton: false
                });
            }

            return syncedCount;
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#006CAC"
            });
            return 0;
        } finally {
            stopLoading();
        }
    };

    const handleHarajatlarQueue = async ({ showSuccess = true } = {}) => {
        startLoading("Xarajatlar serverga yuborilmoqda...");
        try {
            const syncedCount = await sendHarajatlarQueue();

            if (showSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Yuborildi!",
                    text: `${syncedCount} ta harajat sinxron qilindi`,
                    timer: 1800,
                    showConfirmButton: false
                });
            }

            return syncedCount;
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#006CAC"
            });
            return 0;
        } finally {
            stopLoading();
        }
    };

    const handleSavdolarQueue = async ({ showSuccess = true } = {}) => {
        startLoading("Savdolar serverga yuborilmoqda...");
        try {
            const syncedCount = await sendSavdolarQueue();

            if (showSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Yuborildi!",
                    text: `${syncedCount} ta savdo sinxron qilindi`,
                    timer: 1800,
                    showConfirmButton: false
                });
            }

            return syncedCount;
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Xato!",
                text: err.message,
                confirmButtonColor: "#006CAC"
            });
            return 0;
        } finally {
            stopLoading();
        }
    };

    const canShow = (permission) => hasPermission(user, permission);
    const visibleButtons = [
        canShow("savdo"),
        canShow("tolov"),
        canShow("hisobot"),
        canShow("qaytarish"),
        true, // Yuborish doim bor
        true, // SyncButton doim bor
    ].filter(Boolean).length;
    const getGridClass = () => {
        if (visibleButtons === 1) return "grid-1";
        if (visibleButtons === 2) return "grid-2";
        if (visibleButtons === 3) return "grid-3";
        if (visibleButtons === 4) return "grid-2";
        return "grid-3"; // 5 va 6 ta uchun
    };
    const queueCardsCount = [
        canShow("tolov"),
        canShow("savdo"),
        canShow("harajat"),
    ].filter(Boolean).length;
    return (
        <>
            <div className="home-page-wrapper">
                <Header />
                <div className="mobil-container">
                    {(canShow("savdo") || canShow("harajat") || canShow("tolov")) && (
                        <div className={`home-header ${queueCardsCount >= 3 ? "many" : ""}`}>
                            {canShow("tolov") && (
                                <button
                                    onClick={() => setTolovPageModal(true)}
                                    className="information"
                                >
                                    <p className='counter' data-i18n-skip="true">{queueCountValue(tolovlarCount)}</p>
                                    <p className='counter-title'>Yuborilmagan to&apos;lovlar</p>
                                </button>
                            )}
                            {canShow("savdo") && (
                                <button
                                    className="information"
                                    onClick={() => setSavdolarModal(true)}
                                >
                                    <p className='counter' data-i18n-skip="true">{queueCountValue(savdolarCount)}</p>
                                    <p className='counter-title'>Yuborilmagan savdolar</p>
                                </button>
                            )}

                            {canShow("harajat") && (
                                <button
                                    className="information"
                                    onClick={() => setHarajatModal(true)}
                                >
                                    <p className='counter' data-i18n-skip="true">{queueCountValue(harajatlarCount)}</p>
                                    <p className='counter-title'>Yuborilmagan xarajatlar</p>
                                </button>
                            )}


                        </div>
                    )}
                </div>
                <div className="home-body"
                    style={(canShow("savdo") || canShow("harajat") || canShow("tolov")) ? {} : { marginTop: "10px" }}
                >
                    <div className="mobil-container">
                        <div className={`home-pages ${getGridClass()}`}>
                            {/* SAVDO */}
                            {canShow("savdo") && (
                                <button
                                    onClick={() => {
                                        if (isEmpty) setOpenBuyurtma(true);
                                        else setKorzinka(true);
                                    }}
                                    className={"button"}
                                    // className={positiveCount(savdolarCount) ? "has-badge button" : "button"}
                                    // data-badge={positiveCount(savdolarCount) ? savdolarCount : undefined}
                                    style={!canShow("tolov") ? { width: '100%' } : {}}

                                >
                                    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2001_57)">
                                            <path d="M21 7C21.8573 7.00011 22.6847 7.31485 23.3253 7.8845C23.9659 8.45416 24.3752 9.23912 24.4755 10.0905L24.5 10.5V14.238L70.2485 17.5105C71.1477 17.5742 71.9877 17.9824 72.5934 18.65C73.1991 19.3177 73.5239 20.1933 73.5 21.0945L73.465 21.4935L69.965 45.9935C69.8561 46.7607 69.4956 47.4701 68.9401 48.0104C68.3846 48.5507 67.6655 48.8914 66.8955 48.979L66.5 49H24.5V56H59.5C61.5504 56.0001 63.556 56.6006 65.2691 57.7273C66.9822 58.854 68.328 60.4576 69.1403 62.3403C69.9526 64.223 70.1959 66.3023 69.8402 68.3216C69.4845 70.341 68.5453 72.212 67.1385 73.7038C65.7318 75.1955 63.919 76.2428 61.924 76.7162C59.929 77.1897 57.839 77.0687 55.9119 76.3681C53.9849 75.6676 52.3051 74.4181 51.0799 72.774C49.8548 71.1298 49.1378 69.1629 49.0175 67.116L49 66.5L49.0175 65.884C49.077 64.876 49.2765 63.91 49.5985 63H30.9015C31.401 64.4169 31.5907 65.9246 31.4576 67.4211C31.3246 68.9176 30.8719 70.3681 30.1302 71.6747C29.3885 72.9813 28.3751 74.1135 27.1583 74.9948C25.9416 75.8761 24.5498 76.4861 23.0771 76.7835C21.6044 77.0808 20.0851 77.0587 18.6217 76.7185C17.1583 76.3784 15.7849 75.7282 14.5944 74.8118C13.4038 73.8953 12.4237 72.7341 11.7204 71.4065C11.0171 70.0789 10.6069 68.6158 10.5175 67.116L10.5 66.5L10.5175 65.884C10.6386 63.8205 11.3657 61.8386 12.6077 60.1863C13.8497 58.5341 15.5515 57.2848 17.5 56.595V14H14C13.1427 13.9999 12.3153 13.6852 11.6747 13.1155C11.0341 12.5458 10.6248 11.7609 10.5245 10.9095L10.5 10.5C10.5001 9.64273 10.8148 8.81532 11.3845 8.1747C11.9542 7.53408 12.7391 7.1248 13.5905 7.0245L14 7H21ZM21 63C20.0717 63 19.1815 63.3687 18.5251 64.0251C17.8687 64.6815 17.5 65.5717 17.5 66.5C17.5 67.4283 17.8687 68.3185 18.5251 68.9749C19.1815 69.6313 20.0717 70 21 70C21.9283 70 22.8185 69.6313 23.4749 68.9749C24.1313 68.3185 24.5 67.4283 24.5 66.5C24.5 65.5717 24.1313 64.6815 23.4749 64.0251C22.8185 63.3687 21.9283 63 21 63ZM59.5 63C58.5717 63 57.6815 63.3687 57.0251 64.0251C56.3687 64.6815 56 65.5717 56 66.5C56 67.4283 56.3687 68.3185 57.0251 68.9749C57.6815 69.6313 58.5717 70 59.5 70C60.4283 70 61.3185 69.6313 61.9749 68.9749C62.6313 68.3185 63 67.4283 63 66.5C63 65.5717 62.6313 64.6815 61.9749 64.0251C61.3185 63.3687 60.4283 63 59.5 63Z" fill="white" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2001_57">
                                                <rect width="84" height="84" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p>Savdo</p>
                                </button>
                            )}
                            {/* TOLOV */}
                            {canShow("tolov") && (
                                <button className="button"
                                    style={!canShow("savdo") ? { width: '100%' } : {}}
                                    onClick={() => setTolov(true)}>
                                    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2001_61)">
                                            <path d="M59.5 28V17.5C59.5 16.5717 59.1313 15.6815 58.4749 15.0251C57.8185 14.3687 56.9283 14 56 14H21C19.1435 14 17.363 14.7375 16.0503 16.0503C14.7375 17.363 14 19.1435 14 21M14 21C14 22.8565 14.7375 24.637 16.0503 25.9497C17.363 27.2625 19.1435 28 21 28H63C63.9283 28 64.8185 28.3687 65.4749 29.0251C66.1313 29.6815 66.5 30.5717 66.5 31.5V42M14 21V63C14 64.8565 14.7375 66.637 16.0503 67.9497C17.363 69.2625 19.1435 70 21 70H63C63.9283 70 64.8185 69.6313 65.4749 68.9749C66.1313 68.3185 66.5 67.4283 66.5 66.5V56" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M70 42V56H56C54.1435 56 52.363 55.2625 51.0503 53.9497C49.7375 52.637 49 50.8565 49 49C49 47.1435 49.7375 45.363 51.0503 44.0503C52.363 42.7375 54.1435 42 56 42H70Z" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2001_61">
                                                <rect width="84" height="84" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p>To’lov</p>
                                </button>
                            )}

                            {/* HISOBOT */}
                            {canShow("hisobot") && (
                                <button className="button"
                                    style={!canShow("qaytarish") ? { width: '100%', } : {}}

                                    onClick={() => setHissobot(true)}>
                                    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2001_69)">
                                            <path d="M10.5 45.5C10.5 44.5717 10.8687 43.6815 11.5251 43.0251C12.1815 42.3687 13.0717 42 14 42H28C28.9283 42 29.8185 42.3687 30.4749 43.0251C31.1313 43.6815 31.5 44.5717 31.5 45.5V66.5C31.5 67.4283 31.1313 68.3185 30.4749 68.9749C29.8185 69.6313 28.9283 70 28 70H14C13.0717 70 12.1815 69.6313 11.5251 68.9749C10.8687 68.3185 10.5 67.4283 10.5 66.5V45.5Z" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M52.5 31.5C52.5 30.5717 52.8687 29.6815 53.5251 29.0251C54.1815 28.3687 55.0717 28 56 28H70C70.9283 28 71.8185 28.3687 72.4749 29.0251C73.1313 29.6815 73.5 30.5717 73.5 31.5V66.5C73.5 67.4283 73.1313 68.3185 72.4749 68.9749C71.8185 69.6313 70.9283 70 70 70H56C55.0717 70 54.1815 69.6313 53.5251 68.9749C52.8687 68.3185 52.5 67.4283 52.5 66.5V31.5Z" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M31.5 17.5C31.5 16.5717 31.8687 15.6815 32.5251 15.0251C33.1815 14.3687 34.0717 14 35 14H49C49.9283 14 50.8185 14.3687 51.4749 15.0251C52.1313 15.6815 52.5 16.5717 52.5 17.5V66.5C52.5 67.4283 52.1313 68.3185 51.4749 68.9749C50.8185 69.6313 49.9283 70 49 70H35C34.0717 70 33.1815 69.6313 32.5251 68.9749C31.8687 68.3185 31.5 67.4283 31.5 66.5V17.5Z" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14 70H63" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2001_69">
                                                <rect width="84" height="84" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p>Xisobot</p>
                                </button>
                            )}

                            {/* QAYTARISH */}
                            {canShow("qaytarish") && (
                                <button
                                    className="button"
                                    onClick={() => {
                                        setOpenQaytarish(true);
                                        localStorage.removeItem(CART_KEY);
                                        localStorage.removeItem(Qaytarish_KEY);
                                        localStorage.removeItem(FormData_KEY);
                                    }}
                                    style={!canShow("hisobot") ? {
                                        width: '100%',
                                        // flexDirection:'row' ,justifyContent:"start" , gap:'10px'
                                    } : {}}
                                >
                                    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2001_97)">
                                            <path d="M35.315 14.034L37.051 12.3015C38.3637 10.9892 40.1438 10.252 42 10.252C43.8561 10.252 45.6363 10.9892 46.949 12.3015L71.6975 37.0465C72.3483 37.6966 72.8646 38.4686 73.2169 39.3184C73.5692 40.1682 73.7505 41.079 73.7505 41.999C73.7505 42.9189 73.5692 43.8298 73.2169 44.6795C72.8646 45.5293 72.3483 46.3013 71.6975 46.9515L46.9525 71.6965C46.3024 72.3473 45.5304 72.8636 44.6806 73.2159C43.8308 73.5681 42.9199 73.7495 42 73.7495C41.0801 73.7495 40.1692 73.5681 39.3194 73.2159C38.4696 72.8636 37.6976 72.3473 37.0475 71.6965L12.3025 46.9515C11.6517 46.3013 11.1353 45.5293 10.7831 44.6795C10.4308 43.8298 10.2495 42.9189 10.2495 41.999C10.2495 41.079 10.4308 40.1682 10.7831 39.3184C11.1353 38.4686 11.6517 37.6966 12.3025 37.0465L24.675 24.674H10.717" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M24.675 38.6323V24.6743" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2001_97">
                                                <rect width="84" height="84" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p>Qaytarish</p>
                                </button>
                            )}

                            {/* YUBORISH */}
                            <button
                                className="button"
                                onClick={async () => {
                                    const result = await Swal.fire({
                                        title: "Yuborishni hohlaysizmi?",
                                        text: "Savdolar, to'lovlar va harajatlar serverga yuboriladi",
                                        icon: "question",
                                        showCancelButton: true,
                                        confirmButtonText: "Ha",
                                        cancelButtonText: "Yo‘q",
                                        confirmButtonColor: "#006CAC",
                                        cancelButtonColor: "#d33"
                                    });

                                    if (result.isConfirmed) {
                                        const counts = await reloadTolovlar();
                                        const tolovCount = counts?.tolovCount || 0;
                                        const harajatCount = counts?.harajatCount || 0;
                                        const savdoCount = counts?.savdoCount || 0;

                                        if (savdoCount === 0 && tolovCount === 0 && harajatCount === 0) {
                                            Swal.fire({
                                                icon: "warning",
                                                title: "Yuboriladigan amallar yoq!",
                                                confirmButtonColor: "#006CAC"
                                            });
                                            return;
                                        }

                                        startLoading("Serverga yuborilmoqda...");
                                        try {
                                            const syncedSavdolar = savdoCount > 0
                                                ? await sendSavdolarQueue()
                                                : 0;
                                            const syncedTolovlar = tolovCount > 0
                                                ? await sendTolovlarQueue()
                                                : 0;
                                            const syncedHarajatlar = harajatCount > 0
                                                ? await sendHarajatlarQueue()
                                                : 0;

                                            Swal.fire({
                                                icon: "success",
                                                title: "Yuborildi!",
                                                text: `${syncedSavdolar} ta savdo, ${syncedTolovlar} ta to'lov, ${syncedHarajatlar} ta harajat sinxron qilindi`,
                                                timer: 1800,
                                                showConfirmButton: false
                                            });
                                        } catch (err) {
                                            Swal.fire({
                                                icon: "error",
                                                title: "Xato!",
                                                text: err.message,
                                                confirmButtonColor: "#006CAC"
                                            });
                                        } finally {
                                            stopLoading();
                                        }
                                    }
                                }}
                            >
                                <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_2001_86)">
                                        <path d="M24.5 63.0007C20.1329 63.0007 15.9448 61.3413 12.8568 58.3876C9.76885 55.4339 8.03406 51.4278 8.03406 47.2507C8.03406 43.0735 9.76885 39.0675 12.8568 36.1138C15.9448 33.1601 20.1329 31.5007 24.5 31.5007C25.5314 26.9058 28.5486 22.8679 32.888 20.2752C35.0367 18.9914 37.4452 18.1011 39.9762 17.6551C42.5071 17.2091 45.1109 17.2161 47.6389 17.6757C50.1668 18.1353 52.5694 19.0386 54.7095 20.3339C56.8496 21.6292 58.6852 23.2912 60.1116 25.2249C61.538 27.1587 62.5273 29.3264 63.0229 31.6043C63.5184 33.8821 63.5107 36.2255 63 38.5007H66.5C69.7489 38.5007 72.8647 39.7913 75.162 42.0886C77.4593 44.3859 78.75 47.5018 78.75 50.7507C78.75 53.9996 77.4593 57.1154 75.162 59.4127C72.8647 61.7101 69.7489 63.0007 66.5 63.0007H63" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M31.5 52.5L42 42L52.5 52.5" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M42 42V73.5" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_2001_86">
                                            <rect width="84" height="84" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <p>Yuborish</p>
                            </button>

                            <SyncButton onSyncComplete={handleSyncComplete} />
                        </div>
                    </div>
                </div>
            </div>
            {loading && (
                <Loader
                    message={loadingMessage}
                    current={loadingProgress.current}
                    total={loadingProgress.total}
                />
            )}
            {SavdolarModal &&
                <SavdolarPage
                    onBack={() => {
                        setSavdolarModal(false)
                        refreshQueueCounts()
                    }}
                    onSend={handleSavdolarQueue}
                    onQueueChange={handleSavdolarChange}
                />
            }
            {TolovPageModal &&
                <TolovPage
                    onBack={() => {
                        setTolovPageModal(false)
                        refreshQueueCounts()
                    }}
                    onSend={handleTolovlarQueue}
                    onQueueChange={handleTolovlarChange}
                />
            }
            {HarajatModal &&
                <HarajatPage
                    onBack={() => {
                        setHarajatModal(false)
                        refreshQueueCounts()
                    }}
                    onSend={handleHarajatlarQueue}
                    onQueueChange={handleHarajatlarChange}
                />
            }
            {activeView === "sotib" && Korzinka &&
                <KorzinkaModal
                    handleModal={() => {
                        const formData = JSON.parse(localStorage.getItem("formData") || "{}");
                        if (Object.keys(formData).length === 0) {
                            setKorzinka(false)
                            setOpenBuyurtma(false);
                            refreshQueueCounts();
                        } else {
                            setKorzinka(false);
                            refreshQueueCounts();

                        }
                    }}
                    KorzinkaModal={() => {
                        setActiveView("cart");
                        refreshQueueCounts();
                    }}
                />
            }
            {Tolov &&
                <TolovModal
                    onClose={(rows) => {
                        setTolov(false);
                        if (Array.isArray(rows)) setTolovlarCount(rows.length);
                        refreshQueueCounts();
                    }}
                    setTolovlar={handleTolovlarChange}
                />
            }
            {Hissobot &&
                <HisobotModal
                    onClose={() => {
                        setHissobot(false);
                        refreshQueueCounts();
                    }}
                />
            }
            {activeView === "cart" && (
                <CartModal
                    onClose={() => {
                        setActiveView("sotib");
                        refreshQueueCounts();
                    }}
                    onExit={() => {
                        setActiveView("sotib")
                        setOpenBuyurtma(false)
                        refreshQueueCounts();

                    }}
                    KorzinkaModal={() => {
                        setActiveView("sotib");
                        refreshQueueCounts();
                    }} // ← SOTIB OLISH bosilsa
                />
            )}
            {openBuyurtma && <BuyurtmaModal onClose={() => {
                setOpenBuyurtma(false);
                refreshQueueCounts();
            }}
            />}
            {OpenQaytarish && <QaytarishModal onClose={() => {
                setOpenQaytarish(false);
                refreshQueueCounts();
            }}
            />}
        </>);
}

export default Home;
