package com.kelly.musitify.api;

import com.kelly.musitify.data.Song;
import com.kelly.musitify.data.User;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface SupabaseApi {
    @GET("rest/v1/users")
    Call<List<User>> getUser(@Query("email") String email, @Query("select") String select);

    @POST("rest/v1/users")
    Call<Void> registerUser(@Body Map<String, Object> userData);

    @GET("rest/v1/songs")
    Call<List<Song>> getSongs(@Query("select") String select);
}
