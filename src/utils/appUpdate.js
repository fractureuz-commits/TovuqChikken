export const GITHUB_REPO = "fractureuz-commits/TovuqChikken";
export const CURRENT_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";

const parseVersion = (value) =>
    String(value || "0")
        .trim()
        .replace(/^v/i, "")
        .split(".")
        .map((part) => Number.parseInt(part, 10) || 0);

export const isNewerVersion = (candidate, current) => {
    const a = parseVersion(candidate);
    const b = parseVersion(current);
    const len = Math.max(a.length, b.length);

    for (let i = 0; i < len; i += 1) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff > 0;
    }

    return false;
};

export async function fetchLatestRelease() {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) {
        throw new Error(`GitHub javobi: HTTP ${response.status}`);
    }

    const data = await response.json();
    const apkAsset = (data.assets || []).find((asset) => asset.name?.toLowerCase().endsWith(".apk"));

    return {
        version: String(data.tag_name || "").replace(/^v/i, ""),
        notes: data.body || "",
        htmlUrl: data.html_url,
        apkUrl: apkAsset?.browser_download_url || null,
        apkSize: apkAsset?.size || 0,
    };
}

export async function checkForNativeUpdate() {
    const release = await fetchLatestRelease();

    if (!release.version || !isNewerVersion(release.version, CURRENT_VERSION)) {
        return null;
    }

    return release;
}
