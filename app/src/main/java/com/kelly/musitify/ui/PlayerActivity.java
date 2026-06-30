package com.kelly.musitify.ui;

import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.SeekBar;
import android.widget.TextView;

import androidx.annotation.OptIn;
import androidx.appcompat.app.AppCompatActivity;
import androidx.media3.common.MediaItem;
import androidx.media3.common.Player;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.exoplayer.ExoPlayer;

import com.bumptech.glide.Glide;
import com.kelly.musitify.R;

public class PlayerActivity extends AppCompatActivity {
    private TextView tvTitle, tvArtist, tvCurrentTime, tvTotalTime;
    private ImageView ivCover;
    private ImageButton btnPlayPause, btnBack;
    private SeekBar seekBar;
    private ExoPlayer player;
    private Handler handler = new Handler();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_player);

        tvTitle = findViewById(R.id.tvPlayerTitle);
        tvArtist = findViewById(R.id.tvPlayerArtist);
        tvCurrentTime = findViewById(R.id.tvCurrentTime);
        tvTotalTime = findViewById(R.id.tvTotalTime);
        ivCover = findViewById(R.id.ivPlayerCover);
        btnPlayPause = findViewById(R.id.btnPlayPause);
        btnBack = findViewById(R.id.btnBack);
        seekBar = findViewById(R.id.playerSeekBar);

        String title = getIntent().getStringExtra("title");
        String artist = getIntent().getStringExtra("artist");
        String coverUrl = getIntent().getStringExtra("cover_url");
        String fileUrl = getIntent().getStringExtra("file_url");

        tvTitle.setText(title);
        tvArtist.setText(artist);
        Glide.with(this).load(coverUrl).placeholder(android.R.color.darker_gray).into(ivCover);

        setupPlayer(fileUrl);

        btnPlayPause.setOnClickListener(v -> {
            if (player.isPlaying()) {
                player.pause();
                btnPlayPause.setImageResource(android.R.drawable.ic_media_play);
            } else {
                player.play();
                btnPlayPause.setImageResource(android.R.drawable.ic_media_pause);
            }
        });

        btnBack.setOnClickListener(v -> finish());

        seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser) player.seekTo(progress);
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });
    }

    private void setupPlayer(String url) {
        player = new ExoPlayer.Builder(this).build();
        MediaItem mediaItem = MediaItem.fromUri(Uri.parse(url));
        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();
        btnPlayPause.setImageResource(android.R.drawable.ic_media_pause);

        player.addListener(new Player.Listener() {
            @Override
            public void onPlaybackStateChanged(int state) {
                if (state == Player.STATE_READY) {
                    seekBar.setMax((int) player.getDuration());
                    tvTotalTime.setText(formatTime(player.getDuration()));
                    updateSeekBar();
                }
            }
        });
    }

    private void updateSeekBar() {
        if (player != null && player.isPlaying()) {
            seekBar.setProgress((int) player.getCurrentPosition());
            tvCurrentTime.setText(formatTime(player.getCurrentPosition()));
        }
        handler.postDelayed(this::updateSeekBar, 1000);
    }

    private String formatTime(long ms) {
        int seconds = (int) (ms / 1000);
        int m = seconds / 60;
        int s = seconds % 60;
        return String.format("%d:%02d", m, s);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (player != null) {
            player.release();
            player = null;
        }
        handler.removeCallbacksAndMessages(null);
    }
}
