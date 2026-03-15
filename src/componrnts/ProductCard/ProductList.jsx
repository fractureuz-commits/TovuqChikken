import { useState, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 20;

const ProductList = ({ products }) => {
    const [visible, setVisible] = useState([]);
    const visibleCountRef = useRef(PAGE_SIZE);

    // ✅ products o'zgarganda qayta render
    useEffect(() => {
        visibleCountRef.current = PAGE_SIZE;
        setVisible([...products.slice(0, PAGE_SIZE)]); // ← yangi array
    }, [products]);

    const loadMore = () => {
        const next = visibleCountRef.current + PAGE_SIZE;
        visibleCountRef.current = next;
        setVisible([...products.slice(0, next)]);
    };

    if (!products || products.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                <p style={{ fontSize: 40 }}>📭</p>
                <p>Ma'lumot yo'q</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 8 }}>
                {visible.map(item => (
                    <ProductCard key={item.c} item={item} />
                ))}
            </div>

            {visible.length < products.length && (
                <button
                    onClick={loadMore}
                    style={{
                        width: "100%", padding: 12,
                        background: "#1a2b4a", color: "white",
                        border: "none", borderRadius: 8, cursor: "pointer"
                    }}
                >
                    Ko'proq ({products.length - visible.length} ta qoldi)
                </button>
            )}
        </div>
    );
};

export default ProductList;
