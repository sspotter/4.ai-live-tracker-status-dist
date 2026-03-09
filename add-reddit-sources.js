const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'ai-radar.db');
const db = new Database(dbPath);

const redditSources = [
    // Research
    { id: 'src_reddit_artificialintelligence', name: 'r/ArtificialIntelligence', url: 'https://reddit.com/r/ArtificialIntelligence', category_id: 'cat_research' },
    { id: 'src_reddit_machinelearning', name: 'r/MachineLearning', url: 'https://reddit.com/r/MachineLearning', category_id: 'cat_research' },
    { id: 'src_reddit_compsci', name: 'r/compsci', url: 'https://reddit.com/r/compsci', category_id: 'cat_research' },
    { id: 'src_reddit_datascience', name: 'r/DataScience', url: 'https://reddit.com/r/DataScience', category_id: 'cat_research' },
    { id: 'src_reddit_learnmachinelearning', name: 'r/learnmachinelearning', url: 'https://reddit.com/r/learnmachinelearning', category_id: 'cat_research' },
    { id: 'src_reddit_mlquestions', name: 'r/MLQuestions', url: 'https://reddit.com/r/MLQuestions', category_id: 'cat_research' },

    // Models
    { id: 'src_reddit_localllama', name: 'r/LocalLLaMA', url: 'https://reddit.com/r/LocalLLaMA', category_id: 'cat_models' },
    { id: 'src_reddit_stablediffusion', name: 'r/StableDiffusion', url: 'https://reddit.com/r/StableDiffusion', category_id: 'cat_models' },
    { id: 'src_reddit_llmdevs', name: 'r/LLMDevs', url: 'https://reddit.com/r/LLMDevs', category_id: 'cat_models' },
    { id: 'src_reddit_generativeai', name: 'r/GenerativeAI', url: 'https://reddit.com/r/GenerativeAI', category_id: 'cat_models' },
    { id: 'src_reddit_datascienceprojects', name: 'r/datascienceprojects', url: 'https://reddit.com/r/datascienceprojects', category_id: 'cat_models' },

    // News
    { id: 'src_reddit_singularity', name: 'r/singularity', url: 'https://reddit.com/r/singularity', category_id: 'cat_news' },
    { id: 'src_reddit_aitools', name: 'r/AItools', url: 'https://reddit.com/r/AItools', category_id: 'cat_news' },
    { id: 'src_reddit_technology', name: 'r/technology', url: 'https://reddit.com/r/technology', category_id: 'cat_news' },

    // Tools/Dev
    { id: 'src_reddit_openai', name: 'r/OpenAI', url: 'https://reddit.com/r/OpenAI', category_id: 'cat_tools' },
    { id: 'src_reddit_chatgpt', name: 'r/ChatGPT', url: 'https://reddit.com/r/ChatGPT', category_id: 'cat_tools' },
    { id: 'src_reddit_claudeai', name: 'r/ClaudeAI', url: 'https://reddit.com/r/ClaudeAI', category_id: 'cat_tools' },
    { id: 'src_reddit_langchain', name: 'r/LangChain', url: 'https://reddit.com/r/LangChain', category_id: 'cat_tools' },
    { id: 'src_reddit_promptengineering', name: 'r/PromptEngineering', url: 'https://reddit.com/r/PromptEngineering', category_id: 'cat_tools' },
    { id: 'src_reddit_ai_agents', name: 'r/AI_Agents', url: 'https://reddit.com/r/AI_Agents', category_id: 'cat_tools' },
    { id: 'src_reddit_autogpt', name: 'r/AutoGPT', url: 'https://reddit.com/r/AutoGPT', category_id: 'cat_tools' },
    { id: 'src_reddit_programming', name: 'r/programming', url: 'https://reddit.com/r/programming', category_id: 'cat_tools' },
    { id: 'src_reddit_python', name: 'r/Python', url: 'https://reddit.com/r/Python', category_id: 'cat_tools' },
    { id: 'src_reddit_netsec', name: 'r/netsec', url: 'https://reddit.com/r/netsec', category_id: 'cat_tools' },
    { id: 'src_reddit_sysadmin', name: 'r/sysadmin', url: 'https://reddit.com/r/sysadmin', category_id: 'cat_tools' },
    { id: 'src_reddit_devops', name: 'r/devops', url: 'https://reddit.com/r/devops', category_id: 'cat_tools' },
    { id: 'src_reddit_selfhosted', name: 'r/selfhosted', url: 'https://reddit.com/r/selfhosted', category_id: 'cat_tools' },
    { id: 'src_reddit_homelab', name: 'r/homelab', url: 'https://reddit.com/r/homelab', category_id: 'cat_tools' },

    // Startups
    { id: 'src_reddit_sideproject', name: 'r/SideProject', url: 'https://reddit.com/r/SideProject', category_id: 'cat_startups' },
    { id: 'src_reddit_startups', name: 'r/startups', url: 'https://reddit.com/r/startups', category_id: 'cat_startups' }
];

const insertSource = db.prepare(`
  INSERT OR REPLACE INTO sources (id, type, name, url, category_id, is_active)
  VALUES (?, 'subreddit', ?, ?, ?, 1)
`);

db.transaction(() => {
    for (const s of redditSources) {
        insertSource.run(s.id, s.name, s.url, s.category_id);
        console.log(`Successfully added/updated subreddit: ${s.name}`);
    }
})();

console.log("\nAll subreddits processed successfully.");
db.close();
