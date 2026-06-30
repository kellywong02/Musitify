package com.kelly.musitify.ui;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.textfield.TextInputEditText;
import com.kelly.musitify.R;
import com.kelly.musitify.api.RetrofitClient;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddSongActivity extends AppCompatActivity {
    private TextInputEditText etTitle, etArtist, etAlbum, etFileUrl, etCoverUrl, etDuration;
    private Button btnUpload;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_song);

        Toolbar toolbar = findViewById(R.id.toolbarAddSong);
        setSupportActionBar(toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        etTitle = findViewById(R.id.etSongTitle);
        etArtist = findViewById(R.id.etArtist);
        etAlbum = findViewById(R.id.etAlbum);
        etFileUrl = findViewById(R.id.etFileUrl);
        etCoverUrl = findViewById(R.id.etCoverUrl);
        etDuration = findViewById(R.id.etDuration);
        btnUpload = findViewById(R.id.btnUpload);

        btnUpload.setOnClickListener(v -> uploadSong());
    }

    private void uploadSong() {
        String title = etTitle.getText().toString().trim();
        String artist = etArtist.getText().toString().trim();
        String album = etAlbum.getText().toString().trim();
        String fileUrl = etFileUrl.getText().toString().trim();
        String coverUrl = etCoverUrl.getText().toString().trim();
        String duration = etDuration.getText().toString().trim();

        if (title.isEmpty() || artist.isEmpty() || fileUrl.isEmpty()) {
            Toast.makeText(this, "Title, Artist and File URL are required", Toast.LENGTH_SHORT).show();
            return;
        }

        Map<String, Object> songData = new HashMap<>();
        songData.put("title", title);
        songData.put("artist", artist);
        songData.put("album", album);
        songData.put("file_url", fileUrl);
        songData.put("cover_url", coverUrl);
        songData.put("duration", duration);

        btnUpload.setEnabled(false);
        RetrofitClient.getApi().addSong(songData).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                btnUpload.setEnabled(true);
                if (response.isSuccessful()) {
                    Toast.makeText(AddSongActivity.this, "Song uploaded successfully!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(AddSongActivity.this, "Upload failed: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                btnUpload.setEnabled(true);
                Toast.makeText(AddSongActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
