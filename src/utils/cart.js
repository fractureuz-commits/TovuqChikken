// Savat (localStorage) bilan ishlash va savat o'zgarishini kuzatish.

import { useCallback, useEffect, useState } from "react";

export const CART_CHANGED_EVENT = "cart-changed";

export const getCartKey = ({ qaytarish = false, kirim = false, boshQoldiq = false } = {}) => {
    if (qaytarish) return "qaytarish";
    if (boshQoldiq) return "bosh_qoldiq_cart";
    if (kirim) return "mahsulot_kirimi_cart";
    return "buyurtma_cart";
};

export const getFormKey = ({ qaytarish = false, kirim = false, boshQoldiq = false } = {}) => {
    if (boshQoldiq) return "bosh_qoldiq_form";
    if (kirim && !qaytarish) return "mahsulot_kirimi_form";
    return "formData";
};

const emitCartChanged = (key) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT, { detail: { key } }));
};

export const readCart = (key) => {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (!data || typeof data !== "object") return { tovarlar: [] };
        return { ...data, tovarlar: Array.isArray(data.tovarlar) ? data.tovarlar : [] };
    } catch {
        return { tovarlar: [] };
    }
};

export const writeCart = (key, cart) => {
    const payload = { ...cart, tovarlar: Array.isArray(cart?.tovarlar) ? cart.tovarlar : [] };
    localStorage.setItem(key, JSON.stringify(payload));
    emitCartChanged(key);
    return payload;
};

export const clearCart = (key, formKey) => {
    localStorage.removeItem(key);
    if (formKey) localStorage.removeItem(formKey);
    emitCartChanged(key);
};

// Savatdagi "xil" mahsulotlar soni (qatorlar soni)
export const getCartLineCount = (key) => readCart(key).tovarlar.length;

export const useCartCount = (key) => {
    const [count, setCount] = useState(() => getCartLineCount(key));

    const sync = useCallback(() => setCount(getCartLineCount(key)), [key]);

    useEffect(() => {
        sync();

        const onCartChanged = (event) => {
            if (event?.detail?.key && event.detail.key !== key) return;
            sync();
        };

        const onStorage = (event) => {
            if (event.key && event.key !== key) return;
            sync();
        };

        const onVisible = () => {
            if (document.visibilityState === "visible") sync();
        };

        window.addEventListener(CART_CHANGED_EVENT, onCartChanged);
        window.addEventListener("storage", onStorage);
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            window.removeEventListener(CART_CHANGED_EVENT, onCartChanged);
            window.removeEventListener("storage", onStorage);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [key, sync]);

    return count;
};
