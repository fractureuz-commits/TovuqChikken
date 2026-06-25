import { useEffect, useRef } from "react";

const backHandlers = [];

export const registerBackHandler = (handler) => {
    const entry = {
        id: Symbol("back-handler"),
        handler,
    };

    backHandlers.push(entry);

    return () => {
        const index = backHandlers.findIndex(item => item.id === entry.id);
        if (index >= 0) backHandlers.splice(index, 1);
    };
};

export const runLatestBackHandler = async () => {
    const entry = backHandlers[backHandlers.length - 1];
    if (!entry) return false;

    await entry.handler?.();
    return true;
};

export const useBackHandler = (handler, enabled = true) => {
    const handlerRef = useRef(handler);
    const hasHandler = typeof handler === "function";

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!enabled || !hasHandler) return undefined;
        return registerBackHandler(() => handlerRef.current?.());
    }, [enabled, hasHandler]);
};
