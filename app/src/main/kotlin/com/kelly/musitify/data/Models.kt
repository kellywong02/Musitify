package com.kelly.musitify.data

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val username: String,
    val email: String,
    val role: String = "normal_user"
)

@Serializable
data class Song(
    val id: Int,
    val title: String,
    val artist: String,
    val album: String? = null,
    val duration: String? = null,
    val cover_url: String? = null,
    val file_url: String
)

@Serializable
data class Photocard(
    val id: Int,
    val artist: String,
    val member_name: String,
    val image_url: String,
    val rarity: String
)

@Serializable
data class UserPhotocard(
    val id: Int,
    val drawn_date: String,
    val created_at: String,
    val photocard: Photocard
)
