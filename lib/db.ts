import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ai-radar.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'youtube' | 'reddit'
    name TEXT NOT NULL,
    url TEXT,
    category_id TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    source_id TEXT,
    type TEXT NOT NULL, -- 'post' | 'video'
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    thumbnail_url TEXT,
    published_at DATETIME,
    engagement_metrics TEXT, -- JSON string
    keywords TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES sources(id)
  );

  CREATE TABLE IF NOT EXISTS starred_items (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    signal_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (signal_id) REFERENCES signals(id)
  );
`);

// Seed initial categories and sources if empty
const countCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (countCategories.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)');
  insertCategory.run('cat_research', 'Research', '#3b82f6');
  insertCategory.run('cat_startups', 'Startups', '#10b981');
  insertCategory.run('cat_models', 'Models', '#8b5cf6');
  insertCategory.run('cat_tools', 'Tools', '#f59e0b');

  const insertSource = db.prepare('INSERT INTO sources (id, type, name, url, category_id) VALUES (?, ?, ?, ?, ?)');
  insertSource.run('src_ml', 'reddit', 'MachineLearning', 'https://reddit.com/r/MachineLearning', 'cat_research');
  insertSource.run('src_ai', 'reddit', 'artificialintelligence', 'https://reddit.com/r/artificialintelligence', 'cat_research');
  insertSource.run('src_localllama', 'reddit', 'LocalLLaMA', 'https://reddit.com/r/LocalLLaMA', 'cat_models');
  insertSource.run('src_yt1', 'youtube', '@TechWithTim', 'https://youtube.com/@TechWithTim', 'cat_tools');
  insertSource.run('src_yt2', 'youtube', '@Fireship', 'https://youtube.com/@Fireship', 'cat_tools');
}

export default db;
