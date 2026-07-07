require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const songsBucket = process.env.SUPABASE_SONGS_BUCKET || 'songs';
const playlistsBucket = process.env.SUPABASE_PLAYLISTS_BUCKET || songsBucket;
const upload = multer({ storage: multer.memoryStorage() });
const fallbackCoverUrls = {
    1: 'https://static.wikia.nocookie.net/ive/images/f/f2/LOVE_DIVE_album_cover.png/revision/latest/scale-to-width-down/1000?cb=20221102125058',
    2: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Ive_-_I%27ve_Ive.png',
    3: 'https://upload.wikimedia.org/wikipedia/en/8/81/Ive_%E2%80%93_After_Like.png'
};



console.log('Supabase client ready');

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(publicDir, 'home.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(publicDir, 'login.html'));
});

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

        const { data: existingSong, error: existingSongError } = await supabase
            .from('songs')
            .select('id')
            .ilike('title', safeTitle)
            .ilike('artist', safeArtist)
            .limit(1)
            .maybeSingle();

        if (existingSongError) {
            throw existingSongError;
        }

        if (existingSong) {
            return res.status(409).json({
                message: 'Song already exists'
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
            todayDraw: todayDraw ? formatPhotocardDraw(todayDraw, { normalizeFutureDate: userIsAdmin }) : null,
            collection: dedupePhotocardDraws((collection || []).map(draw =>
                formatPhotocardDraw(draw, { normalizeFutureDate: userIsAdmin })
            ))
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
                draw: formatPhotocardDraw(todayDraw, { normalizeFutureDate: userIsAdmin })
            });
        }

        const availablePhotocards = await getAvailablePhotocardsForUser(user.id);

        if (availablePhotocards.length === 0) {
            return res.status(404).json({
                message: 'You already collected every available photocard.'
            });
        }

        const randomPhotocard = availablePhotocards[Math.floor(Math.random() * availablePhotocards.length)];
        const { data: insertedDraw, error: insertError } = await supabase
            .from('user_photocards')
            .insert([{
                user_id: user.id,
                photocard_id: randomPhotocard.id,
                drawn_date: today
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
            if (insertError.code === '23505') {
                const existingDraw = await getUserDrawForDate(user.id, today);
                return res.status(409).json({
                    message: 'You already used your Daily Lucky Draw today. Come back tomorrow.',
                    draw: existingDraw ? formatPhotocardDraw(existingDraw, { normalizeFutureDate: userIsAdmin }) : null
                });
            }

            throw insertError;
        }

        res.status(201).json({
            message: 'Daily Lucky Draw complete',
            draw: formatPhotocardDraw(insertedDraw, { normalizeFutureDate: userIsAdmin })
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

app.get('/playlists', async (req, res) => {
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

        const playlists = await loadUserPlaylists(user.id);
        res.json({ playlists });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.put('/playlists', async (req, res) => {
    const { user_id, playlists = [] } = req.body;

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

        const normalizedPlaylists = normalizePlaylists(playlists);
        await saveUserPlaylists(user.id, normalizedPlaylists);

        res.json({
            message: 'Playlists saved',
            playlists: normalizedPlaylists
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.post('/chat', async (req, res) => {
    const { message, songs = [], favorites = [], playlists = [] } = req.body;
    const userMessage = String(message || '').trim();

    if (!userMessage) {
        return res.status(400).json({
            reply: 'Please type a message first.'
        });
    }

    const requestedArtist = getRequestedRecommendationArtist(userMessage, songs);
    const requestedArtistHasSongs = requestedArtist && songs.some(song =>
        normalizeArtistName(song.artist) === normalizeArtistName(requestedArtist)
    );
    if (requestedArtist && !requestedArtistHasSongs) {
        return res.json({
            reply: getLocalChatbotReply(userMessage, songs),
            source: 'local',
            reason: 'requested_artist_not_available'
        });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.json({
            reply: getLocalChatbotReply(userMessage, songs),
            source: 'local',
            reason: 'missing_api_key'
        });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                input: [
                    {
                        role: 'system',
                        content: [
                            'You are Musitify Assistant, a concise helper inside a music web app.',
                            'Help users with songs, favorites, playlists, uploads, shuffle, and Lucky Draw.',
                            'Use the provided app context when relevant.',
                            'Only recommend songs from availableSongs.',
                            'If the user asks for an artist with no available songs, say that artist is not available in Musitify right now.',
                            'Keep replies short and practical.'
                        ].join(' ')
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            message: userMessage,
                            availableSongs: songs.slice(0, 30),
                            favoriteSongs: favorites.slice(0, 30),
                            playlists: playlists.slice(0, 20)
                        })
                    }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.log('OpenAI chat failed:', data);
            return res.json({
                reply: getLocalChatbotReply(userMessage, songs),
                source: 'local',
                reason: data.error?.code || data.error?.type || `openai_http_${response.status}`
            });
        }

        const openAiReply = getOpenAiReplyText(data);
        const usage = getOpenAiUsage(data);
        if (openAiReply) {
            console.log('OpenAI chat usage:', {
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                totalTokens: usage.totalTokens
            });
        }

        res.json({
            reply: openAiReply || getLocalChatbotReply(userMessage, songs),
            source: openAiReply ? 'openai' : 'local',
            reason: openAiReply ? null : 'empty_openai_reply',
            usage: openAiReply ? usage : null
        });
    } catch (error) {
        console.log('OpenAI chat failed:', error);
        res.json({
            reply: getLocalChatbotReply(userMessage, songs),
            source: 'local',
            reason: 'openai_request_failed'
        });
    }
});

app.get('/lyrics', async (req, res) => {
    const title = String(req.query.title || '').trim();
    const artist = String(req.query.artist || '').trim();
    const album = String(req.query.album || '').trim();
    const durationSeconds = parseDurationToSeconds(req.query.duration);

    if (!title || !artist) {
        return res.status(400).json({ lyrics: 'No song selected.' });
    }

    try {
        const exactUrl = new URL('https://lrclib.net/api/get');
        exactUrl.searchParams.set('track_name', title);
        exactUrl.searchParams.set('artist_name', artist);
        if (album) {
            exactUrl.searchParams.set('album_name', album);
        }
        if (durationSeconds) {
            exactUrl.searchParams.set('duration', String(durationSeconds));
        }

        const exactResponse = await fetch(exactUrl);
        if (exactResponse.ok) {
            const data = await exactResponse.json();
            const lyrics = data.plainLyrics || data.syncedLyrics;
            if (lyrics) {
                return res.json({
                    lyrics,
                    syncedLyrics: data.syncedLyrics || '',
                    source: 'lrclib_exact'
                });
            }
        }

        const searchUrl = new URL('https://lrclib.net/api/search');
        searchUrl.searchParams.set('track_name', title);
        searchUrl.searchParams.set('artist_name', artist);

        const searchResponse = await fetch(searchUrl);
        const results = searchResponse.ok ? await searchResponse.json() : [];
        const matchedItem = Array.isArray(results)
            ? results.find(item => item.plainLyrics || item.syncedLyrics)
            : null;
        const matchedLyrics = matchedItem ? matchedItem.plainLyrics || matchedItem.syncedLyrics : '';

        return res.json({
            lyrics: matchedLyrics || 'No lyrics found for this song.',
            syncedLyrics: matchedItem ? matchedItem.syncedLyrics || '' : '',
            source: matchedLyrics ? 'lrclib_search' : 'not_found'
        });
    } catch (error) {
        console.log('Lyrics API failed:', error);
        res.json({
            lyrics: 'Unable to load lyrics right now.',
            source: 'lyrics_request_failed'
        });
    }
});

// START SERVER
if (require.main === module) {
    app.listen(3000, () => {
        console.log('Server running on http://localhost:3000');
    });
}

module.exports = app;

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
        .select(`
            photocard_id,
            photocard:photocards (
                artist,
                member_name,
                image_url
            )
        `)
        .eq('user_id', userId);

    if (ownedError) {
        throw ownedError;
    }

    const ownedIds = new Set((ownedPhotocards || []).map(item => String(item.photocard_id)));
    const ownedKeys = new Set((ownedPhotocards || [])
        .filter(item => item.photocard)
        .map(item => getPhotocardKey(item.photocard)));
    const availablePhotocards = (photocards || []).filter(card =>
        !ownedIds.has(String(card.id)) &&
        !ownedKeys.has(getPhotocardKey(card))
    );

    return dedupePhotocards(availablePhotocards);
}

function formatPhotocardDraw(draw, options = {}) {
    return {
        id: draw.id,
        drawn_date: options.normalizeFutureDate
            ? normalizeDrawnDate(draw.drawn_date, draw.created_at)
            : draw.drawn_date,
        created_at: draw.created_at,
        photocard: draw.photocard
    };
}

function normalizeDrawnDate(drawnDate, createdAt) {
    const today = getTodayDate();
    const createdDate = getDateFromTimestamp(createdAt);

    if (createdDate && String(drawnDate || '') > today) {
        return createdDate;
    }

    return drawnDate;
}

function getDateFromTimestamp(timestamp) {
    if (!timestamp) {
        return '';
    }

    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date(timestamp));
}

function dedupePhotocardDraws(draws) {
    const seenPhotocards = new Set();
    return draws.filter(draw => {
        if (!draw || !draw.photocard) {
            return false;
        }

        const key = getPhotocardKey(draw.photocard);
        if (seenPhotocards.has(key)) {
            return false;
        }

        seenPhotocards.add(key);
        return true;
    });
}

function dedupePhotocards(photocards) {
    const seenPhotocards = new Set();
    return photocards.filter(card => {
        const key = getPhotocardKey(card);
        if (seenPhotocards.has(key)) {
            return false;
        }

        seenPhotocards.add(key);
        return true;
    });
}

function getPhotocardKey(card) {
    return [
        card.artist,
        card.member_name,
        card.image_url
    ].map(value => String(value || '').trim().toLowerCase()).join('|');
}

function getTodayDate() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
}

function isAdminUser(user) {
    return String(user && user.role || '').toLowerCase() === 'admin';
}

async function loadUserPlaylists(userId) {
    const { data, error } = await supabase
        .storage
        .from(playlistsBucket)
        .download(getPlaylistsStoragePath(userId));

    if (error) {
        if (String(error.statusCode) === '404' || /not found/i.test(error.message || '')) {
            return [];
        }

        throw error;
    }

    const text = await data.text();
    if (!text.trim()) {
        return [];
    }

    return normalizePlaylists(JSON.parse(text));
}

async function saveUserPlaylists(userId, playlists) {
    const payload = JSON.stringify(normalizePlaylists(playlists), null, 2);
    const { error } = await supabase
        .storage
        .from(playlistsBucket)
        .upload(getPlaylistsStoragePath(userId), Buffer.from(payload), {
            contentType: 'application/json',
            upsert: true
        });

    if (error) {
        throw error;
    }
}

function getPlaylistsStoragePath(userId) {
    return `playlists/${String(userId).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
}

function normalizePlaylists(playlists) {
    if (!Array.isArray(playlists)) {
        return [];
    }

    const seenIds = new Set();
    const seenNames = new Set();

    return playlists
        .map(playlist => ({
            id: String(playlist && playlist.id || '').trim(),
            name: String(playlist && playlist.name || '').trim(),
            songIds: Array.isArray(playlist && playlist.songIds)
                ? [...new Set(playlist.songIds.map(songId => String(songId)))]
                : [],
            createdAt: String(playlist && playlist.createdAt || new Date().toISOString())
        }))
        .filter(playlist => {
            const playlistNameKey = playlist.name.toLowerCase();
            if (!playlist.id || !playlist.name || seenIds.has(playlist.id) || seenNames.has(playlistNameKey)) {
                return false;
            }

            seenIds.add(playlist.id);
            seenNames.add(playlistNameKey);
            return true;
        });
}

function getOpenAiReplyText(data) {
    if (typeof data.output_text === 'string' && data.output_text.trim()) {
        return data.output_text.trim();
    }

    if (!Array.isArray(data.output)) {
        return '';
    }

    return data.output
        .flatMap(item => Array.isArray(item.content) ? item.content : [])
        .map(content => {
            if (typeof content.text === 'string') {
                return content.text;
            }

            if (typeof content.value === 'string') {
                return content.value;
            }

            return '';
        })
        .join('\n')
        .trim();
}

function getOpenAiUsage(data) {
    const usage = data && data.usage || {};
    return {
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
        totalTokens: usage.total_tokens || 0
    };
}

function parseDurationToSeconds(duration) {
    const value = String(duration || '').trim();
    if (!value) {
        return 0;
    }

    const parts = value.split(':').map(part => Number(part));
    if (parts.some(part => Number.isNaN(part))) {
        return 0;
    }

    if (parts.length === 2) {
        return (parts[0] * 60) + parts[1];
    }

    if (parts.length === 3) {
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }

    return 0;
}

function getLocalChatbotReply(message, songs = []) {
    const text = String(message || '').toLowerCase();

    if (text.includes('upload')) {
        return 'Admins can upload songs from the Upload Song form on the Home page.';
    }

    if (text.includes('favorite') || text.includes('favourite')) {
        return 'Click the heart button on a song card to add or remove it from Favorites.';
    }

    if (text.includes('playlist')) {
        return 'Go to Playlists, create a playlist, then use Add to Playlist on any song card.';
    }

    if (text.includes('lucky') || text.includes('photocard')) {
        return 'Daily Lucky Draw lets you collect one random photocard each day.';
    }

    if (text.includes('recommend')) {
        if (!songs.length) {
            return 'I do not see any songs loaded yet.';
        }

        const requestedArtist = getRequestedRecommendationArtist(message, songs);
        const matchingSongs = requestedArtist
            ? songs.filter(song => normalizeArtistName(song.artist) === normalizeArtistName(requestedArtist))
            : songs;

        if (requestedArtist && !matchingSongs.length) {
            return `I do not see any ${requestedArtist} songs in Musitify right now.`;
        }

        const song = matchingSongs[Math.floor(Math.random() * matchingSongs.length)];
        return `Try listening to ${String(song.title || '').toUpperCase()} by ${song.artist}.`;
    }

    if (text.includes('shuffle')) {
        return 'Use the shuffle button in the music player to randomize the upcoming songs.';
    }

    return 'I can help with uploading songs, favorites, playlists, Lucky Draw, shuffle, and song recommendations.';
}

function getRequestedRecommendationArtist(message, songs = []) {
    const text = String(message || '').toLowerCase();
    const availableArtist = songs
        .map(song => String(song.artist || '').trim())
        .filter(Boolean)
        .find(artist => text.includes(normalizeArtistName(artist)));

    if (availableArtist) {
        return availableArtist;
    }

    const match = text.match(/recommend(?: me)?(?: some)?\s+([a-z0-9& .'-]+?)(?:'s)?\s+songs?\b/i);
    if (!match) {
        return '';
    }

    return toDisplayArtistName(match[1]);
}

function normalizeArtistName(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/'s\b/g, '')
        .replace(/[^a-z0-9]+/g, '')
        .trim();
}

function toDisplayArtistName(value) {
    return String(value || '')
        .replace(/'s\b/i, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
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
