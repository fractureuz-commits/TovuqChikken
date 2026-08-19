package com.Boller.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "ApkUpdater")
public class ApkUpdaterPlugin extends Plugin {

    @PluginMethod
    public void canInstallPackages(PluginCall call) {
        JSObject result = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            result.put("granted", getContext().getPackageManager().canRequestPackageInstalls());
        } else {
            result.put("granted", true);
        }
        call.resolve(result);
    }

    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("url is required");
            return;
        }

        new Thread(() -> runDownloadAndInstall(call, url)).start();
    }

    private void runDownloadAndInstall(PluginCall call, String url) {
        HttpURLConnection connection = null;
        try {
            File outFile = new File(getContext().getCacheDir(), "update.apk");
            if (outFile.exists()) {
                outFile.delete();
            }

            URL downloadUrl = new URL(url);
            connection = (HttpURLConnection) downloadUrl.openConnection();
            connection.setInstanceFollowRedirects(true);
            connection.connect();

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                call.reject("Server javobi: HTTP " + responseCode);
                return;
            }

            long total = connection.getContentLength();
            long downloaded = 0;
            int lastPercent = -1;

            try (InputStream input = connection.getInputStream();
                 FileOutputStream output = new FileOutputStream(outFile)) {

                byte[] buffer = new byte[8192];
                int read;

                while ((read = input.read(buffer)) != -1) {
                    output.write(buffer, 0, read);
                    downloaded += read;

                    if (total > 0) {
                        int percent = (int) ((downloaded * 100) / total);
                        if (percent != lastPercent) {
                            lastPercent = percent;
                            JSObject progress = new JSObject();
                            progress.put("percent", percent);
                            progress.put("downloaded", downloaded);
                            progress.put("total", total);
                            notifyListeners("downloadProgress", progress);
                        }
                    }
                }
            }

            installApk(outFile);

            JSObject result = new JSObject();
            result.put("path", outFile.getAbsolutePath());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Yuklab olishda xato: " + e.getMessage(), e);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private void installApk(File file) {
        Uri apkUri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
        );

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        getActivity().runOnUiThread(() -> getContext().startActivity(intent));
    }
}
