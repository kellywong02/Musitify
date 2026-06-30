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
import com.kelly.musitify.data.UserPhotocard;

import java.util.List;

public class PhotocardAdapter extends RecyclerView.Adapter<PhotocardAdapter.ViewHolder> {
    private List<UserPhotocard> collection;

    public PhotocardAdapter(List<UserPhotocard> collection) {
        this.collection = collection;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_photocard, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        UserPhotocard item = collection.get(position);
        holder.tvName.setText(item.photocard.member_name);
        Glide.with(holder.itemView.getContext()).load(item.photocard.image_url).into(holder.ivImage);
    }

    @Override
    public int getItemCount() {
        return collection.size();
    }

    public void updateList(List<UserPhotocard> newList) {
        this.collection = newList;
        notifyDataSetChanged();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivImage;
        TextView tvName;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            ivImage = itemView.findViewById(R.id.ivCardImage);
            tvName = itemView.findViewById(R.id.tvMemberName);
        }
    }
}
