# 🎵 Musitify

Musitify is a modern music streaming application inspired by Spotify.  
Users can discover songs, browse artists and albums, and enjoy a smooth music playback experience.

## ✨ Features

- 🎧 Stream music online
- 🔍 Search songs and artists
- 💿 Browse albums
- ❤️ Like and save favorite songs
- ▶️ Play / pause music controls
- ⏭️ Next and previous track navigation
- 📱 Responsive UI design
- ☁️ Cloud-based music storage

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend / Database
- Supabase
- PostgreSQL

### Storage
- Supabase Storage
- Firebase Storage (optional for large files)

### Tools
- Git
- GitHub
- VS Code


## 📂 Project Structure

```bash
Musitify/
│
├── public/
│   └── assets/
│
├── src/
│   │
│   ├── components/
│   │   ├── Player.jsx
│   │   ├── Sidebar.jsx
│   │   └── SongCard.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   └── Library.jsx
│   │
│   ├── services/
│   │   └── supabase.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── README.md
```

## 🗄️ Database Structure

### Songs Table

| Column | Type | Description |
|-|-|-|
| id | integer | Song ID |
| title | varchar | Song title |
| artist | varchar | Artist name |
| album | varchar | Album name |
| file_url | text | Music file URL |
| cover_url | text | Album image |
| duration | varchar | Song length |


Example:

```json
{
  "id": 1,
  "title": "Supernova",
  "artist": "aespa",
  "album": "Armageddon",
  "file_url": "song-url.mp3",
  "cover_url": "cover.jpg",
  "duration": "2:58"
}
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/Musitify.git
```

Open project:

```bash
cd Musitify
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

Run development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```


## 🚀 Future Improvements

- 👤 User authentication
- 📃 Custom playlists
- 🎤 Artist profiles
- 🔀 Shuffle & repeat mode
- 📥 Offline downloads
- 🌙 Dark/light theme
- 📱 Mobile application


## 📸 Screenshots

Coming soon...


## 🤝 Contribution

Contributions are welcome!

1. Fork this repository
2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push branch

```bash
git push origin feature/new-feature
```

5. Create Pull Request


## 📜 License

This project is licensed under the MIT License.


## 👩‍💻 Developer

Created by **Kelly Wong**

⭐ If you like this project, consider giving it a star!
