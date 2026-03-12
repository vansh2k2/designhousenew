
const CHANNEL_ID = 'UCzG1TxC08693rbQ8ppR5m6A';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// Simple in-memory cache
let videoCache = {
    data: null,
    lastFetched: null
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetches latest videos from YouTube RSS feed
 */
exports.getLatestVideos = async (req, res) => {
    try {
        const now = Date.now();

        // Check cache
        if (videoCache.data && videoCache.lastFetched && (now - videoCache.lastFetched < CACHE_DURATION)) {
            return res.json({
                success: true,
                data: videoCache.data,
                source: 'cache'
            });
        }

        const response = await fetch(FEED_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch YouTube feed: ${response.statusText}`);
        }

        const xmlText = await response.text();

        // Extract video IDs and titles using regex (to avoid external XML parser dependency)
        const videoIds = [...xmlText.matchAll(/<yt:videoId>(.*?)<\/yt:videoId>/g)].map(m => m[1]);
        const titles = [...xmlText.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]);

        // titles[0] is usually the channel title, so we slice from 1
        const actualTitles = titles.slice(1);

        const videos = videoIds.slice(0, 5).map((id, index) => ({
            id,
            title: actualTitles[index] || 'YouTube Video',
            url: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
        }));

        // Update cache
        videoCache = {
            data: videos,
            lastFetched: now
        };

        res.json({
            success: true,
            data: videos,
            source: 'live'
        });

    } catch (error) {
        console.error('Error in getLatestVideos:', error);

        // Fallback to cache if available even if expired, or return error
        if (videoCache.data) {
            return res.json({
                success: true,
                data: videoCache.data,
                source: 'stale-cache',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch latest YouTube videos',
            error: error.message
        });
    }
};
