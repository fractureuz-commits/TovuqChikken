import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../login/auth";

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null); // null = tekshirilmoqda

  useEffect(() => {
    isAuthenticated().then(setAuth);
  }, []);

  // ✅ Tekshirilayotgan vaqtda loader
  if (auth === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <span>Yuklanmoqda...</span>
      </div>
    );
  }

  // ✅ Token yo'q — loginga
  if (!auth) return <Navigate to="/login" replace />;

  // ✅ Token bor — sahifani ko'rsat
  return children;
};

export default ProtectedRoute;