import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// In-memory cache
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get('force') === 'true';
  const now = Date.now();
  
  if (!force && cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  const results = [
    { id: 'openai', name: 'OpenAI', status: 'Unknown/Unreachable', indicator: 'unknown', url: 'https://status.openai.com/' },
    { id: 'anthropic', name: 'Anthropic', status: 'Unknown/Unreachable', indicator: 'unknown', url: 'http://status.claude.com/' },
    { id: 'google', name: 'Google AI Studio', status: 'Unknown/Unreachable', indicator: 'unknown', url: 'https://aistudio.google.com/status' },
  ];

  // Fetch OpenAI
  try {
    const res = await fetch('https://status.openai.com/api/v2/status.json', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const indicator = data.status.indicator;
      results[0].status = data.status.description;
      results[0].indicator = indicator === 'none' ? 'operational' : indicator === 'minor' ? 'degraded' : 'down';
    }
  } catch (e) {
    console.error('Failed to fetch OpenAI status:', e);
  }

  // Fetch Anthropic
  try {
    const res = await fetch('https://status.anthropic.com/api/v2/status.json', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const indicator = data.status.indicator;
      results[1].status = data.status.description;
      results[1].indicator = indicator === 'none' ? 'operational' : indicator === 'minor' ? 'degraded' : 'down';
    }
  } catch (e) {
    console.error('Failed to fetch Anthropic status:', e);
  }

  // Fetch Google AI Studio
  try {
    const res = await fetch('https://aistudio.google.com/status', { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      
      // Try to find a status text in common classes
      let statusText = $('.status-text, .status-message, .incident-title').first().text().trim();
      
      if (statusText) {
        results[2].status = statusText;
        const lowerStatus = statusText.toLowerCase();
        if (lowerStatus.includes('outage') || lowerStatus.includes('down')) {
          results[2].indicator = 'down';
        } else if (lowerStatus.includes('degraded') || lowerStatus.includes('disruption')) {
          results[2].indicator = 'degraded';
        } else {
          results[2].indicator = 'operational';
        }
      } else {
        // Fallback if no specific class is found but page loads
        results[2].status = 'All Systems Operational';
        results[2].indicator = 'operational';
      }
    }
  } catch (e) {
    console.error('Failed to fetch Google AI Studio status:', e);
  }

  cache = { data: results, timestamp: now };
  return NextResponse.json(results);
}
