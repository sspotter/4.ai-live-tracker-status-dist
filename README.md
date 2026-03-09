<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" width="100%" alt="AI Radar Dashboard Banner" />
  
  <h1>🛰️ AI Radar Dashboard</h1>
  
  <p><strong>Real-time intelligence monitoring for the evolving AI landscape.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-informational?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite" alt="SQLite" />
  </p>
</div>

---

## 🌟 Overview

**AI Radar Dashboard** is a high-performance intelligence platform designed to aggregate and analyze developer signals across the AI ecosystem. It monitors **Reddit**, **YouTube**, and **GitHub** in real-time to surface new tools, major releases, and trending discussions, providing a centralized "radar" for anyone tracking the rapid pace of AI development.

---

## 🚀 Key Features

- **🌐 Multi-Source Aggegation**: Unified feed from Subreddits, YouTube channels, and GitHub repositories.
- **🧠 Intelligent Classification**: Automatic content tagging as `RELEASE`, `ISSUE`, `UPDATE`, `SPIKE`, `TRENDING`, or `NEW_TOOL`.
- **🔥 GitHub Discovery**: Real-time tracking of trending AI repos and newly launched ecosystem tools.
- **📊 Engagement Metrics**: View likes, comments, and star growth at a glance.
- **⭐ Signal Persistence**: Star important signals to save them for later analysis.
- **⚡ Performance First**: Built with Next.js 15 App Router and optimized SQLite for sub-millisecond data retrieval.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Next.js API Routes.
- **Database**: SQLite (via `better-sqlite3`).
- **Integrations**: Reddit API (OAuth), YouTube Data API v3, GitHub REST API, Google Gemini API.

---

![Website](public/image.png)
![post](public/image-1.png)

![System Status](public/image-2.png)
![ChatGPT Status](public/image-3.png)
![Claude Status](public/image-4.png)
![Google Studio Status](public/image-5.png)


| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Required for Gemini AI features. |
| `YOUTUBE_API_KEY` | Required for fetching YouTube video data. |
| `REDDIT_CLIENT_ID` | Reddit OAuth Client ID. |
| `REDDIT_CLIENT_SECRET` | Reddit OAuth Client Secret. |
| `GITHUB_TOKEN` | GitHub Personal Access Token (for higher rate limits). |

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3008](http://localhost:3008) in your browser.

---

## 📐 Project Structure

```text
├── app/                  # Next.js App Router
│   ├── api/              # API Endpoints (Signals, Git, Health)
│   ├── git/              # GitHub Discovery View
│   └── starred/          # Starred Signals View
├── components/           # Reusable UI Components
├── lib/                  # Database logic and Utilities
├── .env.example          # Environment Template
└── PRD.md                # Product Requirements Document
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  <p>Built with ❤️ for the AI Developer Community</p>
</div>
