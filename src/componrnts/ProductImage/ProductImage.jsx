import { useEffect, useState } from "react";
import { loadImage, loadTovar } from "../../utils/storage";

export const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

export default function ProductImage({
    imagePath,
    productCode,
    alt = "Mahsulot",
    className,
    style,
    width,
    height,
}) {
    const [src, setSrc] = useState(DEFAULT_PRODUCT_IMAGE);

    useEffect(() => {
        let active = true;

        const resolveImage = async () => {
            let path = imagePath;

            if (!path && productCode) {
                const products = await loadTovar();
                path = products?.find((product) =>
                    String(product.code) === String(productCode)
                )?.i;
            }

            const loaded = path ? await loadImage(path) : null;
            if (active) setSrc(loaded || DEFAULT_PRODUCT_IMAGE);
        };

        resolveImage();
        return () => {
            active = false;
        };
    }, [imagePath, productCode]);

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            width={width}
            height={height}
            onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
            }}
        />
    );
}
