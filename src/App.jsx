import { useState } from 'react';
import { getUser } from './leyout/login/auth';
import PinScreen from './leyout/login/PinScreen';
import AppRoutes from './AppRoutes';

export default function App() {
    const [loggedIn, setLoggedIn] = useState(() => !!getUser());

    if (!loggedIn) {
        return <PinScreen onSuccess={() => setLoggedIn(true)} />;
    }

    return (
        <>
            <div className="app-safe">
                <AppRoutes />
            </div>
        </>
    );
}