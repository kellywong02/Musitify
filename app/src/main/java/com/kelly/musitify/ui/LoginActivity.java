package com.kelly.musitify.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.kelly.musitify.R;
import com.kelly.musitify.api.RetrofitClient;
import com.kelly.musitify.data.User;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {
    private EditText etEmail, etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private TextView tvMessage, tvGoToRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
        tvMessage = findViewById(R.id.tvMessage);
        tvGoToRegister = findViewById(R.id.tvGoToRegister);

        btnLogin.setOnClickListener(v -> login());
        tvGoToRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });
    }

    private void login() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            tvMessage.setText("Please enter email and password");
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        tvMessage.setText("");

        RetrofitClient.getApi().getUser("eq." + email.toLowerCase(), "*").enqueue(new Callback<List<User>>() {
            @Override
            public void onResponse(Call<List<User>> call, Response<List<User>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                    // In real app, check password here (this is simplified as requested)
                    User user = response.body().get(0);
                    
                    // Save user info to SharedPreferences
                    getSharedPreferences("Musitify", MODE_PRIVATE)
                        .edit()
                        .putString("user_id", user.id)
                        .putString("role", user.role)
                        .apply();

                    Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                    // Pass user info (optional, could use SharedPreferences)
                    startActivity(intent);
                    finish();
                } else {
                    tvMessage.setText("Invalid credentials or account not found");
                }
            }

            @Override
            public void onFailure(Call<List<User>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                tvMessage.setText("Error: " + t.getMessage());
            }
        });
    }
}
