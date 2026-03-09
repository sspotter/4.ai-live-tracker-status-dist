const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'ai-radar.db');
const db = new Database(dbPath);

const sources = [
  {
    "id": "src_openai_status",
    "type": "subreddit",
    "name": "OpenAI",
    "url": "https://reddit.com/r/OpenAI",
    "category_id": "cat_status",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "System Status",
    "category_color": "#ef4444"
  },
  {
    "id": "src_chatgpt_status",
    "type": "subreddit",
    "name": "ChatGPT",
    "url": "https://reddit.com/r/ChatGPT",
    "category_id": "cat_status",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "System Status",
    "category_color": "#ef4444"
  },
  {
    "id": "src_claude_status",
    "type": "subreddit",
    "name": "ClaudeAI",
    "url": "https://reddit.com/r/ClaudeAI",
    "category_id": "cat_status",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "System Status",
    "category_color": "#ef4444"
  },
  {
    "id": "src_gemini_status",
    "type": "subreddit",
    "name": "GoogleGemini",
    "url": "https://reddit.com/r/GoogleGemini",
    "category_id": "cat_status",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "System Status",
    "category_color": "#ef4444"
  },
  {
    "id": "src_cursor_tools",
    "type": "subreddit",
    "name": "Cursor",
    "url": "https://reddit.com/r/Cursor",
    "category_id": "cat_tools",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Tools & Vibe Coding",
    "category_color": "#f59e0b"
  },
  {
    "id": "src_chatgptcoding",
    "type": "subreddit",
    "name": "ChatGPTCoding",
    "url": "https://reddit.com/r/ChatGPTCoding",
    "category_id": "cat_tools",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Tools & Vibe Coding",
    "category_color": "#f59e0b"
  },
  {
    "id": "src_vibecoding",
    "type": "subreddit",
    "name": "vibecoding",
    "url": "https://reddit.com/r/vibecoding",
    "category_id": "cat_tools",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Tools & Vibe Coding",
    "category_color": "#f59e0b"
  },
  {
    "id": "src_yt_fireship",
    "type": "youtube",
    "name": "Fireship",
    "url": "https://www.youtube.com/@Fireship",
    "category_id": "cat_tools",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Tools & Vibe Coding",
    "category_color": "#f59e0b"
  },
  {
    "id": "src_singularity",
    "type": "subreddit",
    "name": "singularity",
    "url": "https://reddit.com/r/singularity",
    "category_id": "cat_news",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "News & Updates",
    "category_color": "#10b981"
  },
  {
    "id": "src_artificial",
    "type": "subreddit",
    "name": "artificial",
    "url": "https://reddit.com/r/artificial",
    "category_id": "cat_news",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "News & Updates",
    "category_color": "#10b981"
  },
  {
    "id": "src_yt_mattwolfe",
    "type": "youtube",
    "name": "Matt Wolfe",
    "url": "https://www.youtube.com/@mreflow",
    "category_id": "cat_news",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "News & Updates",
    "category_color": "#10b981"
  },
  {
    "id": "src_localllama",
    "type": "subreddit",
    "name": "LocalLLaMA",
    "url": "https://reddit.com/r/LocalLLaMA",
    "category_id": "cat_models",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Models",
    "category_color": "#8b5cf6"
  },
  {
    "id": "src_ollama",
    "type": "subreddit",
    "name": "ollama",
    "url": "https://reddit.com/r/ollama",
    "category_id": "cat_models",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Models",
    "category_color": "#8b5cf6"
  },
  {
    "id": "src_yt_matthewberman",
    "type": "youtube",
    "name": "Matthew Berman",
    "url": "https://www.youtube.com/@matthew_berman",
    "category_id": "cat_models",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Models",
    "category_color": "#8b5cf6"
  },
  {
    "id": "src_machinelearning",
    "type": "subreddit",
    "name": "MachineLearning",
    "url": "https://reddit.com/r/MachineLearning",
    "category_id": "cat_research",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Research",
    "category_color": "#3b82f6"
  },
  {
    "id": "src_yt_aiexplained",
    "type": "youtube",
    "name": "AI Explained",
    "url": "https://www.youtube.com/@aiexplained-official",
    "category_id": "cat_research",
    "is_active": 1,
    "created_at": "2026-03-03 06:20:00",
    "category_name": "Research",
    "category_color": "#3b82f6"
  }
];

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (id, name, color) VALUES (?, ?, ?)');
const insertSource = db.prepare('INSERT OR IGNORE INTO sources (id, type, name, url, category_id, is_active) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  for (const s of sources) {
    if (s.category_id && s.category_name) {
      insertCategory.run(s.category_id, s.category_name, s.category_color || '#8b5cf6');
    }
    insertSource.run(s.id, s.type, s.name, s.url, s.category_id, s.is_active);
  }
})();

console.log("Sources imported successfully.");
