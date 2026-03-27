import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router';
import Swal from "sweetalert2";
import MobilHeader from '../header/MobilHeader';
import { App as CapApp } from '@capacitor/app';

function Rootleyout() {
  const [slidemini, setSlidemini] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) return;

    let backHandler;
    CapApp.addListener('backButton', () => {
      navigate(-1);
    }).then(h => {
      backHandler = h;
    });

    return () => {
      backHandler?.remove();
    };
  }, []);
  // // Slidebar state
  // useEffect(() => {
  //   const saved = localStorage.getItem('slideMini');
  //   if (saved !== null) {
  //     setSlidemini(JSON.parse(saved));
  //   }
  // }, []);
  // useEffect(() => {
  //   localStorage.setItem('slideMini', JSON.stringify(slidemini));
  // }, [slidemini]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {

      const method = args[1]?.method?.toUpperCase() || "GET";
      const response = await originalFetch(...args);

      let data;
      try {
        data = await response.clone().json();
      } catch (e) {
        data = null;
      }

      // 401 va invalid token
      if (response.status === 401 || (data && data.detail === "Invalid token.")) {

        Swal.fire({
          icon: 'warning',
          title: 'Yana bir foydalanuvchi tizimga kirdi',
          text: 'Iltimos kimligini tekshiring',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          navigate("/login", { replace: true });
        });

        return Promise.reject(new Error("Invalid token"));
      }

      // 403 holat — method bilan handle403
      if (response.status === 403) {
        handle403(method);
        return Promise.reject(new Error("Forbidden"));
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [navigate]);


  const handle403 = (method) => {
    if (method === "GET") {
      Swal.fire({
        icon: 'warning',
        title: 'Kirishga ruxsat yo‘q',
        text: 'Bu bo‘limni ko‘rishga sizda ruxsat yo‘q',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        localStorage.setItem('slideMini', JSON.stringify(true));
        navigate('/');

      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Ruxsat yo‘q',
        text: 'Bu amalni bajarishga sizda ruxsat mavjud emas',
        confirmButtonText: 'OK',
      });
    }
  };


  return (
    <>
      {/* <Slidebar slidemini={slidemini} setSlidemini={setSlidemini} /> */}
      {/* <MobilHeader /> */}
      <div style={{ zIndex: '1000' }} className={slidemini ? 'container container-big' : 'container'}>
        <main>
          <Outlet context={{ slidemini, setSlidemini }} />
        </main>
      </div>
      {/* <Footer slidemini={slidemini} setSlidemini={setSlidemini} /> */}
    </>
  );
}

export default Rootleyout;
