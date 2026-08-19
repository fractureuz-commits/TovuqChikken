import { useEffect, useState } from "react";
import KorzinkaModal from "../sotuv/MahsulotGuruhlari";
import CartModal from "../sotuv/Savat";
import { getUser } from "../../leyout/login/auth";

const BOSH_QOLDIQ_FORM_KEY = "bosh_qoldiq_form";

export default function BoshQoldiq({ onClose }) {
    const user = getUser();
    const [activeView, setActiveView] = useState("sotib"); // "sotib" | "cart"

    // Ta'minotchi, invoys va boshqa maydonlar tanlanmaydi — hammasi bo'sh boshlanadi
    useEffect(() => {
        localStorage.setItem(BOSH_QOLDIQ_FORM_KEY, JSON.stringify({
            user_code: user?.code || "",
            mijoz_code: "0",
            ost_sum: "0",
            ost_val: "0",
            invoys_code: "0",
            bosh_qoldiq: 2,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {activeView === "sotib" && (
                <KorzinkaModal
                    kirim
                    boshQoldiq
                    handleModal={onClose}
                    KorzinkaModal={() => setActiveView("cart")}
                />
            )}
            {activeView === "cart" && (
                <CartModal
                    kirim
                    boshQoldiq
                    onExit={onClose}
                    onClose={() => setActiveView("sotib")}
                    KorzinkaModal={() => setActiveView("sotib")}
                />
            )}
        </>
    );
}
