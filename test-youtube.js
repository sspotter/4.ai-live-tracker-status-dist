const fs = require('fs');
const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function log(msg) {
    fs.appendFileSync('out.log', msg + '\n');
}

async function getYoutubeChannelId(handleOrUrl) {
    try {
        let url = handleOrUrl;
        if (!url.startsWith('http')) {
            url = `https://www.youtube.com/${handleOrUrl.startsWith('@') ? '' : '@'}${handleOrUrl.replace(/^@/, '')}`;
        }
        log(`Fetching URL for Channel ID: ${url}`);
        const res = await fetch(url);
        const text = await res.text();
        // Sometimes externalId isn't there directly, or there's multiple ways YouTube returns it in standard HTML
        const match = text.match(/"externalId":"(UC[^"]+)"/) || text.match(/<meta itemprop="channelId" content="(UC[^"]+)"/);

        return match ? match[1] : null;
    } catch (e) {
        log(`Error in getYoutubeChannelId for ${handleOrUrl}: ${e.message}`);
        return null;
    }
}

async function testRetrieval(channelHandle) {
    log(`\n--- Testing retrieval for: ${channelHandle} ---`);
    const channelId = await getYoutubeChannelId(channelHandle);
    if (!channelId) {
        log(`Could not find channel ID for ${channelHandle}`);
        if (channelHandle.startsWith('UC')) {
            log(`Looks like ${channelHandle} is already a Channel ID. Using it directly.`);
            await fetchVideos(channelHandle);
        }
        return;
    }
    log(`Found Channel ID: ${channelId}`);
    await fetchVideos(channelId);
}

async function fetchVideos(channelId) {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    log(`Fetching RSS: ${rssUrl}`);
    try {
        const res = await fetch(rssUrl);
        if (!res.ok) {
            log(`RSS fetch failed with status: ${res.status}`);
            return;
        }
        const text = await res.text();
        const $ = cheerio.load(text, { xmlMode: true });
        const videos = [];
        $('entry').each((i, el) => {
            if (i >= 5) return false;
            const title = $(el).find('title').text();
            const url = $(el).find('link').attr('href');
            videos.push({ title, url });
        });
        log(`Found ${videos.length} videos:`);
        log(JSON.stringify(videos, null, 2));
    } catch (e) {
        log(`Error fetching RSS: ${e.message}`);
    }
}

(async () => {
    if (fs.existsSync('out.log')) fs.unlinkSync('out.log');
    await testRetrieval('@TechWithTim');
    await testRetrieval('@Fireship');
    console.log("Done");
})();
