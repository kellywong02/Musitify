package com.kelly.musitify.ui;

import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.textfield.TextInputEditText;
import com.kelly.musitify.R;
import com.kelly.musitify.api.RetrofitClient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddSongActivity extends AppCompatActivity {
    private TextInputEditText etTitle, etArtist, etAlbum, etFileUrl, etCoverUrl, etDuration;
    private Button btnUpload, btnSelectFile;
    private ProgressBar uploadProgress;
    private Uri selectedFileUri;

    private final ActivityResultLauncher<String> filePickerLauncher = registerForActivityResult(
            new ActivityResultContracts.GetContent(),
            uri -> {
                if (uri != null) {
                    selectedFileUri = uri;
                    String fileName = getFileName(uri);
                    etFileUrl.setText(fileName);
                    // Automatically fill title if empty
                    if (etTitle.getText().toString().isEmpty()) {
                        String title = fileName.replaceAll("\\.[^.]*$", "");
                        etTitle.setText(title);
                    }
                }
            }
    );

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
        btnSelectFile = findViewById(R.id.btnSelectFile);
        uploadProgress = findViewById(R.id.uploadProgress);

        btnSelectFile.setOnClickListener(v -> filePickerLauncher.launch("audio/*"));
        btnUpload.setOnClickListener(v -> handleUpload());
    }

    private void handleUpload() {
        if (selectedFileUri != null) {
            uploadFileThenSaveSong();
        } else {
            saveSongToDatabase();
        }
    }

    private void uploadFileThenSaveSong() {
        try {
            InputStream is = getContentResolver().openInputStream(selectedFileUri);
            byte[] bytes = getBytes(is);
            String fileName = System.currentTimeMillis() + "-" + getFileName(selectedFileUri);
            
            uploadProgress.setVisibility(View.VISIBLE);
            uploadProgress.setIndeterminate(true);
            btnUpload.setEnabled(false);

            RequestBody requestBody = RequestBody.create(bytes, MediaType.parse("audio/mpeg"));
            RetrofitClient.getApi().uploadFile(fileName, requestBody, "audio/mpeg").enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful() || response.code() == 400) { // Supabase might return 400 if already exists but we use timestamp
                        etFileUrl.setText(fileName);
                        saveSongToDatabase();
                    } else {
                        uploadProgress.setVisibility(View.GONE);
                        btnUpload.setEnabled(true);
                        Toast.makeText(AddSongActivity.this, "File upload failed: " + response.code(), Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    uploadProgress.setVisibility(View.GONE);
                    btnUpload.setEnabled(true);
                    Toast.makeText(AddSongActivity.this, "Network error during upload", Toast.LENGTH_SHORT).show();
                }
            });

        } catch (IOException e) {
            Toast.makeText(this, "Error reading file", Toast.LENGTH_SHORT).show();
        }
    }

    private void saveSongToDatabase() {
        String title = etTitle.getText().toString().trim();
        String artist = etArtist.getText().toString().trim();
        String album = etAlbum.getText().toString().trim();
        String fileUrl = etFileUrl.getText().toString().trim();
        String coverUrl = etCoverUrl.getText().toString().trim();
        String duration = etDuration.getText().toString().trim();

        if (title.isEmpty() || artist.isEmpty() || fileUrl.isEmpty()) {
            Toast.makeText(this, "Title, Artist and File URL are required", Toast.LENGTH_SHORT).show();
            btnUpload.setEnabled(true);
            uploadProgress.setVisibility(View.GONE);
            return;
        }

        Map<String, Object> songData = new HashMap<>();
        songData.put("title", title);
        songData.put("artist", artist);
        songData.put("album", album);
        songData.put("file_url", fileUrl);
        songData.put("cover_url", coverUrl);
        songData.put("duration", duration);

        RetrofitClient.getApi().addSong(songData).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                btnUpload.setEnabled(true);
                uploadProgress.setVisibility(View.GONE);
                if (response.isSuccessful()) {
                    Toast.makeText(AddSongActivity.this, "Song saved successfully!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(AddSongActivity.this, "Database error: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                btnUpload.setEnabled(true);
                uploadProgress.setVisibility(View.GONE);
                Toast.makeText(AddSongActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String getFileName(Uri uri) {
        String result = null;
        if (uri.getScheme().equals("content")) {
            try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (index != -1) result = cursor.getString(index);
                }
            }
        }
        if (result == null) {
            result = uri.getPath();
            int cut = result.lastIndexOf('/');
            if (cut != -1) result = result.substring(cut + 1);
        }
        return result;
    }

    private byte[] getBytes(InputStream is) throws IOException {
        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
        int bufferSize = 1024;
        byte[] buffer = new byte[bufferSize];
        int len;
        while ((len = is.read(buffer)) != -1) {
            byteBuffer.write(buffer, 0, len);
        }
        return byteBuffer.toByteArray();
    }
}
