package com.kelly.musitify;

import android.content.Context;
import androidx.media3.exoplayer.ExoPlayer;
import com.kelly.musitify.data.Song;

public class MusicPlayerManager {
    private static ExoPlayer player;
    private static Song currentSong;

    public static ExoPlayer getPlayer(Context context) {
        if (player == null) {
            player = new ExoPlayer.Builder(context.getApplicationContext()).build();
        }
        return player;
    }

    public static void setCurrentSong(Song song) {
        currentSong = song;
    }

    public static Song getCurrentSong() {
        return currentSong;
    }

    public static void releasePlayer() {
        if (player != null) {
            player.release();
            player = null;
        }
    }
}
