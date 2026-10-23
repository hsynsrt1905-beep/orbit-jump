package com.orbitjump.game;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.PlayGames;

/**
 * Google Play Oyun Hizmetleri köprüsü (yalnız başarımlar). v2 SDK'da oturum
 * açılışı uygulama açılınca kendiliğinden denenir; oyuncu Play Games'e giriş
 * yapmamışsa çağrılar sessizce başarısız olur, oyun etkilenmez.
 */
@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {

    private static final int RC_ACHIEVEMENTS = 9003;

    @PluginMethod
    public void isAuthenticated(PluginCall call) {
        PlayGames.getGamesSignInClient(getActivity()).isAuthenticated().addOnCompleteListener(task -> {
            JSObject result = new JSObject();
            result.put("value", task.isSuccessful() && task.getResult().isAuthenticated());
            call.resolve(result);
        });
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        PlayGames.getGamesSignInClient(getActivity()).signIn().addOnCompleteListener(task -> {
            JSObject result = new JSObject();
            result.put("value", task.isSuccessful() && task.getResult().isAuthenticated());
            call.resolve(result);
        });
    }

    @PluginMethod
    public void unlock(PluginCall call) {
        String id = call.getString("id");
        if (id == null || id.isEmpty()) {
            call.reject("missing id");
            return;
        }
        PlayGames.getAchievementsClient(getActivity()).unlock(id);
        call.resolve();
    }

    @PluginMethod
    public void showAchievements(PluginCall call) {
        PlayGames.getAchievementsClient(getActivity())
            .getAchievementsIntent()
            .addOnSuccessListener(intent -> {
                getActivity().startActivityForResult(intent, RC_ACHIEVEMENTS);
                call.resolve();
            })
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }
}
