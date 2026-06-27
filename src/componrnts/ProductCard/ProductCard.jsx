import ProductImage from "../ProductImage/ProductImage";

const ProductCard = ({ item }) => (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, width: 120 }}>
        <ProductImage
            imagePath={item.i}
            productCode={item.c}
            alt={item.n}
            width={100}
            height={100}
            style={{ objectFit: "cover", borderRadius: 6 }}
        />
        <p style={{ margin: "5px 0", fontSize: 12, fontWeight: "bold" }}>
            {item.n}
        </p>
        <small style={{ color: "#999" }}>Kod: {item.c}</small>
    </div>
);

export default ProductCard;
