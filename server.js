require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const songsBucket = process.env.SUPABASE_SONGS_BUCKET || 'songs';
const upload = multer({ storage: multer.memoryStorage() });
const fallbackCoverUrls = {
    1: 'https://static.wikia.nocookie.net/ive/images/f/f2/LOVE_DIVE_album_cover.png/revision/latest/scale-to-width-down/1000?cb=20221102125058',
    2: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Ive_-_I%27ve_Ive.png',
    3: 'https://upload.wikimedia.org/wikipedia/en/8/81/Ive_%E2%80%93_After_Like.png'
};

console.log('Supabase client ready');

// REGISTER API
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const normalizedUsername = String(username || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();

    if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
        return res.status(400).json({
            message: 'Please fill in all fields'
        });
    }

    try {
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (checkError) {
            throw checkError;
        }

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const { error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    username: normalizedUsername,
                    email: normalizedEmail,
                    password: normalizedPassword,
                    role: 'normal_user'
                }
            ]);

        if (insertError) {
            throw insertError;
        }

        res.json({
            message: 'Registration successful'
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Database error'
        });
    }
});

// LOGIN API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, role')
            .eq('email', normalizedEmail)
            .eq('password', password)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        res.json({
            message: 'Login successful',
            user
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.get('/songs', async (req, res) => {
    try {
        const { data: songs, error } = await supabase
            .from('songs')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        res.json(songs.map(formatSong));
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.post('/songs', upload.single('audio'), async (req, res) => {
    const { title, artist, album, duration, cover_url, user_id } = req.body;
    const audioFile = req.file;

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', user_id)
            .maybeSingle();

        if (userError) {
            throw userError;
        }

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only admin can upload songs'
            });
        }

        if (!audioFile) {
            return res.status(400).json({
                message: 'Audio file is required'
            });
        }

        const safeTitle = String(title || '').trim();
        const safeArtist = String(artist || '').trim();

        if (!safeTitle || !safeArtist) {
            return res.status(400).json({
                message: 'Title and artist are required'
            });
        }

        const fileName = buildSongFileName(audioFile.originalname, safeTitle);
        const { error: uploadError } = await supabase
            .storage
            .from(songsBucket)
            .upload(fileName, audioFile.buffer, {
                contentType: audioFile.mimetype,
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: insertedSong, error: insertError } = await supabase
            .from('songs')
            .insert([{
                title: safeTitle,
                artist: safeArtist,
                album: String(album || '').trim(),
                duration: String(duration || '').trim(),
                cover_url: String(cover_url || '').trim(),
                file_url: fileName
            }])
            .select('*')
            .single();

        if (insertError) {
            throw insertError;
        }

        res.status(201).json({
            message: 'Song uploaded successfully',
            song: formatSong(insertedSong)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});

// START SERVER
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

function formatSong(song) {
    return {
        ...song,
        file_url: getPlayableFileUrl(song.file_url),
        cover_url: getCoverUrl(song)
    };
}

function getCoverUrl(song) {
    if (!song.cover_url || song.cover_url === 'https://...') {
        return fallbackCoverUrls[song.id] || 'https://via.placeholder.com/300';
    }

    return song.cover_url;
}

function getPlayableFileUrl(fileUrl) {
    if (!fileUrl) {
        return fileUrl;
    }

    if (/^https?:\/\//i.test(fileUrl)) {
        return fileUrl;
    }

    const fileName = fileUrl.replace(/^\/?uploads\//, '').replace(/^\/+/, '');

    const { data } = supabase
        .storage
        .from(songsBucket)
        .getPublicUrl(fileName);

    return data.publicUrl;
}

function buildSongFileName(originalName, title) {
    const extension = getFileExtension(originalName);
    const slug = String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return `${Date.now()}-${slug || 'song'}.${extension}`;
}

function getFileExtension(fileName) {
    const parts = String(fileName || '').split('.');
    const extension = parts.length > 1 ? parts.pop().toLowerCase() : 'mp3';
    return extension || 'mp3';
}
