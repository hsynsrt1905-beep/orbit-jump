package com.orbitjump.game;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Must run BEFORE super.onCreate() so the window is created
        // edge-to-edge from the very first layout pass. This is the
        // modern replacement for FLAG_LAYOUT_NO_LIMITS /
        // SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN, which Android 15 (API 35)
        // largely ignores once edge-to-edge is enforced.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attrs = getWindow().getAttributes();
            attrs.layoutInDisplayCutoutMode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                    // ALWAYS extends into the cutout regardless of status-bar
                    // visibility state - more reliable than SHORT_EDGES for a
                    // fullscreen/immersive game.
                    ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                    : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            // Writing the field back on getAttributes() alone is not always
            // enough - re-apply it explicitly.
            getWindow().setAttributes(attrs);
        }

        // Reflex/timing tabanlı bir oyunda oyuncu pause menüsünde ya da uzun
        // bir kombo bekleyişinde ekrana dokunmayabilir; sistemin ekranı
        // karartıp kilitlemesini önler.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        super.onCreate(savedInstanceState);

        enableImmersiveMode();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enableImmersiveMode();
        }
    }

    private void enableImmersiveMode() {
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());

        if (controller != null) {
            controller.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }
}
