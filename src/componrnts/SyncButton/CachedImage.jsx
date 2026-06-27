import { useState, useEffect } from "react";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { DEFAULT_PRODUCT_IMAGE } from "../ProductImage/ProductImage";

const CachedImage = ({ id, width = 100, height = 100 }) => {
    const [src, setSrc] = useState(null);

    useEffect(() => {
        Filesystem.readFile({
            path: `cache/${id}.png`,
            directory: Directory.Cache,  // ← SyncButton bilan bir xil
        })
        .then((res) => setSrc(`data:image/png;base64,${res.data}`))
        .catch(() => setSrc(null));
    }, [id]);

    return (
        <img
            src={src || DEFAULT_PRODUCT_IMAGE}
            width={width}
            height={height}
            alt="Mahsulot"
            style={{ objectFit: "cover", borderRadius: 6 }}
            onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
            }}
        />
    );
};

export default CachedImage;
