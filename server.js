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

    if (normalizedPassword.length < 8) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long'
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
    const normalizedPassword = String(password || '').trim();

    if (!normalizedEmail || !normalizedPassword) {
        return res.status(400).json({
            message: 'Please enter email or password'
        });
    }

    if (normalizedPassword.length < 8) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long'
        });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, password, role')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!user) {
            return res.status(404).json({
                code: 'account_not_found',
                message: 'Account not found for this email. Do you want to register?'
            });
        }

        if (user.password !== normalizedPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const { password: _password, ...safeUser } = user;

        res.json({
            message: 'Login successful',
            user: safeUser
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

app.delete('/songs/:id', async (req, res) => {
    const { user_id } = req.body;
    const songId = req.params.id;

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
                message: 'Only admin can remove songs'
            });
        }

        const { data: song, error: songError } = await supabase
            .from('songs')
            .select('id, file_url')
            .eq('id', songId)
            .maybeSingle();

        if (songError) {
            throw songError;
        }

        if (!song) {
            return res.status(404).json({
                message: 'Song not found'
            });
        }

        const { error: deleteError } = await supabase
            .from('songs')
            .delete()
            .eq('id', songId);

        if (deleteError) {
            throw deleteError;
        }

        const storageFileName = getStorageFileName(song.file_url);
        if (storageFileName) {
            const { error: storageError } = await supabase
                .storage
                .from(songsBucket)
                .remove([storageFileName]);

            if (storageError) {
                console.log('Song storage cleanup failed:', storageError);
            }
        }

        res.json({
            message: 'Song removed successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.get('/photocards/collection', async (req, res) => {
    const userId = req.query.user_id;

    try {
        const { data: user, error: userError } = await getUserById(userId);

        if (userError) {
            throw userError;
        }

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        const today = getTodayDate();
        const userIsAdmin = isAdminUser(user);
        const todayDraw = await getUserDrawForDate(user.id, today);
        const { data: collection, error: collectionError } = await supabase
            .from('user_photocards')
            .select(`
                id,
                drawn_date,
                created_at,
                photocard:photocards (
                    id,
                    artist,
                    member_name,
                    image_url,
                    rarity
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (collectionError) {
            throw collectionError;
        }

        res.json({
            canDrawToday: userIsAdmin || !todayDraw,
            todayDraw: todayDraw ? formatPhotocardDraw(todayDraw) : null,
            collection: (collection || []).map(formatPhotocardDraw)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.post('/photocards/daily-draw', async (req, res) => {
    const { user_id } = req.body;

    try {
        const { data: user, error: userError } = await getUserById(user_id);

        if (userError) {
            throw userError;
        }

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        const userIsAdmin = isAdminUser(user);
        const today = getTodayDate();
        const todayDraw = await getUserDrawForDate(user.id, today);
        if (!userIsAdmin && todayDraw) {
            return res.status(409).json({
                message: 'You already used your Daily Lucky Draw today. Come back tomorrow.',
                draw: formatPhotocardDraw(todayDraw)
            });
        }

        const availablePhotocards = await getAvailablePhotocardsForUser(user.id);

        if (availablePhotocards.length === 0) {
            return res.status(404).json({
                message: 'You already collected every available photocard.'
            });
        }

        const randomPhotocard = availablePhotocards[Math.floor(Math.random() * availablePhotocards.length)];
        const drawDate = userIsAdmin ? await getAvailableAdminDrawDate(user.id, today) : today;
        const { data: insertedDraw, error: insertError } = await supabase
            .from('user_photocards')
            .insert([{
                user_id: user.id,
                photocard_id: randomPhotocard.id,
                drawn_date: drawDate
            }])
            .select(`
                id,
                drawn_date,
                created_at,
                photocard:photocards (
                    id,
                    artist,
                    member_name,
                    image_url,
                    rarity
                )
            `)
            .single();

        if (insertError) {
            if (insertError.code === '23505' && !userIsAdmin) {
                const existingDraw = await getUserDrawForDate(user.id, today);
                return res.status(409).json({
                    message: 'You already used your Daily Lucky Draw today. Come back tomorrow.',
                    draw: existingDraw ? formatPhotocardDraw(existingDraw) : null
                });
            }

            throw insertError;
        }

        res.status(201).json({
            message: 'Daily Lucky Draw complete',
            draw: formatPhotocardDraw(insertedDraw)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.get('/photocards/:id/download', async (req, res) => {
    const photocardId = req.params.id;
    const userId = req.query.user_id;

    try {
        const { data: user, error: userError } = await getUserById(userId);

        if (userError) {
            throw userError;
        }

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        const { data: ownedPhotocard, error: ownedError } = await supabase
            .from('user_photocards')
            .select(`
                photocard:photocards (
                    id,
                    artist,
                    member_name,
                    image_url,
                    rarity
                )
            `)
            .eq('user_id', user.id)
            .eq('photocard_id', photocardId)
            .limit(1)
            .maybeSingle();

        if (ownedError) {
            throw ownedError;
        }

        if (!ownedPhotocard || !ownedPhotocard.photocard) {
            return res.status(403).json({
                message: 'This photocard is not in your collection'
            });
        }

        const card = ownedPhotocard.photocard;
        const imageResponse = await fetch(card.image_url);

        if (!imageResponse.ok) {
            return res.status(502).json({
                message: 'Unable to download photocard image'
            });
        }

        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const extension = getImageExtension(contentType, card.image_url);
        const fileName = buildPhotocardFileName(card, extension);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(imageBuffer);
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

function getStorageFileName(fileUrl) {
    if (!fileUrl) {
        return '';
    }

    if (/^https?:\/\//i.test(fileUrl)) {
        try {
            const url = new URL(fileUrl);
            const publicPath = `/object/public/${songsBucket}/`;
            const publicPathIndex = url.pathname.indexOf(publicPath);

            if (publicPathIndex !== -1) {
                return decodeURIComponent(url.pathname.slice(publicPathIndex + publicPath.length));
            }
        } catch (error) {
            return '';
        }

        return '';
    }

    return fileUrl.replace(/^\/?uploads\//, '').replace(/^\/+/, '');
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

function getUserById(userId) {
    return supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();
}

async function getUserDrawForDate(userId, date) {
    const { data, error } = await supabase
        .from('user_photocards')
        .select(`
            id,
            drawn_date,
            created_at,
            photocard:photocards (
                id,
                artist,
                member_name,
                image_url,
                rarity
            )
        `)
        .eq('user_id', userId)
        .eq('drawn_date', date)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function getAvailablePhotocardsForUser(userId) {
    const { data: photocards, error: photocardsError } = await supabase
        .from('photocards')
        .select('id, artist, member_name, image_url, rarity');

    if (photocardsError) {
        throw photocardsError;
    }

    const { data: ownedPhotocards, error: ownedError } = await supabase
        .from('user_photocards')
        .select('photocard_id')
        .eq('user_id', userId);

    if (ownedError) {
        throw ownedError;
    }

    const ownedIds = new Set((ownedPhotocards || []).map(item => String(item.photocard_id)));
    return (photocards || []).filter(card => !ownedIds.has(String(card.id)));
}

function formatPhotocardDraw(draw) {
    return {
        id: draw.id,
        drawn_date: draw.drawn_date,
        created_at: draw.created_at,
        photocard: draw.photocard
    };
}

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

function isAdminUser(user) {
    return String(user && user.role || '').toLowerCase() === 'admin';
}

async function getAvailableAdminDrawDate(userId, startDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);

    for (let dayOffset = 0; dayOffset < 3650; dayOffset += 1) {
        const candidate = new Date(start);
        candidate.setUTCDate(start.getUTCDate() + dayOffset);
        const candidateDate = candidate.toISOString().slice(0, 10);
        const existingDraw = await getUserDrawForDate(userId, candidateDate);

        if (!existingDraw) {
            return candidateDate;
        }
    }

    return startDate;
}

function buildPhotocardFileName(card, extension) {
    const name = `${card.artist || 'photocard'}-${card.member_name || 'member'}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return `${name || 'photocard'}.${extension}`;
}

function getImageExtension(contentType, imageUrl) {
    if (contentType.includes('png')) {
        return 'png';
    }

    if (contentType.includes('webp')) {
        return 'webp';
    }

    if (contentType.includes('gif')) {
        return 'gif';
    }

    try {
        const extension = new URL(imageUrl).pathname.split('.').pop();
        if (extension && /^[a-z0-9]+$/i.test(extension)) {
            return extension.toLowerCase();
        }
    } catch (error) {
        return 'jpg';
    }

    return 'jpg';
}

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
