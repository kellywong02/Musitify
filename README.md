# 🎵 Musitify

Musitify is a Spotify-inspired music web application built for self-learning and practice.

The main goal of this project is to learn how to build and test a web application, especially by writing automation scripts with Playwright. It is not a commercial music streaming product and is not affiliated with Spotify or any other music platform.

## 🎯 Purpose

This repository is intended for:

- 🎭 Practicing end-to-end test automation with Playwright
- 🧱 Learning page object model patterns
- 🔐 Testing login, registration, uploads, playlists, favorites, and media-player flows
- 🗄️ Exploring frontend, backend, database, and file-upload behavior
- ✅ Building confidence with automated browser testing in a realistic app

## 📌 Disclaimer

Musitify is a personal learning project. The UI and feature ideas are inspired by common music streaming applications, including Spotify-like experiences, but this project is not connected to, endorsed by, or associated with Spotify.

Any music, album artwork, artist names, photocards, lyrics, or other media used in this project are for development, testing, and educational purposes only. All rights belong to their respective owners.

If this repository is public, avoid committing real API keys, private credentials, copyrighted audio files, or private user data.

## ✨ Features

- 🎧 Stream and play uploaded songs
- 🔍 Search songs and artists
- 💿 Browse song cards with album artwork, artist, and duration
- ❤️ Like and save favorite songs
- 📁 Create custom playlists
- ▶️ Play and pause music controls
- ⏭️ Next and previous track navigation
- 🔀 Shuffle playback
- 🎵 Persistent bottom music player
- 🎼 Full song player page with upcoming songs
- 📝 Lyrics panel with API-based lyrics lookup
- 🎤 Synced lyrics highlighting when timestamped lyrics are available
- ☁️ Cloud-based song storage with Supabase
- 🛠️ Admin-only song upload and removal
- 🤖 AI chatbot with local fallback response
- 📱 Responsive UI design
- 🧪 Playwright end-to-end automation tests

## 🎴 Photocard Lucky Draw System

Musitify includes a K-pop inspired collectible photocard system.

Users can perform daily lucky draws and collect virtual photocards from different artists, albums, and eras.

### Photocard Features

- 🎁 Random daily photocard draw
- 📚 Personal photocard collection
- 🌈 Different card rarity levels
- ⭐ Rare and special cards
- 💎 Limited-edition style collectibles
- 🔎 Photocard detail view

### Card Rarity

| Rarity | Symbol | Example Drop Rate |
|---|---|---:|
| Normal | N | 60% |
| Rare | R | 25% |
| Super Rare | SR | 10% |
| Ultra Rare | UR | 4% |
| Legendary | LR | 1% |

Example card data:

```json
{
  "card_name": "IVE Wonyoung SWITCH Card",
  "artist": "IVE",
  "member": "Jang Wonyoung",
  "album": "IVE SWITCH",
  "rarity": "Ultra Rare",
  "image_url": "wonyoung-card.jpg"
}
```

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend / Database

- Node.js
- Express
- Supabase
- PostgreSQL

### Storage

- Supabase Storage

### Testing

- Playwright
- TypeScript for tests
- Page Object Model

### Tools

- Git
- GitHub
- VS Code

## 📂 Project Structure

```text
Musitify - Android/
|-- public/
|   |-- home.html
|   |-- login.html
|   |-- register.html
|   |-- styles.css
|   |-- Json/
|   |-- tests/
|       |-- Add Songs/
|       |-- Login/
|       |-- Register/
|       |-- Remove Song/
|       |-- fixtures/
|       |-- pageObjects/
|-- helpers/
|-- server.js
|-- playwright.config.ts
|-- package.json
|-- .env.example
|-- README.md
```


## 🔐 Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_SONGS_BUCKET=songs

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

Do not commit your real `.env` file to GitHub.

## ⚙️ Installation

Install dependencies:

```bash
npm install
```

Start the local server:

```bash
npm start
```

Open the app:

```text
http://localhost:3000/login.html
```

## 🧪 Running Playwright Tests

Run all tests:

```bash
npm test
```

Run tests in headed mode:

```bash
npm run test:headed
```

Run a specific test by title:

```bash
npx playwright test --project=chromium --grep "Add Song Successfully"
```

## 🎭 Playwright Testing Focus

The test suite is used to practice automation for:

- 🔐 Login and registration validation
- 🛠️ Admin-only song uploads
- 🗑️ Removing songs with confirmation dialogs
- 🔎 Checking dynamic UI text
- 🎵 Verifying song cards and player state
- ❤️ Testing favorites and playlists
- 📤 Handling file uploads
- 🌐 Waiting for API responses instead of relying on fixed timeouts
- 🧱 Using page objects for reusable locators

## 🚀 Future Improvements

- 🧪 More Playwright coverage for playlists, favorites, chatbot, and lyrics
- 🧹 Better test data cleanup
- ✏️ Admin edit-song feature
- 🕘 Recently played songs
- 🔀 Playlist reorder and shuffle
- 📺 Optional YouTube music video embed
- 📱 Improved mobile responsiveness

## 📜 License

This project is for educational and self-learning purposes. Add a license file if you plan to define formal reuse permissions.
