import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const AI_KEYWORDS = [
  'ai-agent', 'rag', 'llm', 'langchain', 'ollama', 'autogen', 'transformer', 
  'stable-diffusion', 'ai-assistant', 'ai-chatbot', 'openai', 'anthropic', 
  'vector-db', 'embedding', 'llama', 'prompt-engineering'
];

const CORE_REPOS = [
  'langchain-ai/langchain',
  'ollama/ollama',
  'vllm-project/vllm',
  'ggerganov/llama.cpp',
  'open-webui/open-webui',
  'microsoft/autogen'
];

async function fetchGithub(url: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AI-Radar-Dashboard/1.0'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`GitHub API error (${res.status}): ${errorText}`);
    return null;
  }
  return res.json();
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

export async function GET() {
  try {
    const signals: any[] = [];
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Fetch Trending AI Repos (Created in last 7 days, mixed with keywords)
    // We'll search for repos with AI keywords created recently
    const query = AI_KEYWORDS.join(' OR ');
    const trendingUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+created:>${lastWeek}&sort=stars&order=desc&per_page=20`;
    const trendingData = await fetchGithub(trendingUrl);
    
    if (trendingData?.items) {
      trendingData.items.forEach((repo: any) => {
        signals.push({
          id: `git-trending-${repo.id}`,
          type: 'TRENDING',
          color: 'amber',
          title: repo.name,
          description: `⭐ +${repo.stargazers_count} stars\n${repo.description || 'No description'}`,
          source: 'GitHub',
          channel: repo.full_name,
          url: repo.html_url,
          timestamp: new Date(repo.created_at).getTime(),
          time: timeAgo(new Date(repo.created_at))
        });
      });
    }

    // 2. Fetch New AI Tools (Created in last 48h)
    const newToolUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+created:>${last24h}&sort=created&order=desc&per_page=10`;
    const newData = await fetchGithub(newToolUrl);
    
    if (newData?.items) {
      newData.items.forEach((repo: any) => {
        signals.push({
          id: `git-new-${repo.id}`,
          type: 'NEW_TOOL',
          color: 'blue',
          title: repo.name,
          description: `New tool detected!\n${repo.description || 'No description'}`,
          source: 'GitHub',
          channel: repo.full_name,
          url: repo.html_url,
          timestamp: new Date(repo.created_at).getTime(),
          time: timeAgo(new Date(repo.created_at))
        });
      });
    }

    // 3. Fetch Releases for Core Repos
    for (const repoName of CORE_REPOS) {
      const releaseUrl = `https://api.github.com/repos/${repoName}/releases/latest`;
      const release = await fetchGithub(releaseUrl);
      if (release) {
        signals.push({
          id: `git-release-${release.id}`,
          type: 'RELEASE',
          color: 'purple',
          title: `${repoName.split('/')[1]} ${release.tag_name}`,
          description: release.name || 'Latest Release',
          source: 'GitHub',
          channel: repoName,
          url: release.html_url,
          timestamp: new Date(release.published_at).getTime(),
          time: timeAgo(new Date(release.published_at))
        });
      }
    }

    // 4. Ecosystem Discovery (Keyword search in last 3 days)
    const ecosystemKeywords = ['langchain-ui', 'ollama-gui', 'vllm-client', 'autogen-studio'];
    const ecosystemQuery = ecosystemKeywords.join(' OR ');
    const ecosystemUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(ecosystemQuery)}+created:>${lastWeek}&sort=stars&order=desc&per_page=10`;
    const ecosystemData = await fetchGithub(ecosystemUrl);
    
    if (ecosystemData?.items) {
      ecosystemData.items.forEach((repo: any) => {
        signals.push({
          id: `git-eco-${repo.id}`,
          type: 'ECOSYSTEM',
          color: 'teal',
          title: repo.name,
          description: `Ecosystem tool found!\n${repo.description || 'No description'}`,
          source: 'GitHub',
          channel: repo.full_name,
          url: repo.html_url,
          timestamp: new Date(repo.created_at).getTime(),
          time: timeAgo(new Date(repo.created_at))
        });
      });
    }

    // Sort by timestamp desc
    signals.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ signals });
  } catch (error) {
    console.error("GitHub API Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch GitHub signals" }, { status: 500 });
  }
}
