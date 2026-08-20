#!/usr/bin/env node
// Usage: npm run release -- 1.0.1 "Nima o'zgardi"
// Bumps package.json + android versionName/versionCode, builds a signed release APK,
// commits + tags the version bump, pushes to GitHub, and publishes a GitHub Release with the APK attached.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const remote = "release-origin";
const repo = "fractureuz-commits/TovuqChikken";

const run = (cmd, opts = {}) => {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { stdio: "inherit", cwd: rootDir, ...opts });
};

const bumpPatch = (version) => {
    const parts = version.split(".").map(Number);
    parts[2] = (parts[2] || 0) + 1;
    return parts.join(".");
};

function main() {
    const pkgPath = path.join(rootDir, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    const argVersion = process.argv[2];
    const nextVersion = argVersion || bumpPatch(pkg.version);
    const notes = process.argv[3] || `Versiya ${nextVersion}`;

    if (!/^\d+\.\d+\.\d+$/.test(nextVersion)) {
        console.error(`Versiya formati noto'g'ri: "${nextVersion}". Masalan: 1.0.1`);
        process.exit(1);
    }

    const status = execSync("git status --porcelain", { cwd: rootDir }).toString().trim();
    if (status) {
        console.error("Ishchi papkada saqlanmagan o'zgarishlar bor. Avval ularni commit/stash qiling.");
        process.exit(1);
    }

    console.log(`\n=== Reliz: v${nextVersion} ===`);

    pkg.version = nextVersion;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

    const gradlePath = path.join(rootDir, "android", "app", "build.gradle");
    let gradle = readFileSync(gradlePath, "utf-8");

    const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);
    const currentVersionCode = versionCodeMatch ? Number(versionCodeMatch[1]) : 0;
    const nextVersionCode = currentVersionCode + 1;

    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${nextVersionCode}`);
    gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${nextVersion}"`);
    writeFileSync(gradlePath, gradle);

    console.log(`package.json -> ${nextVersion}`);
    console.log(`build.gradle -> versionName ${nextVersion}, versionCode ${nextVersionCode}`);

    run("npx vite build");
    run("npx cap sync android");

    // To'liq yo'l — Git Bash/cmd/PowerShell, hamma joyda ishlaydi
    const androidDir = path.join(rootDir, "android");
    const gradlew = path.join(androidDir, process.platform === "win32" ? "gradlew.bat" : "gradlew");
    run(`"${gradlew}" assembleRelease`, { cwd: androidDir });

    const apkDir = path.join(rootDir, "android", "app", "build", "outputs", "apk", "release");
    const apkFiles = existsSync(apkDir) ? readdirSync(apkDir).filter((f) => f.endsWith(".apk")) : [];
    const signedApk = apkFiles.find((f) => !f.includes("unsigned")) || apkFiles[0];

    if (!signedApk) {
        console.error(`APK topilmadi: ${apkDir}. keystore.properties sozlanganiga ishonch hosil qiling.`);
        process.exit(1);
    }

    const apkPath = path.join(apkDir, signedApk);
    console.log(`\nAPK tayyor: ${apkPath}`);

    run("git add package.json android/app/build.gradle");
    run(`git commit -m "chore: release v${nextVersion}"`);
    run(`git tag v${nextVersion}`);

    run(`git push ${remote} HEAD`);
    run(`git push ${remote} v${nextVersion}`);

    const notesFile = path.join(rootDir, ".release-notes.tmp.txt");
    writeFileSync(notesFile, notes);
    run(
        `gh release create v${nextVersion} "${apkPath}" --repo ${repo} --title "v${nextVersion}" --notes-file "${notesFile}"`
    );
    run(process.platform === "win32" ? `del "${notesFile}"` : `rm "${notesFile}"`);

    console.log(`\nReliz nashr qilindi: https://github.com/${repo}/releases/tag/v${nextVersion}\n`);
}

main();
