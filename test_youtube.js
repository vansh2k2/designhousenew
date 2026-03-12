
async function test() {
    try {
        const url = 'https://www.youtube.com/@designhouseindia';
        console.log('Fetching:', url);
        const response = await fetch(url);
        if (response.ok) {
            const text = await response.text();
            console.log('Successfully fetched page source');

            // Try multiple patterns
            const patterns = [
                /"channelId":"(.*?)"/,
                /"externalId":"(.*?)"/,
                /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/,
                /"browseId":"(UC[a-zA-Z0-9_-]{22})"/
            ];

            let channelId = null;
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    channelId = match[1];
                    console.log('Found Channel ID with pattern', pattern, ':', channelId);
                    break;
                }
            }

            if (channelId) {
                // Now try RSS
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                console.log('Fetching RSS:', rssUrl);
                const rssResponse = await fetch(rssUrl);
                if (rssResponse.ok) {
                    const rssText = await rssResponse.text();
                    const videoIds = [...rssText.matchAll(/<yt:videoId>(.*?)<\/yt:videoId>/g)].map(m => m[1]);
                    const titles = [...rssText.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]);
                    console.log('Success! Found video IDs:', videoIds.slice(0, 5));
                    console.log('Titles:', titles.slice(1, 6)); // First title is channel title
                } else {
                    console.log('RSS Fetch failed:', rssResponse.status);
                }
            } else {
                console.log('Channel ID not found in source with any pattern');
            }
        } else {
            console.log('Failed to fetch page:', response.status);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
