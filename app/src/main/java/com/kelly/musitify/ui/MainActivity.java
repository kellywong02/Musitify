package com.kelly.musitify.ui;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.kelly.musitify.R;
import com.kelly.musitify.adapter.SongAdapter;
import com.kelly.musitify.api.RetrofitClient;
import com.kelly.musitify.data.Song;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {
    private RecyclerView rvSongs;
    private SongAdapter adapter;
    private List<Song> allSongs = new ArrayList<>();
    private ProgressBar progressBar;
    private EditText etSearch;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        rvSongs = findViewById(R.id.rvSongs);
        progressBar = findViewById(R.id.progressBar);
        etSearch = findViewById(R.id.etSearch);

        rvSongs.setLayoutManager(new GridLayoutManager(this, 2));
        adapter = new SongAdapter(new ArrayList<>(), song -> {
            Toast.makeText(MainActivity.this, "Playing: " + song.title, Toast.LENGTH_SHORT).show();
            // TODO: Play song logic
        });
        rvSongs.setAdapter(adapter);

        loadSongs();

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
