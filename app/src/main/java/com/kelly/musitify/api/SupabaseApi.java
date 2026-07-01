package com.kelly.musitify.api;

import com.kelly.musitify.data.Song;
import com.kelly.musitify.data.User;
import com.kelly.musitify.data.Photocard;
import com.kelly.musitify.data.UserPhotocard;

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

    @POST("rest/v1/songs")
    Call<Void> addSong(@Body Map<String, Object> songData);

    @POST("storage/v1/object/songs/{path}")
    Call<Void> uploadFile(@retrofit2.http.Path("path") String path, @Body okhttp3.RequestBody file, @retrofit2.http.Header("Content-Type") String contentType);

    @GET("rest/v1/photocards")
    Call<List<Photocard>> getPhotocards(@Query("select") String select);

    @GET("rest/v1/user_photocards")
    Call<List<UserPhotocard>> getUserPhotocards(@Query("user_id") String userId, @Query("select") String select);

    @POST("rest/v1/user_photocards")
    Call<Void> addUserPhotocard(@Body Map<String, Object> data);
}
