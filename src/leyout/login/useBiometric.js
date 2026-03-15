import { useState, useEffect } from "react";

export const useBiometric = () => {
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        const check = async () => {
            try {
                if (!window.PublicKeyCredential) return;
                const ok = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                setAvailable(ok);
            } catch {
                setAvailable(false);
            }
        };
        check();
    }, []);

    const authenticate = async () => {
        try {
            const challenge = crypto.getRandomValues(new Uint8Array(32));
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    timeout: 60000,
                    userVerification: "required",
                    rpId: window.location.hostname || "localhost",
                },
            });
            return !!credential;
        } catch {
            return false;
        }
    };

    return { available, authenticate };
};