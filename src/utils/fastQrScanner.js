import jsQR from "jsqr";

const DEFAULT_FORMATS = [
    "qr_code",
    "code_128",
    "code_39",
    "code_93",
    "codabar",
    "ean_13",
    "ean_8",
    "itf",
    "upc_a",
    "upc_e",
    "pdf417",
    "aztec",
    "data_matrix",
];

const DEFAULT_VIDEO = {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 },
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getSupportedFormats = async (requestedFormats) => {
    if (!("BarcodeDetector" in window)) return [];

    try {
        if (typeof window.BarcodeDetector.getSupportedFormats === "function") {
            const supported = await window.BarcodeDetector.getSupportedFormats();
            return requestedFormats.filter((format) => supported.includes(format));
        }
    } catch {
        return [];
    }

    return requestedFormats;
};

const improveCameraTrack = async (stream) => {
    const [track] = stream.getVideoTracks();
    if (!track || typeof track.getCapabilities !== "function") return;

    try {
        const capabilities = track.getCapabilities();
        const advanced = [];

        if (Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("continuous")) {
            advanced.push({ focusMode: "continuous" });
        }

        if (advanced.length) {
            await track.applyConstraints({ advanced });
        }
    } catch {
        // Camera capability hints are optional and differ by device.
    }
};

const stopStream = (stream) => {
    stream?.getTracks?.().forEach((track) => track.stop());
};

const scanWithJsQr = (video, canvas, scanRegionRatio) => {
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;

    if (!sourceWidth || !sourceHeight) return null;

    const cropSize = Math.round(Math.min(sourceWidth, sourceHeight) * scanRegionRatio);
    const sourceX = Math.round((sourceWidth - cropSize) / 2);
    const sourceY = Math.round((sourceHeight - cropSize) / 2);
    const maxEdge = 640;
    const scale = Math.min(1, maxEdge / cropSize);
    const targetSize = clamp(Math.round(cropSize * scale), 240, maxEdge);

    canvas.width = targetSize;
    canvas.height = targetSize;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    context.drawImage(
        video,
        sourceX,
        sourceY,
        cropSize,
        cropSize,
        0,
        0,
        targetSize,
        targetSize
    );

    const imageData = context.getImageData(0, 0, targetSize, targetSize);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
    });

    if (!code?.data) return null;

    return {
        rawValue: code.data,
        format: "qr_code",
        source: "jsqr",
    };
};

export const startFastQrScanner = async ({
    videoElement,
    canvasElement,
    onScan,
    onError,
    formats = DEFAULT_FORMATS,
    scanInterval = 80,
    scanRegionRatio = 0.76,
    videoConstraints = DEFAULT_VIDEO,
} = {}) => {
    if (!videoElement) {
        throw new Error("Video elementi topilmadi");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: videoConstraints,
    });

    let stopped = false;
    let scanning = false;
    let lastScanTime = 0;
    let timerId = null;
    let rafId = null;
    let videoFrameId = null;
    const canvas = canvasElement || document.createElement("canvas");
    const nativeFormats = await getSupportedFormats(formats);
    const detector = nativeFormats.length
        ? new window.BarcodeDetector({ formats: nativeFormats })
        : null;

    videoElement.srcObject = stream;
    videoElement.setAttribute("playsinline", "true");
    videoElement.muted = true;

    await improveCameraTrack(stream);
    await videoElement.play();

    const clearScheduled = () => {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (videoFrameId && typeof videoElement.cancelVideoFrameCallback === "function") {
            videoElement.cancelVideoFrameCallback(videoFrameId);
            videoFrameId = null;
        }
    };

    const detectFrame = async () => {
        if (detector) {
            try {
                const results = await detector.detect(videoElement);
                const match = results?.[0];
                if (match?.rawValue) {
                    return {
                        rawValue: match.rawValue,
                        format: match.format,
                        source: "barcode-detector",
                    };
                }
            } catch {
                // Fall through to jsQR if the native detector fails on this device.
            }
        }

        return scanWithJsQr(videoElement, canvas, scanRegionRatio);
    };

    const scheduleNext = () => {
        if (stopped) return;

        const run = () => {
            if (stopped) return;
            const now = performance.now();
            const wait = Math.max(0, scanInterval - (now - lastScanTime));

            timerId = window.setTimeout(scan, wait);
        };

        if (typeof videoElement.requestVideoFrameCallback === "function") {
            videoFrameId = videoElement.requestVideoFrameCallback(run);
        } else {
            rafId = requestAnimationFrame(run);
        }
    };

    const scan = async () => {
        if (stopped || scanning) {
            scheduleNext();
            return;
        }

        if (videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            scheduleNext();
            return;
        }

        scanning = true;
        lastScanTime = performance.now();

        try {
            const result = await detectFrame();
            if (result?.rawValue) {
                onScan?.(result.rawValue, result);
            }
        } catch (error) {
            onError?.(error);
        } finally {
            scanning = false;
            scheduleNext();
        }
    };

    scheduleNext();

    return {
        usingNativeDetector: Boolean(detector),
        stop: () => {
            stopped = true;
            clearScheduled();
            videoElement.pause();
            videoElement.srcObject = null;
            stopStream(stream);
        },
    };
};
