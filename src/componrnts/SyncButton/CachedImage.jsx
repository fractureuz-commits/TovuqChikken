import { useState, useEffect } from "react";
import { Filesystem, Directory } from '@capacitor/filesystem';

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

    if (!src) return (
        <div style={{ width, height, background: "#eee", borderRadius: 6 }} />
    );

    return (
        <img src={src} width={width} height={height}
            style={{ objectFit: "cover", borderRadius: 6 }} />
    );
};

export default CachedImage;