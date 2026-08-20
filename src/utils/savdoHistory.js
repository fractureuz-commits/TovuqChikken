// Savdo (realizatsiya) endpointi va yuborilgan savdolar tarixi.

export const SAVDO_SEND_ENDPOINT = "tovuq/hs/realizz/realizz";

const HISTORY_KEY = "buyurtmalar";

export const saveOrderHistory = (order) => {
    try {
        const oldOrders = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
        const list = Array.isArray(oldOrders) ? oldOrders : [];
        const exists = list.some(item => String(item?.id) === String(order?.id));

        if (!exists) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify([...list, order]));
        }
    } catch {
        // Tarix yozilmasa ham savdo yuborilishiga xalaqit bermaydi
    }
};
