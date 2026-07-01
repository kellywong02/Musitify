package com.kelly.musitify.api;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    private static final String BASE_URL = "https://oovlijlvshbvanbehvqg.supabase.co/";
    private static final String API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdmxpamx2c2hidmFuYmVodnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk3NzA3NCwiZXhwIjoyMDk2NTUzMDc0fQ.G7NmwzC_99GiUNwQ9-U5OvCyQuNwCrm4zfAfyvAWXiQ";

    private static Retrofit retrofit = null;

    public static SupabaseApi getApi() {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(logging)
                    .addInterceptor(new Interceptor() {
                        @Override
                        public Response intercept(Chain chain) throws IOException {
                            Request original = chain.request();
                            Request.Builder builder = original.newBuilder()
                                    .header("apikey", API_KEY)
                                    .header("Authorization", "Bearer " + API_KEY);
                            
                            // Only add default headers if not already set
                            if (original.header("Content-Type") == null) {
                                builder.header("Content-Type", "application/json");
                            }
                            if (original.header("Prefer") == null) {
                                builder.header("Prefer", "return=representation");
                            }
                            
                            return chain.proceed(builder.build());
                        }
                    })
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .client(client)
                    .build();
        }
        return retrofit.create(SupabaseApi.class);
    }
}
