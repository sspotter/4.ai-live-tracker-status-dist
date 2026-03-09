import { NextResponse } from 'next/server';
import db from '@/lib/db';
import * as cheerio from 'cheerio';

async function getYoutubeChannelId(handleOrUrl: string) {
  try {
    let url = handleOrUrl;
    // If it's already a channel ID (starts with UC and is 24 chars long)
    if (url.startsWith('UC') && url.length === 24) {
      return url;
    }
    
    if (!url.startsWith('http')) {
      url = `https://www.youtube.com/${url.startsWith('@') ? url : '@' + url}`;
    }
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const text = await res.text();
    const match = text.match(/"externalId":"(UC[^"]+)"/) || text.match(/<meta itemprop="channelId" content="(UC[^"]+)"/);
    return match ? match[1] : null;
  } catch (e) {
    console.error("Failed to get YouTube channel ID", e);
    return null;
  }
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 3600;
  if (interval > 24) return Math.floor(interval / 24) + "d ago";
  if (interval >= 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

function determineType(title: string, text: string) {
  const lower = (title + " " + text).toLowerCase();
  if (lower.includes('release') || lower.includes('v1.') || lower.includes('v2.') || lower.includes('launch')) return { type: 'RELEASE', color: 'purple' };
  if (lower.includes('error') || lower.includes('bug') || lower.includes('issue') || lower.includes('fail') || lower.includes('down')) return { type: 'ISSUE', color: 'red', severity: 'High Severity' };
  if (lower.includes('update') || lower.includes('new feature') || lower.includes('announce')) return { type: 'UPDATE', color: 'blue' };
  return { type: 'SPIKE', color: 'amber' };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category_id } = body;

    let allSignals: any[] = [];
    
    // Fetch active sources from DB
    let sourcesQuery = 'SELECT * FROM sources WHERE is_active = 1';
    let queryParams: any[] = [];
    if (category_id && category_id !== 'all') {
      sourcesQuery += ' AND category_id = ?';
      queryParams.push(category_id);
    }
    const activeSources = db.prepare(sourcesQuery).all(...queryParams) as any[];
    
    const subreddits = Array.from(new Set(activeSources.filter(s => s.type === 'subreddit' || (s.type === 'reddit' && !s.name.startsWith('u/'))).map(s => s.name.replace(/^r\//, ''))));
    const redditUsers = Array.from(new Set(activeSources.filter(s => s.type === 'redditUser' || (s.type === 'reddit' && s.name.startsWith('u/'))).map(s => s.name.replace(/^u\//, ''))));
    const youtubeChannels = Array.from(new Set(activeSources.filter(s => s.type === 'youtube' || s.type === 'youtubeChannel').map(s => s.name)));

    const redditClientId = process.env.REDDIT_CLIENT_ID;
    const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
    const hasRedditKey = !!(redditClientId && redditClientSecret);
    
    let redditAccessToken = null;
    if (hasRedditKey) {
      try {
        const auth = Buffer.from(`${redditClientId}:${redditClientSecret}`).toString('base64');
        const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=client_credentials'
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          redditAccessToken = tokenData.access_token;
        }
      } catch (e) {
        console.error("Failed to get Reddit access token", e);
      }
    }

    const redditHeaders: Record<string, string> = { 'User-Agent': 'AI-Radar-Dashboard/1.0' };
    if (redditAccessToken) {
      redditHeaders['Authorization'] = `Bearer ${redditAccessToken}`;
    }

    const redditBaseUrl = redditAccessToken ? 'https://oauth.reddit.com' : 'https://www.reddit.com';

    // Fetch Reddit Subreddits
    if (subreddits.length > 0) {
      try {
        const res = await fetch(`${redditBaseUrl}/r/${subreddits.join('+')}/new.json?limit=20`, { headers: redditHeaders });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.children) {
            const posts = data.data.children.map((child: any) => {
              const post = child.data;
              const { type, color, severity } = determineType(post.title, post.selftext || '');
              const source = activeSources.find(s => s.name.toLowerCase() === post.subreddit.toLowerCase() || s.name.toLowerCase() === `r/${post.subreddit.toLowerCase()}`);
              return {
                id: `reddit-${post.id}`,
                source_id: source?.id,
                type,
                time: timeAgo(new Date(post.created_utc * 1000)),
                timestamp: post.created_utc * 1000,
                title: post.title,
                description: post.selftext || 'No description provided.',
                source: 'Reddit',
                subreddit: `r/${post.subreddit}`,
                likes: post.ups,
                comments: post.num_comments,
                url: `https://reddit.com${post.permalink}`,
                color,
                severity
              };
            });
            allSignals = [...allSignals, ...posts];
          }
        }
      } catch (e) { console.error("Reddit sub fetch error", e); }
    }

    // Fetch Reddit Users
    for (const user of redditUsers) {
      try {
        const res = await fetch(`${redditBaseUrl}/user/${user}/submitted.json?limit=5`, { headers: redditHeaders });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.children) {
            const posts = data.data.children.map((child: any) => {
              const post = child.data;
              const { type, color, severity } = determineType(post.title, post.selftext || '');
              const source = activeSources.find(s => s.name.toLowerCase() === post.author.toLowerCase() || s.name.toLowerCase() === `u/${post.author.toLowerCase()}`);
              return {
                id: `reddit-user-${post.id}`,
                source_id: source?.id,
                type,
                time: timeAgo(new Date(post.created_utc * 1000)),
                timestamp: post.created_utc * 1000,
                title: post.title,
                description: post.selftext || 'No description provided.',
                source: 'Reddit',
                subreddit: `u/${post.author}`,
                likes: post.ups,
                comments: post.num_comments,
                url: `https://reddit.com${post.permalink}`,
                color,
                severity
              };
            });
            allSignals = [...allSignals, ...posts];
          }
        }
      } catch (e) { console.error("Reddit user fetch error", e); }
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    const hasYoutubeKey = !!youtubeApiKey;

    // Fetch YouTube via API or RSS
    if (youtubeChannels.length > 0) {
      for (const channel of youtubeChannels) {
        try {
          const channelId = await getYoutubeChannelId(channel);
          if (!channelId) continue;
          
          if (hasYoutubeKey) {
            // Use YouTube API
            const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=5&type=video`);
            if (searchRes.ok) {
              const searchData = await searchRes.json();
              const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean);
              
              if (videoIds.length > 0) {
                const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${youtubeApiKey}&id=${videoIds.join(',')}&part=snippet,statistics`);
                if (videoRes.ok) {
                  const videoData = await videoRes.json();
                  const videos = videoData.items.map((item: any) => {
                    const title = item.snippet.title;
                    const desc = item.snippet.description;
                    const publishedAt = item.snippet.publishedAt;
                    const thumbnail = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url;
                    const channelTitle = item.snippet.channelTitle;
                    const videoId = item.id;
                    const likes = item.statistics?.likeCount;
                    const comments = item.statistics?.commentCount;
                    
                    const { type, color, severity } = determineType(title, desc);
                    
                    // Try to find matching source
                    const source = activeSources.find(s => {
                      if (s.type !== 'youtubeChannel' && s.type !== 'youtube') return false;
                      const sourceName = s.name.toLowerCase();
                      let extractedName = sourceName;
                      try {
                        if (sourceName.includes('youtube.com')) {
                          const urlObj = new URL(s.name);
                          extractedName = (urlObj.pathname.split('/').pop() || sourceName).toLowerCase();
                        }
                      } catch(e) {}
                      extractedName = extractedName.replace(/^@/, '');
                      
                      const cleanChannel = channel.toLowerCase().replace(/^@/, '');
                      if (cleanChannel.includes(extractedName) || extractedName.includes(cleanChannel)) return true;
                      return false;
                    });
                    
                    return {
                      id: `yt-${videoId}`,
                      source_id: source?.id,
                      type: 'UPDATE',
                      time: timeAgo(new Date(publishedAt)),
                      timestamp: new Date(publishedAt).getTime(),
                      title: title,
                      description: desc || 'No description provided.',
                      source: 'YouTube',
                      channel: channelTitle,
                      url: `https://youtube.com/watch?v=${videoId}`,
                      color: 'blue',
                      thumbnail: thumbnail,
                      likes: likes ? parseInt(likes) : undefined,
                      comments: comments ? parseInt(comments) : undefined
                    };
                  });
                  allSignals = [...allSignals, ...videos];
                  continue; // Skip RSS fallback
                }
              }
            }
          }
          
          // Fallback to RSS
          const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
          });
          if (!res.ok) continue;
          
          const text = await res.text();
          const $ = cheerio.load(text, { xmlMode: true });
          
          const videos: any[] = [];
          $('entry').each((i, el) => {
            if (videos.length >= 5) return false; // Break the loop
            
            const title = $(el).find('title').text();
            const desc = $(el).find('media\\:description, description').text();
            const url = $(el).find('link').attr('href');
            
            // Filter out shorts
            if (title.toLowerCase().includes('#shorts') || desc.toLowerCase().includes('#shorts') || (url && url.includes('/shorts/'))) return;
            const publishedAt = $(el).find('published').text();
            const thumbnail = $(el).find('media\\:thumbnail, thumbnail').attr('url');
            const channelTitle = $(el).find('author > name').text();
            const videoId = $(el).find('yt\\:videoId, videoId').text();
            
            const { type, color, severity } = determineType(title, desc);
            
            // Try to find matching source
            const source = activeSources.find(s => {
              if (s.type !== 'youtubeChannel' && s.type !== 'youtube') return false;
              const sourceName = s.name.toLowerCase();
              let extractedName = sourceName;
              try {
                if (sourceName.includes('youtube.com')) {
                  const urlObj = new URL(s.name);
                  extractedName = (urlObj.pathname.split('/').pop() || sourceName).toLowerCase();
                }
              } catch(e) {}
              extractedName = extractedName.replace(/^@/, '');
              
              const cleanChannel = channel.toLowerCase().replace(/^@/, '');
              if (cleanChannel.includes(extractedName) || extractedName.includes(cleanChannel)) return true;
              return false;
            });
            
            videos.push({
              id: `yt-${videoId}`,
              source_id: source?.id,
              type: 'UPDATE',
              time: timeAgo(new Date(publishedAt)),
              timestamp: new Date(publishedAt).getTime(),
              title: title,
              description: desc || 'No description provided.',
              source: 'YouTube',
              channel: channelTitle,
              url: url || `https://youtube.com/watch?v=${videoId}`,
              color: 'blue',
              thumbnail: thumbnail
            });
          });
          
          allSignals = [...allSignals, ...videos];
        } catch (e) {
          console.error(`YouTube RSS fetch error for ${channel}:`, e);
        }
      }
    }

    // Save signals to DB
    try {
      const insertSignal = db.prepare(`
        INSERT OR IGNORE INTO signals (id, source_id, type, title, description, url, thumbnail_url, published_at, engagement_metrics)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const updateSignal = db.prepare(`
        UPDATE signals SET engagement_metrics = ? WHERE id = ?
      `);
      
      db.transaction(() => {
        for (const sig of allSignals) {
          const metrics = JSON.stringify({ likes: sig.likes, comments: sig.comments });
          const publishedAt = new Date(sig.timestamp).toISOString();
          
          const result = insertSignal.run(
            sig.id, 
            sig.source_id || null, 
            sig.source === 'YouTube' ? 'video' : 'post',
            sig.title,
            sig.description,
            sig.url,
            sig.thumbnail || null,
            publishedAt,
            metrics
          );
          
          if (result.changes === 0) {
            // Already exists, update metrics
            updateSignal.run(metrics, sig.id);
          }
        }
      })();
    } catch (e) {
      console.error("Failed to save signals to DB", e);
    }

    // Deduplicate signals by id
    const seen = new Set<string>();
    allSignals = allSignals.filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });

    // Sort by timestamp descending
    allSignals.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ signals: allSignals, hasRedditKey, hasYoutubeKey });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
