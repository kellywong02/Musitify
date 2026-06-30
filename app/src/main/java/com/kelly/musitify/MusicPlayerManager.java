package com.kelly.musitify;

import android.content.Context;
import androidx.media3.exoplayer.ExoPlayer;

public class MusicPlayerManager {
    private static ExoPlayer player;

    public static ExoPlayer getPlayer(Context context) {
        if (player == null) {
            player = new ExoPlayer.Builder(context.getApplicationContext()).build();
        }
        return player;
    }

    public static void releasePlayer() {
        if (player != null) {
            player.release();
            player = null;
        }
    }
}
