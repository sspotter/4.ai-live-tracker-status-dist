const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'ai-radar.db');
const db = new Database(dbPath);

const categories = [
    { id: 'cat_model_research', name: 'Model & Research', color: '#3b82f6' },
    { id: 'cat_platforms', name: 'AI Platforms', color: '#8b5cf6' },
    { id: 'cat_workflows', name: 'AI Workflows', color: '#f59e0b' },
    { id: 'cat_infra', name: 'Infrastructure', color: '#ef4444' },
    { id: 'cat_industry', name: 'Industry & Startups', color: '#10b981' },
    { id: 'cat_generative', name: 'Generative AI', color: '#ec4899' }
];

const sources = [
    // Subreddits
    { id: 'src_reddit_ml', type: 'subreddit', name: 'r/MachineLearning', url: 'https://reddit.com/r/MachineLearning', category_id: 'cat_model_research' },
    { id: 'src_reddit_ai', type: 'subreddit', name: 'r/ArtificialIntelligence', url: 'https://reddit.com/r/ArtificialIntelligence', category_id: 'cat_model_research' },
    { id: 'src_reddit_localllama', type: 'subreddit', name: 'r/LocalLLaMA', url: 'https://reddit.com/r/LocalLLaMA', category_id: 'cat_model_research' },

    { id: 'src_reddit_openai', type: 'subreddit', name: 'r/OpenAI', url: 'https://reddit.com/r/OpenAI', category_id: 'cat_platforms' },
    { id: 'src_reddit_claudeai', type: 'subreddit', name: 'r/ClaudeAI', url: 'https://reddit.com/r/ClaudeAI', category_id: 'cat_platforms' },

    { id: 'src_reddit_aitools', type: 'subreddit', name: 'r/AItools', url: 'https://reddit.com/r/AItools', category_id: 'cat_workflows' },
    { id: 'src_reddit_promptengineering', type: 'subreddit', name: 'r/PromptEngineering', url: 'https://reddit.com/r/PromptEngineering', category_id: 'cat_workflows' },
    { id: 'src_reddit_langchain', type: 'subreddit', name: 'r/LangChain', url: 'https://reddit.com/r/LangChain', category_id: 'cat_workflows' },

    { id: 'src_reddit_devops', type: 'subreddit', name: 'r/devops', url: 'https://reddit.com/r/devops', category_id: 'cat_infra' },
    { id: 'src_reddit_sysadmin', type: 'subreddit', name: 'r/sysadmin', url: 'https://reddit.com/r/sysadmin', category_id: 'cat_infra' },
    { id: 'src_reddit_selfhosted', type: 'subreddit', name: 'r/selfhosted', url: 'https://reddit.com/r/selfhosted', category_id: 'cat_infra' },

    { id: 'src_reddit_startups', type: 'subreddit', name: 'r/startups', url: 'https://reddit.com/r/startups', category_id: 'cat_industry' },
    { id: 'src_reddit_technology', type: 'subreddit', name: 'r/technology', url: 'https://reddit.com/r/technology', category_id: 'cat_industry' },

    { id: 'src_reddit_stablediffusion', type: 'subreddit', name: 'r/StableDiffusion', url: 'https://reddit.com/r/StableDiffusion', category_id: 'cat_generative' },
    { id: 'src_reddit_generativeai', type: 'subreddit', name: 'r/GenerativeAI', url: 'https://reddit.com/r/GenerativeAI', category_id: 'cat_generative' },

    // YouTube Channels
    { id: 'src_yt_twominutepapers', type: 'youtube', name: 'Two Minute Papers', url: 'https://www.youtube.com/@twominutepapers', category_id: 'cat_model_research' },
    { id: 'src_yt_aiexplained', type: 'youtube', name: 'AI Explained', url: 'https://www.youtube.com/@aiexplained-official', category_id: 'cat_model_research' },
    { id: 'src_yt_mattwolfe', type: 'youtube', name: 'Matt Wolfe', url: 'https://www.youtube.com/@mreflow', category_id: 'cat_industry' },
    { id: 'src_yt_theaigrid', type: 'youtube', name: 'The AI Grid', url: 'https://www.youtube.com/@TheAIGRID', category_id: 'cat_industry' },
    { id: 'src_yt_wesroth', type: 'youtube', name: 'Wes Roth', url: 'https://www.youtube.com/@WesRoth', category_id: 'cat_industry' },
    { id: 'src_yt_allaboutai', type: 'youtube', name: 'All About AI', url: 'https://www.youtube.com/@AllAboutAI', category_id: 'cat_workflows' },
    { id: 'src_yt_matthewberman', type: 'youtube', name: 'Matthew Berman', url: 'https://www.youtube.com/@matthew_berman', category_id: 'cat_model_research' }
];

db.transaction(() => {
    // 1. Clear everything to ensure a clean state and avoid foreign key issues
    // Order matters: dependent tables first
    db.prepare('DELETE FROM starred_items').run();
    db.prepare('DELETE FROM signals').run();
    db.prepare('DELETE FROM sources').run();
    db.prepare('DELETE FROM categories').run();

    // 2. Insert new categories
    const insertCategory = db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)');
    for (const cat of categories) {
        insertCategory.run(cat.id, cat.name, cat.color);
    }

    // 3. Insert specific active sources
    const insertSource = db.prepare(`
    INSERT INTO sources (id, type, name, url, category_id, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
    for (const s of sources) {
        insertSource.run(s.id, s.type, s.name, s.url, s.category_id);
    }
})();

console.log("Database reorganization complete.");
db.close();
