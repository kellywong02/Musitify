package com.kelly.musitify.ui;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.kelly.musitify.R;
import com.kelly.musitify.adapter.PhotocardAdapter;
import com.kelly.musitify.api.RetrofitClient;
import com.kelly.musitify.data.Photocard;
import com.kelly.musitify.data.UserPhotocard;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LuckyDrawActivity extends AppCompatActivity {
    private Button btnDraw;
    private TextView tvMessage;
    private RecyclerView rvCollection;
    private PhotocardAdapter adapter;
    private String userId;
    private String role;
    private List<UserPhotocard> rawCollection = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lucky_draw);

        Toolbar toolbar = findViewById(R.id.toolbarLucky);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayShowTitleEnabled(true);
        }
        toolbar.setNavigationOnClickListener(v -> finish());

        userId = getSharedPreferences("Musitify", MODE_PRIVATE).getString("user_id", "");
        role = getSharedPreferences("Musitify", MODE_PRIVATE).getString("role", "");

        if (userId.isEmpty()) {
            Toast.makeText(this, "Please log in again", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

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
        RetrofitClient.getApi().getUserPhotocards("eq." + userId, "*,photocards(*)").enqueue(new Callback<List<UserPhotocard>>() {
            @Override
            public void onResponse(Call<List<UserPhotocard>> call, Response<List<UserPhotocard>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    rawCollection = response.body();
                    
                    // Deduplicate display
                    List<UserPhotocard> uniqueList = new ArrayList<>();
                    Set<Integer> seenIds = new HashSet<>();
                    for (UserPhotocard up : rawCollection) {
                        if (up.photocard != null && !seenIds.contains(up.photocard.id)) {
                            uniqueList.add(up);
                            seenIds.add(up.photocard.id);
                        }
                    }
                    adapter.updateList(uniqueList);
                }
            }

            @Override
            public void onFailure(Call<List<UserPhotocard>> call, Throwable t) {
                Toast.makeText(LuckyDrawActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void performLuckyDraw() {
        btnDraw.setEnabled(false);
        tvMessage.setText("Drawing...");

        RetrofitClient.getApi().getPhotocards("*").enqueue(new Callback<List<Photocard>>() {
            @Override
            public void onResponse(Call<List<Photocard>> call, Response<List<Photocard>> response) {
                if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                    List<Photocard> allCards = response.body();
                    
                    // Filter out cards already in the user's collection
                    Set<Integer> ownedCardIds = new HashSet<>();
                    for (UserPhotocard up : rawCollection) {
                        if (up.photocard != null) {
                            ownedCardIds.add(up.photocard.id);
                        }
                    }

                    List<Photocard> availableCards = new ArrayList<>();
                    for (Photocard p : allCards) {
                        if (!ownedCardIds.contains(p.id)) {
                            availableCards.add(p);
                        }
                    }

                    if (availableCards.isEmpty()) {
                        btnDraw.setEnabled(true);
                        tvMessage.setText("You've collected all available photocards! Please wait for new updates.");
                        return;
                    }

                    Photocard randomCard = availableCards.get(new Random().nextInt(availableCards.size()));
                    saveDraw(randomCard);
                } else {
                    btnDraw.setEnabled(true);
                    tvMessage.setText("No cards available");
                }
            }

            @Override
            public void onFailure(Call<List<Photocard>> call, Throwable t) {
                btnDraw.setEnabled(true);
                tvMessage.setText("Error: " + t.getMessage());
            }
        });
    }

    private void saveDraw(Photocard card) {
        Map<String, Object> drawData = new HashMap<>();
        drawData.put("user_id", userId);
        drawData.put("photocard_id", card.id);
        
        String dateValue;
        if ("admin".equalsIgnoreCase(role)) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_YEAR, new Random().nextInt(10000) + 1);
            dateValue = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.getTime());
        } else {
            dateValue = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        }
        drawData.put("drawn_date", dateValue);

        RetrofitClient.getApi().addUserPhotocard(drawData).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                btnDraw.setEnabled(true);
                if (response.isSuccessful()) {
                    tvMessage.setText("You pulled: " + card.member_name + "!");
                    loadCollection();
                } else {
                    if (response.code() == 409) {
                        if ("admin".equalsIgnoreCase(role)) {
                            saveDraw(card);
                        } else {
                            tvMessage.setText("You already drew today!");
                        }
                    } else {
                        tvMessage.setText("Error " + response.code() + ": Failed to save draw");
                    }
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                btnDraw.setEnabled(true);
                tvMessage.setText("Network error saving draw");
            }
        });
    }
}
