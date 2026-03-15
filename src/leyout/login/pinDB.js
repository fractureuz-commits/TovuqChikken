const SESSION_DURATION = 1 * 60 * 1000; // test: 1 daqiqa

const hashPin = async (pin) => {
    const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(pin)
    );
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

export const savePin = async (pin) => {
    const hashed = await hashPin(pin);
    localStorage.setItem("app_pin", hashed);
};

export const verifyPin = async (pin) => {
    const hashed = await hashPin(pin);
    return localStorage.getItem("app_pin") === hashed;
};

export const hasPin = () => {
    return Promise.resolve(!!localStorage.getItem("app_pin"));
};

export const deletePin = () => {
    localStorage.removeItem("app_pin");
};

export const getLockInfo = () => {
    const data = localStorage.getItem("pin_lock");
    return data ? JSON.parse(data) : { attempts: 0, lockedUntil: null };
};

export const setLockInfo = (info) => {
    localStorage.setItem("pin_lock", JSON.stringify(info));
};

export const resetLockInfo = () => {
    localStorage.removeItem("pin_lock");
};

// ── Session ──
export const setSession = () => {
    localStorage.removeItem("pin_bg_time");
};

export const setBackgroundTime = () => {
    localStorage.setItem("pin_bg_time", Date.now().toString());
};

export const isSessionActive = () => {
    const bgTime = localStorage.getItem("pin_bg_time");
    if (!bgTime) return true; // hali hech chiqmagan
    const elapsed = Date.now() - parseInt(bgTime);
    console.log("Elapsed (ms):", elapsed, "Limit:", SESSION_DURATION);
    return elapsed < SESSION_DURATION;
};

export const clearSession = () => {
    localStorage.removeItem("pin_bg_time");
};