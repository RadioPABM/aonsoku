package com.radiopabm.client;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int NOTIFICATION_PERMISSION_REQUEST = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestNotificationPermission();
    }

    /**
     * From Android 13 on, a foreground service notification is only drawn when
     * the app holds POST_NOTIFICATIONS, so the playback controls would be
     * invisible without asking for it.
     */
    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return;
        }

        boolean granted =
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED;

        if (granted) {
            return;
        }

        ActivityCompat.requestPermissions(
            this,
            new String[] { Manifest.permission.POST_NOTIFICATIONS },
            NOTIFICATION_PERMISSION_REQUEST
        );
    }
}
