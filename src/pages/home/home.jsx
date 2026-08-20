import './home.css'
import './homeMedia.css'
import { useCallback, useEffect, useState } from "react";
import BuyurtmaModal from '../../features/sotuv/Buyurtma';
import Header from '../../header/header';
import { useBackendSync } from '../../componrnts/SyncButton/SyncButton';
import { loadProducts } from '../../utils/storage';
import KorzinkaModal from '../../features/sotuv/MahsulotGuruhlari';
import CartModal from '../../features/sotuv/Savat';
import TolovModal from '../../componrnts/TolovModal/TolovModal';
import HisobotModal from '../../componrnts/Hisobotlar/HisobotTypeSelect';
import Swal from 'sweetalert2';
import TolovPage from '../tolovlar/tolovlar';
import QaytarishModal from '../../features/qaytarish/Buyurtma';
import MahsulotKirimi from '../../features/mahsulotKirimi/MahsulotKirimi';
import BoshQoldiq from '../../features/boshQoldiq/BoshQoldiq';
import MahsulotYaratishModal from '../../features/mahsulotKirimi/MahsulotYaratishModal';
import MijozaddModal from '../../componrnts/BuyurtmaModal/MijozAdd';
import HarajatCreateModal from '../../componrnts/Harajat/HarajatModal';
import HarajatPage from '../tolovlar/Harajatlar';
import SavdolarPage from '../tolovlar/Savdolar';
import { getUser } from '../../leyout/login/auth';
import Loader from '../../componrnts/loader/loader';
import { listQueueItems, QUEUE_CHANGED_EVENT, QUEUE_TYPES } from '../../utils/offlineQueue';
import { hasPermission } from '../../utils/permissions';
import { downloadBackendData, uploadQueueBatches } from '../../utils/backendSync';
import { getSavdoConfirmIds, getSavdoPayload, normalizeSavdoId, withSavdoItemId } from '../../utils/savdoIdentity';
import { isSyncOverdue, markFullSyncDone } from '../../utils/syncSchedule';
import MajburiySync from '../../componrnts/MajburiySync/MajburiySync';
import TileGrid from './TileGrid';
import { SAVDO_SEND_ENDPOINT, saveOrderHistory } from '../../utils/savdoHistory';
import {
    BoshQoldiqIcon,
    HarajatIcon,
    HisobotIcon,
    KontragentIcon,
    MahsulotKirimiIcon,
    MahsulotYaratishIcon,
    QaytarishIcon,
    SavdoIcon,
    TolovIcon,
    YuborishIcon,
} from './homeIcons';

const queueCountValue = (value) => value ?? "";

function Home() {
    const user = getUser()
    const [openBuyurtma, setOpenBuyurtma] = useState(false);
    const [OpenQaytarish, setOpenQaytarish] = useState(false);
    const [openMahsulotKirimi, setOpenMahsulotKirimi] = useState(false);
    const [openBoshQoldiq, setOpenBoshQoldiq] = useState(false);
    const [openMahsulotYaratish, setOpenMahsulotYaratish] = useState(false);
    const [openMijozYaratish, setOpenMijozYaratish] = useState(false);
    const [openHarajatYaratish, setOpenHarajatYaratish] = useState(false);
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
    const MAHSULOT_KIRIMI_CART_KEY = "mahsulot_kirimi_cart";
    const MAHSULOT_KIRIMI_FORM_KEY = "mahsulot_kirimi_form";
    const BOSH_QOLDIQ_CART_KEY = "bosh_qoldiq_cart";
    const BOSH_QOLDIQ_FORM_KEY = "bosh_qoldiq_form";
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
    const [ForceSyncModal, setForceSyncModal] = useState(false);
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
    // Har kuni 1 marta majburiy sinxronizatsiya — mijozga bilinmasdan fonda ishlaydi,
    // faqat internet bo'lmasa ulanishni so'raydi
    useEffect(() => {
        const checkForceSync = () => {
            if (isSyncOverdue()) setForceSyncModal(true);
        };

        checkForceSync();

        const handleVisibility = () => {
            if (!document.hidden) checkForceSync();
        };

        window.addEventListener("focus", checkForceSync);
        document.addEventListener("visibilitychange", handleVisibility);
        const forceSyncIntervalId = window.setInterval(checkForceSync, 30 * 60 * 1000);

        return () => {
            window.removeEventListener("focus", checkForceSync);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.clearInterval(forceSyncIntervalId);
        };
    }, []);
    // ✅ Sync tugaganda state yangilanadi
    const handleSyncComplete = (newProducts) => {
        setProducts([...newProducts]); // ← yangi array reference
    };
    // "Yuklash" tugmasi mantiqi (grid ichida oddiy tile sifatida chiziladi)
    const sync = useBackendSync(handleSyncComplete);
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
            endpoint: SAVDO_SEND_ENDPOINT,
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

    const handleForceSyncSend = async () => {
        startLoading("Yuborilmagan ma'lumotlar yuborilmoqda...");
        try {
            await sendSavdolarQueue();
            await sendTolovlarQueue();
            await sendHarajatlarQueue();
        } finally {
            stopLoading();
        }
    };

    const handleForceSyncDownload = async () => {
        startLoading("Yangi ma'lumotlar yuklab olinmoqda...");
        try {
            const result = await downloadBackendData({ onProgress: handleUploadProgress });
            handleSyncComplete(result.cleared ? [] : result.products);
        } finally {
            stopLoading();
        }
    };

    const handleForceSyncFinished = () => {
        markFullSyncDone();
        setForceSyncModal(false);
        refreshQueueCounts();
    };

    const canShow = (permission) => hasPermission(user, permission);
    const handleYuborish = async () => {
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
    };

    // Grid tugmalari - tartibi standart joylashuvni belgilaydi
    const tiles = [
        canShow("savdo") && {
            id: "savdo",
            label: "Savdo",
            icon: SavdoIcon,
            onClick: () => {
                localStorage.removeItem(CART_KEY);
                localStorage.removeItem(FormData_KEY);
                setOpenBuyurtma(true);
            },
        },
        canShow("tolov") && {
            id: "tolov",
            label: "To’lov",
            icon: TolovIcon,
            onClick: () => setTolov(true),
        },
        canShow("hisobot") && {
            id: "hisobot",
            label: "Xisobot",
            icon: HisobotIcon,
            onClick: () => setHissobot(true),
        },
        canShow("tovar_kirimi") && {
            id: "tovar_kirimi",
            label: "Mahsulot kirimi",
            icon: MahsulotKirimiIcon,
            onClick: () => {
                localStorage.removeItem(MAHSULOT_KIRIMI_CART_KEY);
                localStorage.removeItem(MAHSULOT_KIRIMI_FORM_KEY);
                setOpenMahsulotKirimi(true);
            },
        },
        canShow("bosh_qoldiq_tovar") && {
            id: "bosh_qoldiq_tovar",
            label: "Boshlang’ich qoldiq",
            icon: BoshQoldiqIcon,
            onClick: () => {
                localStorage.removeItem(BOSH_QOLDIQ_CART_KEY);
                localStorage.removeItem(BOSH_QOLDIQ_FORM_KEY);
                setOpenBoshQoldiq(true);
            },
        },
        canShow("tovar_yaratish") && {
            id: "tovar_yaratish",
            label: "Mahsulot yaratish",
            icon: MahsulotYaratishIcon,
            onClick: () => setOpenMahsulotYaratish(true),
        },
        canShow("harajat") && {
            id: "harajat",
            label: "Harajat",
            icon: HarajatIcon,
            onClick: () => setOpenHarajatYaratish(true),
        },
        canShow("kontragent_yaratish") && {
            id: "kontragent_yaratish",
            label: "Kontragent",
            icon: KontragentIcon,
            onClick: () => setOpenMijozYaratish(true),
        },
        canShow("qaytarish") && {
            id: "qaytarish",
            label: "Qaytarish",
            icon: QaytarishIcon,
            onClick: () => {
                setOpenQaytarish(true);
                localStorage.removeItem(CART_KEY);
                localStorage.removeItem(Qaytarish_KEY);
                localStorage.removeItem(FormData_KEY);
            },
        },
        {
            id: "yuborish",
            label: "Yuborish",
            icon: YuborishIcon,
            onClick: handleYuborish,
        },
        {
            id: "yuklash",
            label: sync.label,
            icon: sync.icon,
            onClick: sync.onClick,
        },
    ].filter(Boolean);
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
                        <TileGrid tiles={tiles} />
                    </div>
                </div>
            </div>
            {sync.loader}
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
            {openMahsulotKirimi && (
                <MahsulotKirimi onClose={() => setOpenMahsulotKirimi(false)} />
            )}
            {openBoshQoldiq && (
                <BoshQoldiq onClose={() => {
                    setOpenBoshQoldiq(false);
                    refreshQueueCounts();
                }} />
            )}
            {ForceSyncModal && (
                <MajburiySync
                    onSend={handleForceSyncSend}
                    onDownload={handleForceSyncDownload}
                    onFinished={handleForceSyncFinished}
                />
            )}
            {openMahsulotYaratish && (
                <MahsulotYaratishModal onClose={() => setOpenMahsulotYaratish(false)} />
            )}
            {openMijozYaratish && (
                <MijozaddModal
                    kirim={false}
                    onClose={() => setOpenMijozYaratish(false)}
                    onCreated={() => setOpenMijozYaratish(false)}
                />
            )}
            {openHarajatYaratish && (
                <HarajatCreateModal
                    onClose={(rows) => {
                        setOpenHarajatYaratish(false);
                        if (Array.isArray(rows)) setHarajatlarCount(rows.length);
                        refreshQueueCounts();
                    }}
                    setHarajatlar={handleHarajatlarChange}
                />
            )}
        </>);
}

export default Home;
