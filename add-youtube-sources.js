const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'ai-radar.db');
const db = new Database(dbPath);

const youtubeSources = [
    { id: 'src_yt_nagdywp', name: 'NagdyWP', url: 'https://www.youtube.com/@NagdyWP', category_id: 'cat_tools' },
    { id: 'src_yt_davidondrej', name: 'David Ondrej', url: 'https://www.youtube.com/@DavidOndrej', category_id: 'cat_tools' },
    { id: 'src_yt_techwithtim', name: 'Tech With Tim', url: 'https://www.youtube.com/@TechWithTim', category_id: 'cat_tools' },
    { id: 'src_yt_intheworldofai', name: 'In the World of AI', url: 'https://www.youtube.com/@intheworldofai', category_id: 'cat_news' },
    { id: 'src_yt_natebjones', name: 'Nate B Jones', url: 'https://www.youtube.com/@NateBJones', category_id: 'cat_news' },
    { id: 'src_yt_davidbombal', name: 'David Bombal', url: 'https://www.youtube.com/@davidbombal', category_id: 'cat_news' },
    { id: 'src_yt_technovangelist', name: 'Technovangelist', url: 'https://www.youtube.com/@technovangelist', category_id: 'cat_tools' },
    { id: 'src_yt_bycloudai', name: 'bycloud AI', url: 'https://www.youtube.com/@bycloudAI', category_id: 'cat_news' },
    { id: 'src_yt_nicksaraev', name: 'Nick Saraev', url: 'https://www.youtube.com/@nicksaraev', category_id: 'cat_tools' },
    { id: 'src_yt_networkchuck', name: 'NetworkChuck', url: 'https://www.youtube.com/@networkchuck', category_id: 'cat_tools' }
];

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (id, name, color) VALUES (?, ?, ?)');
const insertSource = db.prepare(`
  INSERT OR REPLACE INTO sources (id, type, name, url, category_id, is_active)
  VALUES (?, 'youtube', ?, ?, ?, 1)
`);

db.transaction(() => {
    // Ensure categories exist
    insertCategory.run('cat_tools', 'Tools', '#f59e0b');
    insertCategory.run('cat_news', 'News', '#10b981');

    for (const s of youtubeSources) {
        insertSource.run(s.id, s.name, s.url, s.category_id);
        console.log(`Successfully added/updated source: ${s.name}`);
    }
})();

console.log("\nAll YouTube sources processed successfully.");
db.close();
