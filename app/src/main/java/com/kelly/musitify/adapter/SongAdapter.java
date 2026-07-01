package com.kelly.musitify.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.kelly.musitify.R;
import com.kelly.musitify.data.Song;

import java.util.List;

public class SongAdapter extends RecyclerView.Adapter<SongAdapter.SongViewHolder> {
    private List<Song> songs;
    private OnSongClickListener listener;

    public interface OnSongClickListener {
        void onSongClick(Song song);
    }

    public SongAdapter(List<Song> songs, OnSongClickListener listener) {
        this.songs = songs;
        this.listener = listener;
    }

    @NonNull
    @Override
    public SongViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_song, parent, false);
        return new SongViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SongViewHolder holder, int position) {
        Song song = songs.get(position);
        holder.tvTitle.setText(song.title.toUpperCase());
        holder.tvArtist.setText(song.artist);

        String fullCoverUrl = song.cover_url;
        if (fullCoverUrl != null && !fullCoverUrl.isEmpty() && !fullCoverUrl.startsWith("http")) {
            fullCoverUrl = "https://oovlijlvshbvanbehvqg.supabase.co/storage/v1/object/public/songs/" + fullCoverUrl;
        } else if (fullCoverUrl == null || fullCoverUrl.isEmpty()) {
            fullCoverUrl = "https://via.placeholder.com/300";
        }

        Glide.with(holder.itemView.getContext())
                .load(fullCoverUrl)
                .centerCrop()
                .into(holder.ivCover);

        holder.itemView.setOnClickListener(v -> listener.onSongClick(song));
    }

    @Override
    public int getItemCount() {
        return songs.size();
    }

    public void updateList(List<Song> newList) {
        this.songs = newList;
        notifyDataSetChanged();
    }

    static class SongViewHolder extends RecyclerView.ViewHolder {
        ImageView ivCover;
        TextView tvTitle, tvArtist;

        public SongViewHolder(@NonNull View itemView) {
            super(itemView);
            ivCover = itemView.findViewById(R.id.ivCover);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvArtist = itemView.findViewById(R.id.tvArtist);
        }
    }
}
