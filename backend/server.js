const express = require("express");
const cors = require("cors");
const play = require("play-dl");
const https = require("https");
const http = require("http");
const fetch = require("node-fetch"); // npm i node-fetch@2

const app = express();
app.use(cors());
app.use(express.json());

// YouTube API Key - set in environment variable YT_KEY
const YT_KEY = process.env.YT_KEY;

// 1) Get related videos from YouTube Data API
async function getRelatedFromYouTube(videoId, maxResults = 10) {
    if (!YT_KEY) {
        console.warn("YT_KEY not set - related videos feature disabled");
        return [];
    }
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=${maxResults}&key=${YT_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    return data.items || [];
}

// 2) Get video details (snippet, tags, category)
async function getVideoDetails(videoIds) {
    if (!YT_KEY || !videoIds.length) {
        return [];
    }
    const ids = videoIds.join(",");
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids}&key=${YT_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    return data.items || [];
}

// Cache for audio URLs (they expire after some time)
const audioCache = new Map();

// Route: Get Audio Stream URL using play-dl (pure JavaScript, no binary needed)
app.get("/audio", async (req, res) => {
    try {
        const videoId = req.query.id;
        if (!videoId) {
            return res.status(400).json({ error: "Video ID is required" });
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`;

        console.log(`Fetching audio info for: ${videoId}`);

        // Check cache first
        const cached = audioCache.get(videoId);
        if (cached && cached.expiry > Date.now()) {
            console.log(`Using cached audio URL for: ${videoId}`);
            return res.json(cached.data);
        }

        // Get video info using play-dl
        const info = await play.video_info(url);

        if (!info) {
            return res.status(404).json({ error: "Video not found" });
        }

        // Get the audio stream URL
        const audioFormats = info.format.filter(f =>
            f.mimeType && f.mimeType.includes('audio')
        );

        // Sort by bitrate to get best quality
        audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

        const bestAudio = audioFormats[0];

        if (!bestAudio || !bestAudio.url) {
            return res.status(404).json({ error: "No audio stream found" });
        }

        const responseData = {
            audioUrl: bestAudio.url,
            title: info.video_details.title,
            artist: info.video_details.channel?.name || "Unknown Artist",
            thumbnail: info.video_details.thumbnails?.[info.video_details.thumbnails.length - 1]?.url || "",
            duration: info.video_details.durationInSec,
            videoId: videoId
        };

        // Cache for 5 minutes (audio URLs expire)
        audioCache.set(videoId, {
            data: responseData,
            expiry: Date.now() + 5 * 60 * 1000
        });

        res.json(responseData);

    } catch (err) {
        console.error("Error fetching audio:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Route: Stream audio directly (proxy to avoid CORS issues)
app.get("/stream/:id", async (req, res) => {
    try {
        const videoId = req.params.id;
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        console.log(`Streaming video: ${videoId}`);

        // Get video info using play-dl
        const info = await play.video_info(url);

        if (!info) {
            return res.status(404).json({ error: "Video not found" });
        }

        // Get the audio stream URL
        const audioFormats = info.format.filter(f =>
            f.mimeType && f.mimeType.includes('audio')
        );

        // Sort by bitrate to get best quality
        audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

        const bestAudio = audioFormats[0];

        if (!bestAudio || !bestAudio.url) {
            return res.status(404).json({ error: "Could not get audio stream" });
        }

        const audioUrl = bestAudio.url;

        // Set headers
        res.setHeader('Content-Type', bestAudio.mimeType || 'audio/webm');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');

        // Proxy the audio stream
        const parsedUrl = new URL(audioUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const proxyReq = protocol.get(audioUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Range': req.headers.range || 'bytes=0-',
            }
        }, (proxyRes) => {
            // Forward status and headers
            res.status(proxyRes.statusCode || 200);

            if (proxyRes.headers['content-length']) {
                res.setHeader('Content-Length', proxyRes.headers['content-length']);
            }
            if (proxyRes.headers['content-range']) {
                res.setHeader('Content-Range', proxyRes.headers['content-range']);
            }

            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('Proxy request error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Proxy error' });
            }
        });

        req.on('close', () => {
            proxyReq.destroy();
        });

    } catch (err) {
        console.error("Error streaming audio:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});

// API: return top related videos with scoring
app.get("/related", async (req, res) => {
    try {
        const videoId = req.query.id;
        const mode = req.query.mode || "default"; // e.g., 'chill', 'party', 'workout', 'romantic'
        if (!videoId) return res.status(400).json({ error: "id required" });

        if (!YT_KEY) {
            return res.status(503).json({
                error: "Related videos feature not available - YT_KEY not configured"
            });
        }

        // Fetch related videos from YouTube API
        const items = await getRelatedFromYouTube(videoId, 20);
        const ids = items.map(it => it.id?.videoId).filter(Boolean);

        if (!ids.length) {
            return res.json({ related: [] });
        }

        const details = await getVideoDetails(ids);

        // Mood keywords for scoring
        const moodKeywords = {
            chill: ["acoustic", "lofi", "calm", "soft", "relax", "peaceful", "ambient"],
            workout: ["energetic", "fast", "dance", "club", "party", "pump", "gym", "hype"],
            romantic: ["love", "romantic", "acoustic", "slow", "soul", "ballad", "heart"],
            party: ["party", "dance", "club", "remix", "edm", "bass", "drop"]
        };
        const mood = moodKeywords[mode] || [];

        // Get original video details for tag comparison
        const origDetails = await getVideoDetails([videoId]);

        const scored = details.map(d => {
            let score = 0;

            // 1) relatedToVideoId results are inherently related -> base score
            score += 20;

            // 2) tag overlap with original video
            const origTags = (origDetails[0]?.snippet?.tags) || [];
            const tags = d.snippet?.tags || [];
            const overlap = origTags.filter(t => tags.includes(t)).length;
            score += overlap * 5;

            // 3) mood keyword matching in title/tags
            const text = (d.snippet?.title + " " + (tags.join(" ") || "")).toLowerCase();
            const moodMatches = mood.filter(k => text.includes(k)).length;
            score += moodMatches * 8;

            // 4) popularity (views) - logarithmic scale
            const views = Number(d.statistics?.viewCount || 0);
            score += Math.min(10, Math.log10(views + 1));

            return {
                videoId: d.id,
                title: d.snippet?.title,
                thumbnail: d.snippet?.thumbnails?.high?.url || d.snippet?.thumbnails?.default?.url,
                channel: d.snippet?.channelTitle,
                duration: d.contentDetails?.duration,
                views: d.statistics?.viewCount,
                score
            };
        });

        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        // Return top 10 related entries
        res.json({ related: scored.slice(0, 10) });

    } catch (err) {
        console.error("Error fetching related videos:", err);
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Supersonic Music Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🎵 Supersonic Music Backend running on port ${PORT}`);
    console.log(`   Audio endpoint: http://localhost:${PORT}/audio?id=VIDEO_ID`);
    console.log(`   Stream endpoint: http://localhost:${PORT}/stream/VIDEO_ID`);
    console.log(`   Related endpoint: http://localhost:${PORT}/related?id=VIDEO_ID&mode=chill`);
    if (!YT_KEY) {
        console.warn(`   ⚠️  YT_KEY not set - /related endpoint will not work`);
    }
});
