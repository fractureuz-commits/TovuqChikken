import { useEffect, useState } from 'react';
import { getUser } from './leyout/login/auth';
import PinScreen from './leyout/login/PinScreen';
import AppRoutes from './AppRoutes';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export default function App() {
    const [loggedIn, setLoggedIn] = useState(() => !!getUser());

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            StatusBar.setOverlaysWebView({ overlay: false });
        }
    }, []);

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
            <AppRoutes />
        </div>
    );
}
