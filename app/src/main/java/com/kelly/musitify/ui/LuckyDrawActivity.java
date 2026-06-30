package com.kelly.musitify.ui;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.kelly.musitify.R;
import com.kelly.musitify.adapter.PhotocardAdapter;
import com.kelly.musitify.api.RetrofitClient;
import com.kelly.musitify.data.Photocard;
import com.kelly.musitify.data.UserPhotocard;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LuckyDrawActivity extends AppCompatActivity {
    private Button btnDraw;
    private TextView tvMessage;
    private RecyclerView rvCollection;
    private PhotocardAdapter adapter;
    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lucky_draw);

        userId = getSharedPreferences("Musitify", MODE_PRIVATE).getString("user_id", "");

        btnDraw = findViewById(R.id.btnDraw);
        tvMessage = findViewById(R.id.tvDrawMessage);
        rvCollection = findViewById(R.id.rvCollection);

        rvCollection.setLayoutManager(new GridLayoutManager(this, 3));
        adapter = new PhotocardAdapter(new ArrayList<>());
        rvCollection.setAdapter(adapter);

        loadCollection();

        btnDraw.setOnClickListener(v -> performLuckyDraw());
    }

    private void loadCollection() {
        RetrofitClient.getApi().getUserPhotocards(userId, "*,photocard(*)").enqueue(new Callback<List<UserPhotocard>>() {
            @Override
            public void onResponse(Call<List<UserPhotocard>> call, Response<List<UserPhotocard>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    adapter.updateList(response.body());
                }
            }

            @Override
            public void onFailure(Call<List<UserPhotocard>> call, Throwable t) {
                Toast.makeText(LuckyDrawActivity.this, "Failed to load collection", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void performLuckyDraw() {
        btnDraw.setEnabled(false);
        tvMessage.setText("Drawing...");

        // 1. Get all available photocards
        RetrofitClient.getApi().getPhotocards("*").enqueue(new Callback<List<Photocard>>() {
            @Override
            public void onResponse(Call<List<Photocard>> call, Response<List<Photocard>> response) {
                if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                    List<Photocard> allCards = response.body();
                    Photocard randomCard = allCards.get(new Random().nextInt(allCards.size()));
                    
                    saveDraw(randomCard);
                } else {
                    btnDraw.setEnabled(true);
                    tvMessage.setText("No cards available");
                }
            }

            @Override
            public void onFailure(Call<List<Photocard>> call, Throwable t) {
                btnDraw.setEnabled(true);
                tvMessage.setText("Error fetching cards");
            }
        });
    }

    private void saveDraw(Photocard card) {
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        
        Map<String, Object> drawData = new HashMap<>();
        drawData.put("user_id", userId);
        drawData.put("photocard_id", card.id);
        drawData.put("drawn_date", today);

        RetrofitClient.getApi().addUserPhotocard(drawData).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                btnDraw.setEnabled(true);
                if (response.isSuccessful()) {
                    tvMessage.setText("You pulled: " + card.member_name + "!");
                    loadCollection();
                } else {
                    tvMessage.setText("You already drew today!");
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                btnDraw.setEnabled(true);
                tvMessage.setText("Failed to save draw");
            }
        });
    }
}
