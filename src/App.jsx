import { useEffect, useState } from 'react';
import { getUser } from './leyout/login/auth';
import PinScreen from './leyout/login/PinScreen';
import AppRoutes from './AppRoutes';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useAppUpdate } from './utils/useAppUpdate';

const UPDATE_CHECK_KEY = 'tovuq-last-update-check';
const UPDATE_CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000;

export default function App() {
    const [loggedIn, setLoggedIn] = useState(() => !!getUser());
    const { checkForUpdate, loader: updateLoader } = useAppUpdate();

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            StatusBar.setOverlaysWebView({ overlay: false });
        }
    }, []);

    useEffect(() => {
        if (!loggedIn) return;

        const lastCheck = Number(localStorage.getItem(UPDATE_CHECK_KEY) || 0);
        if (Date.now() - lastCheck < UPDATE_CHECK_INTERVAL_MS) return;

        localStorage.setItem(UPDATE_CHECK_KEY, String(Date.now()));
        checkForUpdate({ silent: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn]);

    useEffect(() => {

        const handleContextMenu = (e) => {
            e.preventDefault();
        };
        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);

        };

    }, []);
     if (!loggedIn) {
        return <PinScreen onSuccess={() => setLoggedIn(true)} />;
    }   
    return (
        <div className="app-safe">
            {updateLoader}
            <AppRoutes />
        </div>
    );
}
