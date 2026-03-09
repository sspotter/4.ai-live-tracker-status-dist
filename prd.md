# AI Radar Dashboard - Product Requirements Document

## Project Overview

**AI Radar Dashboard** is a real-time intelligence monitoring platform that aggregates and analyzes developer signals from multiple sources (Reddit, YouTube, GitHub) to track AI tool releases, ecosystem trends, and community discussions. Built with Next.js 14, it provides developers and researchers with a centralized view of the rapidly evolving AI landscape through automated content fetching, intelligent signal classification, and engagement metrics tracking.

---

## Problem Statement

The AI developer ecosystem moves at an unprecedented pace. New tools, frameworks, and releases are announced daily across multiple platforms:
- GitHub repositories launch and trend
- YouTube channels publish tutorials and announcements
- Reddit communities discuss issues and share discoveries

Developers struggle to keep up with this distributed information flow. There is no centralized dashboard that aggregates these signals in real-time with intelligent categorization.

---

## Solution

A unified intelligence dashboard that:
1. **Aggregates** signals from Reddit, YouTube, and GitHub in real-time
2. **Classifies** content automatically by type (Release, Issue, Update, New Tool, Trending)
3. **Filters** by customizable categories and sources
4. **Surfaces** trending AI repositories and ecosystem discoveries
5. **Persists** data for historical analysis and health monitoring

---

## Key Features

### 1. Multi-Source Signal Aggregation
- **Reddit Integration**: Fetches posts from configured subreddits and user submissions
- **YouTube Integration**: Tracks video uploads from AI-focused channels via API and RSS
- **GitHub Integration**: Monitors trending repos, new tools, releases, and ecosystem projects

### 2. Intelligent Signal Classification
- Auto-detects content type based on title/description keywords:
  - `RELEASE` - Product launches, version releases
  - `ISSUE` - Bugs, outages, failures (with High Severity flag)
  - `UPDATE` - New features, announcements
  - `SPIKE` - General discussions
  - `TRENDING` - Fast-growing repositories
  - `NEW_TOOL` - Recently created projects
  - `ECOSYSTEM` - Community tools around major frameworks

### 3. Source Management
- CRUD operations for tracked sources
- Category-based organization with color coding
- Active/inactive toggle for temporary disabling
- Support for Reddit (subreddits, users), YouTube channels, and GitHub repos

### 4. Discovery Features
- **Trending AI Repos**: Repositories gaining stars rapidly (7-day window)
- **New Tools**: Projects created in the last 24-48 hours
- **Core Repo Releases**: Latest releases from major projects (LangChain, Ollama, vLLM, llama.cpp, etc.)
- **Ecosystem Tools**: Community projects around popular frameworks

### 5. User Experience
- Real-time dashboard with live signal updates
- Search and keyword filtering
- Category-based filtering
- Star/favorite signals for later reference
- Engagement metrics display (likes, comments)
- Thumbnail previews for video content
- Health monitoring for data sources

---

## Technical Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | SQLite (better-sqlite3) |
| Styling | Tailwind CSS |
| Icons | Lucide React |

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/signals` | POST | Fetch and aggregate signals from all sources |
| `/api/sources` | GET/POST/PUT/DELETE | Source management CRUD |
| `/api/git` | GET | GitHub trending/repos/releases discovery |
| `/api/starred` | GET/POST | User starred/favorite signals |
| `/api/health` | GET | System health check |

### External Integrations
- **Reddit API**: OAuth 2.0 authentication for subreddit/user data
- **YouTube Data API v3**: Channel video listings and statistics
- **YouTube RSS Feeds**: Fallback for video feeds
- **GitHub REST API**: Repository search, releases, and trending data

### Database Schema
```sql
-- Sources table
sources (id, type, name, url, category_id, is_active, created_at)

-- Categories table
categories (id, name, color, created_at)

-- Signals table
signals (id, source_id, type, title, description, url, thumbnail_url, published_at, engagement_metrics)

-- Starred signals
starred (signal_id, created_at)
```

---

## User Stories

| User | Need | Feature |
|------|------|---------|
| AI Researcher | Stay updated on latest papers and tools | Real-time signal feed with filtering |
| Developer | Discover new libraries and frameworks | GitHub discovery and trending repos |
| Engineering Manager | Monitor ecosystem health | Source health dashboard and alerts |
| Community Manager | Track discussions across platforms | Reddit and YouTube aggregation |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Signal freshness | < 5 minutes from source publish |
| Source coverage | 50+ active sources |
| Classification accuracy | > 85% correct auto-categorization |
| API reliability | > 99% uptime |
| User engagement | 10+ starred signals per session |

---

## Environment Variables

```env
GEMINI_API_KEY=          # For AI Studio features
REDDIT_CLIENT_ID=        # Reddit OAuth credentials
REDDIT_CLIENT_SECRET=    # Reddit OAuth credentials
YOUTUBE_API_KEY=         # YouTube Data API key
GITHUB_TOKEN=            # GitHub personal access token (rate limit)
```

---

## CV Highlights

- Developed a real-time AI intelligence dashboard aggregating signals from Reddit, YouTube, and GitHub APIs using Next.js 14, TypeScript, and SQLite for 100+ tracked sources
- Implemented multi-source data pipelines with OAuth authentication (Reddit), YouTube Data API v3, and GitHub REST API to fetch posts, videos, releases, and trending repositories
- Built intelligent signal classification system that auto-categorizes content by type (Release, Issue, Update, Spike) using NLP keyword analysis with severity scoring
- Designed full-stack CRUD architecture with RESTful API routes for source management, category filtering, and starred items persistence
- Engineered GitHub discovery features detecting trending AI repos, new tools, and ecosystem projects using AI keyword search queries with time-based filtering
- Created responsive dashboard UI with real-time updates, search/filter functionality, engagement metrics display, and health monitoring components

---

## Future Enhancements

1. **AI-Powered Summarization**: Generate TL;DR summaries for long-form content
2. **Alert System**: Push notifications for high-severity signals
3. **User Authentication**: Multi-user support with personalized dashboards
4. **Analytics Dashboard**: Trends, top sources, and engagement analytics
5. **Export Functionality**: RSS feeds, email digests, Slack integration
6. **Custom Filters**: User-defined rules for signal prioritization

---

## Repository Structure

```
ai-live-tracker-status/
├── app/
│   ├── api/
│   │   ├── signals/route.ts    # Signal aggregation
│   │   ├── sources/route.ts    # Source CRUD
│   │   ├── git/route.ts        # GitHub discovery
│   │   ├── starred/route.ts    # Favorites
│   │   └── health/route.ts     # Health check
│   ├── page.tsx                # Main dashboard
│   ├── starred/page.tsx        # Starred signals view
│   └── git/page.tsx            # GitHub discoveries view
├── components/
│   └── HealthMonitor.tsx       # Health monitoring widget
├── lib/
│   ├── db.ts                   # SQLite database connection
│   └── utils.ts                # Utility functions
├── metadata.json               # App configuration
└── PRD.md                      # This document
```
