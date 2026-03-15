import { useState, useEffect } from "react";
import { loadImage } from "../../utils/storage";

const ProductCard = ({ item }) => {
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        loadImage(item.i).then(setImgSrc); // ✅ item.i (qisqa nom)
    }, [item.i]);

    return (
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, width: 120 }}>
            <img
                src={imgSrc || "/placeholder.png"}
                width={100}
                height={100}
                style={{ objectFit: "cover", borderRadius: 6 }}
                onError={(e) => e.target.src = "/placeholder.png"}
            />
            <p style={{ margin: "5px 0", fontSize: 12, fontWeight: "bold" }}>
                {item.n}  {/* ✅ item.n */}
            </p>
            <small style={{ color: "#999" }}>Kod: {item.c}</small>  {/* ✅ item.c */}
        </div>
    );
};

export default ProductCard;