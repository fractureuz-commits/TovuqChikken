import { useState, useEffect } from 'react';
import { isAuthenticated, isPinSet } from './leyout/login/auth';
import Login from './leyout/login/login';
import SetPin from './leyout/login/SetPin';
import PinScreen from './leyout/login/PinScreen';
import AppRoutes from './AppRoutes'; 
export default function App() {
  const [screen, setScreen] = useState('app');

  useEffect(() => {
    // checkAppState();
  }, []);

  const checkAppState = async () => {
    const auth = await isAuthenticated();

    if (!auth) {
      // Token yo'q → Login
      setScreen('login');
      return;
    }

    const pinSet = await isPinSet();

    if (!pinSet) {
      // Token bor, PIN yo'q → PIN o'rnatish (birinchi kirish)
      setScreen('setPin');
    } else {
      // Token bor, PIN bor → PIN kiriting
      setScreen('pinScreen');
    }
  };

  // Login muvaffaqiyatli → PIN o'rnatish
  const handleLoginSuccess = async () => {
    setScreen('setPin');
  };

  // PIN o'rnatildi → ilovaga kirish
  const handlePinSet = () => {
    setScreen('app');
  };

  // PIN to'g'ri → ilovaga kirish
  const handlePinSuccess = () => {
    setScreen('app');
  };

  if (screen === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span>Yuklanmoqda...</span>
      </div>
    );
  }

  if (screen === 'login') return <Login onSuccess={handleLoginSuccess} />;
  if (screen === 'setPin') return <SetPin onSuccess={handlePinSet} />;
  if (screen === 'pinScreen') return <PinScreen onSuccess={handlePinSuccess} />;
  if (screen === 'app') return <AppRoutes />;
}