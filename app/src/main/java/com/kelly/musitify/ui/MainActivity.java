package com.kelly.musitify.ui;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.kelly.musitify.MusicPlayerManager;
import com.kelly.musitify.R;
import com.kelly.musitify.adapter.SongAdapter;
import com.kelly.musitify.api.RetrofitClient;
import com.kelly.musitify.data.Song;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import androidx.media3.common.Player;

public class MainActivity extends AppCompatActivity {
    private RecyclerView rvSongs;
    private SongAdapter adapter;
    private List<Song> allSongs = new ArrayList<>();
    private ProgressBar progressBar;
    private EditText etSearch;
    private ImageButton btnAddSong, btnLuckyDraw;
    
    // Mini Player Views
    private CardView miniPlayer;
    private ImageView ivMiniCover;
    private TextView tvMiniTitle, tvMiniArtist;
    private ImageButton btnMiniPlayPause;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        rvSongs = findViewById(R.id.rvSongs);
        progressBar = findViewById(R.id.progressBar);
        etSearch = findViewById(R.id.etSearch);
        btnAddSong = findViewById(R.id.btnAddSong);
        btnLuckyDraw = findViewById(R.id.btnLuckyDraw);
        
        // Mini Player
        miniPlayer = findViewById(R.id.miniPlayer);
        ivMiniCover = findViewById(R.id.ivMiniCover);
        tvMiniTitle = findViewById(R.id.tvMiniTitle);
        tvMiniArtist = findViewById(R.id.tvMiniArtist);
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause);

        // Check Admin Role
        String role = getSharedPreferences("Musitify", MODE_PRIVATE).getString("role", "");
        if ("admin".equalsIgnoreCase(role)) {
            btnAddSong.setVisibility(View.VISIBLE);
        }

        rvSongs.setLayoutManager(new GridLayoutManager(this, 2));
        adapter = new SongAdapter(new ArrayList<>(), this::openPlayer);
        rvSongs.setAdapter(adapter);

        loadSongs();

        btnLuckyDraw.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, LuckyDrawActivity.class));
        });
        
        btnAddSong.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, AddSongActivity.class));
        });

        miniPlayer.setOnClickListener(v -> {
            Song song = MusicPlayerManager.getCurrentSong();
            if (song != null) {
                openPlayer(song);
            }
        });

        btnMiniPlayPause.setOnClickListener(v -> {
            Player player = MusicPlayerManager.getPlayer(this);
            if (player.isPlaying()) {
                player.pause();
            } else {
                player.play();
            }
            updateMiniPlayer();
        });

        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filter(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void openPlayer(Song song) {
        MusicPlayerManager.setCurrentSong(song);
        
        String fullFileUrl = song.file_url;
        if (fullFileUrl != null && !fullFileUrl.startsWith("http")) {
            fullFileUrl = "https://oovlijlvshbvanbehvqg.supabase.co/storage/v1/object/public/songs/" + fullFileUrl;
        }
        
        String fullCoverUrl = song.cover_url;
        if (fullCoverUrl != null && !fullCoverUrl.startsWith("http")) {
            fullCoverUrl = "https://oovlijlvshbvanbehvqg.supabase.co/storage/v1/object/public/songs/" + fullCoverUrl;
        }

        Intent intent = new Intent(MainActivity.this, PlayerActivity.class);
        intent.putExtra("title", song.title);
        intent.putExtra("artist", song.artist);
        intent.putExtra("cover_url", fullCoverUrl);
        intent.putExtra("file_url", fullFileUrl);
        startActivity(intent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateMiniPlayer();
    }

    private void updateMiniPlayer() {
        Song currentSong = MusicPlayerManager.getCurrentSong();
        Player player = MusicPlayerManager.getPlayer(this);

        if (currentSong != null) {
            miniPlayer.setVisibility(View.VISIBLE);
            tvMiniTitle.setText(currentSong.title);
            tvMiniArtist.setText(currentSong.artist);
            
            String fullCoverUrl = currentSong.cover_url;
            if (fullCoverUrl != null && !fullCoverUrl.startsWith("http")) {
                fullCoverUrl = "https://oovlijlvshbvanbehvqg.supabase.co/storage/v1/object/public/songs/" + fullCoverUrl;
            }
            
            Glide.with(this).load(fullCoverUrl).placeholder(android.R.color.darker_gray).into(ivMiniCover);
            
            if (player.isPlaying()) {
                btnMiniPlayPause.setImageResource(android.R.drawable.ic_media_pause);
            } else {
                btnMiniPlayPause.setImageResource(android.R.drawable.ic_media_play);
            }
        } else {
            miniPlayer.setVisibility(View.GONE);
        }
    }

    private void loadSongs() {
        progressBar.setVisibility(View.VISIBLE);
        RetrofitClient.getApi().getSongs("*").enqueue(new Callback<List<Song>>() {
            @Override
            public void onResponse(Call<List<Song>> call, Response<List<Song>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    allSongs = response.body();
                    adapter.updateList(allSongs);
                }
            }

            @Override
            public void onFailure(Call<List<Song>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(MainActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void filter(String text) {
        List<Song> filteredList = new ArrayList<>();
        for (Song song : allSongs) {
            if (song.title.toLowerCase().contains(text.toLowerCase()) ||
                song.artist.toLowerCase().contains(text.toLowerCase())) {
                filteredList.add(song);
            }
        }
        adapter.updateList(filteredList);
    }
}
