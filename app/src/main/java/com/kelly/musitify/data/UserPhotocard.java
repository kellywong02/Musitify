package com.kelly.musitify.data;

import com.google.gson.annotations.SerializedName;

public class UserPhotocard {
    public int id;
    public String drawn_date;
    public String created_at;
    
    @SerializedName("photocards")
    public Photocard photocard;

    public UserPhotocard() {}
}
